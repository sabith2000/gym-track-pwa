const express = require('express');
const router = express.Router();
// Import the new resetHistory function
const { getHistory, markAttendance, resetHistory } = require('../controllers/attendanceController');

// When someone visits /api/attendance...
router.get('/', getHistory);      // GET -> Fetch history
router.post('/', markAttendance); // POST -> Mark/Update
router.delete('/', resetHistory); // DELETE -> Wipe everything ☢️

module.exports = router;