const Attendance = require('../models/Attendance');

// --- VALIDATION HELPERS ---
const isValidDate = (dateString) => {
  // 1. Check Format (YYYY-MM-DD)
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  // 2. Check Logical Validity (e.g., rejects 2026-02-31)
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
  
  return date.toISOString().startsWith(dateString);
};

const VALID_STATUSES = ['PRESENT', 'ABSENT'];

// @desc    Get all attendance records
// @route   GET /api/attendance
const getHistory = async (req, res) => {
  try {
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

  // =================================================
  // 1. INPUT VALIDATION (The Guard)
  // =================================================
  
  if (!date || !status) {
    return res.status(400).json({ message: 'Missing fields: Date and Status are required.' });
  }

  if (!isValidDate(date)) {
    return res.status(400).json({ message: 'Invalid Date Format. Required: YYYY-MM-DD' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ 
      message: `Invalid Status. Allowed: ${VALID_STATUSES.join(', ')}` 
    });
  }

  // =================================================

  try {
    let record = await Attendance.findOne({ date });

    if (record) {
      // --- UPDATE EXISTING RECORD ---
      record.history.push({
        action: `corrected_to_${status.toLowerCase()}`,
        timestamp: new Date(),
        device: 'web_client'
      });

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