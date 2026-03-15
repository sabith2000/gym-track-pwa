const Attendance = require('../models/Attendance');
const SyncMeta = require('../models/SyncMeta');

// --- VALIDATION HELPERS ---
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
  return date.toISOString().startsWith(dateString);
};

const VALID_STATUSES = ['PRESENT', 'ABSENT'];
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const DEFAULT_USER_ID = 'default_user';

// @desc    Bi-directional sync endpoint (CRDT-lite / LWW)
// @route   POST /api/attendance/sync
const handleSync = async (req, res) => {
  try {
    const { lastSyncTimestamp = 0, deviceId, changes = [] } = req.body;

    // --- 1. VALIDATE REQUEST ---
    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid deviceId.' });
    }

    if (typeof lastSyncTimestamp !== 'number') {
      return res
        .status(400)
        .json({ message: 'lastSyncTimestamp must be a number.' });
    }

    // --- 2. VALIDATE & FILTER CHANGES ---
    const serverNow = Date.now();
    const validChanges = [];

    for (const change of changes) {
      // Basic field checks
      if (!change.date || !change.status || !change.updatedAt) {
        continue; // Skip malformed entries silently
      }
      if (!isValidDate(change.date)) continue;
      if (!VALID_STATUSES.includes(change.status)) continue;
      if (typeof change.updatedAt !== 'number') continue;

      // 🛡️ Clock-drift guard: reject timestamps > 24h in the future
      if (change.updatedAt > serverNow + TWENTY_FOUR_HOURS_MS) {
        console.warn(
          `⏰ [Sync] Rejected future timestamp for ${change.date}: ${change.updatedAt}`
        );
        continue;
      }

      validChanges.push(change);
    }

    // --- 3. ATOMIC BULKWRITE (Last-Write-Wins at DB level) ---
    if (validChanges.length > 0) {
      const bulkOps = validChanges.map((change) => ({
        updateOne: {
          filter: { userId: DEFAULT_USER_ID, date: change.date },
          update: [
            {
              $set: {
                userId: DEFAULT_USER_ID,
                date: change.date,
                // LWW condition: incoming wins if:
                //   1. Record is new ($updatedAt doesn't exist)
                //   2. Incoming timestamp is strictly newer
                //   3. Timestamps tie → higher deviceId wins (deterministic tie-breaker)
                status: {
                  $cond: [
                    {
                      $or: [
                        { $eq: [{ $ifNull: ['$updatedAt', 0] }, 0] },
                        { $lt: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                        {
                          $and: [
                            { $eq: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                            { $lt: [{ $ifNull: ['$deviceId', ''] }, change.deviceId || deviceId] },
                          ],
                        },
                      ],
                    },
                    change.status,
                    '$status',
                  ],
                },
                updatedAt: {
                  $cond: [
                    {
                      $or: [
                        { $eq: [{ $ifNull: ['$updatedAt', 0] }, 0] },
                        { $lt: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                        {
                          $and: [
                            { $eq: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                            { $lt: [{ $ifNull: ['$deviceId', ''] }, change.deviceId || deviceId] },
                          ],
                        },
                      ],
                    },
                    change.updatedAt,
                    '$updatedAt',
                  ],
                },
                deviceId: {
                  $cond: [
                    {
                      $or: [
                        { $eq: [{ $ifNull: ['$updatedAt', 0] }, 0] },
                        { $lt: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                        {
                          $and: [
                            { $eq: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                            { $lt: [{ $ifNull: ['$deviceId', ''] }, change.deviceId || deviceId] },
                          ],
                        },
                      ],
                    },
                    change.deviceId || deviceId,
                    '$deviceId',
                  ],
                },
                // Server-stamped: only update when the incoming change WINS
                // This is the cursor field — ensures delayed offline edits are visible
                serverModifiedAt: {
                  $cond: [
                    {
                      $or: [
                        { $eq: [{ $ifNull: ['$updatedAt', 0] }, 0] },
                        { $lt: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                        {
                          $and: [
                            { $eq: [{ $ifNull: ['$updatedAt', 0] }, change.updatedAt] },
                            { $lt: [{ $ifNull: ['$deviceId', ''] }, change.deviceId || deviceId] },
                          ],
                        },
                      ],
                    },
                    serverNow,
                    { $ifNull: ['$serverModifiedAt', 0] },
                  ],
                },
              },
            },
          ],
          upsert: true,
        },
      }));

      await Attendance.bulkWrite(bulkOps);
      console.log(
        `📡 [Sync] Processed ${validChanges.length} change(s) from device ${deviceId}`
      );
    }

    // --- 4. DETECT RESET ---
    const totalRecordsCount = await Attendance.countDocuments({ userId: DEFAULT_USER_ID });
    const resetMeta = await SyncMeta.findOne({ key: 'lastResetTimestamp' }).lean();
    
    let wasReset = false;
    if (resetMeta && lastSyncTimestamp > 0 && resetMeta.value > lastSyncTimestamp) {
      wasReset = true; // Clean reset via app API
    } else if (lastSyncTimestamp > 0 && totalRecordsCount === 0) {
      wasReset = true; // Hard reset via direct DB deletion
    }

    // --- 5. FETCH UPDATES FOR CLIENT ---
    // Use serverModifiedAt for the cursor query (not updatedAt!)
    // This ensures delayed offline edits are always picked up by other devices
    const updates = await Attendance.find(
      {
        userId: DEFAULT_USER_ID,
        ...(wasReset ? {} : { serverModifiedAt: { $gt: lastSyncTimestamp } }),
      },
      { _id: 0, __v: 0, userId: 0, serverModifiedAt: 0 }
    ).lean();

    // --- 6. RESPOND ---
    res.status(200).json({
      success: true,
      serverTimestamp: Date.now(),
      wasReset: !!wasReset,
      updates,
    });
  } catch (error) {
    console.error('❌ [Sync] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleSync };
