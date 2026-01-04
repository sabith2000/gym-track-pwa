const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    // The date is the unique ID. Format: YYYY-MM-DD (e.g., "2026-01-02")
    date: {
      type: String,
      required: true,
      unique: true,
      // NEW: Iron Gate Validation 🛡️
      validate: {
        validator: function(v) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v); // Enforce YYYY-MM-DD
        },
        message: props => `${props.value} is not a valid date format! Use YYYY-MM-DD.`
      }
    },
    
    // The current active status
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT'],
      required: true,
    },

    // The Audit Trail
    history: [
      {
        action: { type: String, required: true }, 
        timestamp: { type: Date, default: Date.now }, 
        device: { type: String, default: 'web' } 
      }
    ]
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);