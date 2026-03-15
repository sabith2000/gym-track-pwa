const Attendance = require('../models/Attendance');
const SyncMeta = require('../models/SyncMeta');

const DEFAULT_USER_ID = 'default_user';

// @desc    Delete ALL attendance records (Danger Zone)
// @route   DELETE /api/attendance
const resetHistory = async (req, res) => {
  try {
    await Attendance.deleteMany({ userId: DEFAULT_USER_ID });

    // Leave a breadcrumb so other devices know a reset happened
    await SyncMeta.findOneAndUpdate(
      { key: 'lastResetTimestamp' },
      { value: Date.now() },
      { upsert: true }
    );

    res.status(200).json({ message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { resetHistory };