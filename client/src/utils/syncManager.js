import { get, set, del } from 'idb-keyval';

// --- IDB KEYS ---
const RECORDS_KEY = 'gym-records';       // { "2026-03-11": { status, updatedAt, deviceId } }
const QUEUE_KEY = 'gym-sync-queue';      // [{ date, status, updatedAt, deviceId }, ...]
const LAST_SYNC_KEY = 'gym-last-sync-ts'; // Number (epoch ms)
const DEVICE_ID_KEY = 'gym-device-id';   // String (UUID)

// =============================================
// 1. DEVICE ID (Generated once, lives forever)
// =============================================
export const getDeviceId = async () => {
  let id = await get(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    await set(DEVICE_ID_KEY, id);
  }
  return id;
};

// =============================================
// 2. RECORDS STORE (Full local database)
// =============================================
// Shape: { "2026-03-11": { status: "PRESENT", updatedAt: 1710185000000, deviceId: "abc" } }

export const getRecords = async () => {
  return (await get(RECORDS_KEY)) || {};
};

export const saveRecords = async (records) => {
  await set(RECORDS_KEY, records);
};

// =============================================
// 3. SYNC QUEUE (Pending changes)
// =============================================

export const getQueue = async () => {
  return (await get(QUEUE_KEY)) || [];
};

// Add a change to the queue (de-dupes by date, keeps the latest updatedAt)
export const addToQueue = async (change) => {
  const queue = await getQueue();
  // Remove any existing entry for the same date (the new one is always newer)
  const filtered = queue.filter((q) => q.date !== change.date);
  filtered.push(change);
  await set(QUEUE_KEY, filtered);
};

// Remove only the specific items that were successfully sent
// (new edits added mid-sync won't be lost)
export const removeFromQueue = async (sentItems) => {
  const currentQueue = await getQueue();
  const sentDates = new Set(sentItems.map((i) => i.date));
  const remaining = currentQueue.filter((q) => {
    // Keep if the date wasn't sent, OR if a newer edit was made after the sent one
    const sent = sentItems.find((s) => s.date === q.date);
    if (!sent) return true; // Not in sent batch — keep
    return q.updatedAt > sent.updatedAt; // Newer local edit — keep
  });
  await set(QUEUE_KEY, remaining);
};

// =============================================
// 4. SYNC TIMESTAMP CURSOR
// =============================================

export const getLastSyncTimestamp = async () => {
  return (await get(LAST_SYNC_KEY)) || 0;
};

export const saveLastSyncTimestamp = async (ts) => {
  await set(LAST_SYNC_KEY, ts);
};

// =============================================
// 5. UTILITIES
// =============================================

// Convert rich records map → simple status map for UI components
// { "2026-03-11": { status, updatedAt, deviceId } } → { "2026-03-11": "PRESENT" }
export const getStatusMap = (records) => {
  const map = {};
  for (const [date, record] of Object.entries(records)) {
    map[date] = record.status;
  }
  return map;
};

// Merge server updates into local records (LWW + deviceId tie-breaker)
export const mergeServerUpdates = (localRecords, serverUpdates) => {
  const merged = { ...localRecords };
  for (const update of serverUpdates) {
    const existing = merged[update.date];
    const existingTs = existing?.updatedAt || 0;
    const incomingTs = update.updatedAt || 0;

    // Accept if: no local record, incoming is newer, or tie-break by deviceId
    const shouldAccept =
      !existing ||
      incomingTs > existingTs ||
      (incomingTs === existingTs && (update.deviceId || '') > (existing.deviceId || ''));

    if (shouldAccept) {
      merged[update.date] = {
        status: update.status,
        updatedAt: update.updatedAt,
        deviceId: update.deviceId,
      };
    }
  }
  return merged;
};

// Nuke everything (used by "Reset History" in Settings)
export const clearAllLocalData = async () => {
  await del(RECORDS_KEY);
  await del(QUEUE_KEY);
  await del(LAST_SYNC_KEY);
  // Note: We keep DEVICE_ID_KEY — the device identity survives resets
};