// server/controllers/attendanceController.js
const Attendance = require('../models/Attendance');

// @desc    Get all attendance records
// @route   GET /api/attendance
const getHistory = async (req, res) => {
  try {
    // Return all records, sorted by date (newest first)
    const history = await Attendance.find().sort({ date: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark or Update attendance
// @route   POST /api/attendance
const markAttendance = async (req, res) => {
  const { date, status } = req.body;

  // Validation: Ensure we have data
  if (!date || !status) {
    return res.status(400).json({ message: 'Date and Status are required' });
  }

  try {
    // 1. Check if a record already exists for this date
    let record = await Attendance.findOne({ date });

    if (record) {
      // --- UPDATE EXISTING RECORD ---
      
      // Add the OLD status to the history trail before changing it
      record.history.push({
        action: `corrected_to_${status.toLowerCase()}`,
        timestamp: new Date(),
        device: 'web_client' // We can make this dynamic later
      });

      // Update the main status
      record.status = status;
      
      const updatedRecord = await record.save();
      res.status(200).json(updatedRecord);

    } else {
      // --- CREATE NEW RECORD ---
      const newRecord = await Attendance.create({
        date,
        status,
        history: [{
          action: 'initial_mark',
          timestamp: new Date(),
          device: 'web_client'
        }]
      });
      
      res.status(201).json(newRecord);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHistory,
  markAttendance,
};