// server/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    // The date is the unique ID. Format: YYYY-MM-DD (e.g., "2026-01-02")
    date: {
      type: String,
      required: true,
      unique: true, // Prevents two entries for the same day
    },
    
    // The current active status
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT'],
      required: true,
    },

    // The Audit Trail (Your "Correction Strategy")
    history: [
      {
        action: { type: String, required: true }, // e.g., "marked_present", "correction_to_absent"
        timestamp: { type: Date, default: Date.now }, // Exact time of click
        device: { type: String, default: 'web' } // Helpful if you add mobile later
      }
    ]
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);