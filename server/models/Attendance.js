const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
  // Multi-user ready, but defaults to single user for now
  userId: {
    type: String,
    required: true,
    default: 'default_user',
  },

  // The calendar date. Format: YYYY-MM-DD (e.g., "2026-03-15")
  date: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid date format! Use YYYY-MM-DD.`,
    },
  },

  // PRESENT or ABSENT
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT'],
    required: true,
  },

  // LWW timestamp — epoch milliseconds (e.g., 1710185000000)
  updatedAt: {
    type: Number,
    required: true,
  },

  // Fingerprint of the device that made this edit
  deviceId: {
    type: String,
    required: true,
  },

  // Server-stamped timestamp — set by the server during BulkWrite
  // Used ONLY for sync cursor queries (not for LWW conflict resolution)
  serverModifiedAt: {
    type: Number,
    default: 0,
  },
});

// 🛡️ Compound unique index — guarantees one record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);