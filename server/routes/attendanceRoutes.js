// server/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { getHistory, markAttendance } = require('../controllers/attendanceController');

// When someone visits /api/attendance...
router.get('/', getHistory);   // GET request -> Fetch history
router.post('/', markAttendance); // POST request -> Mark/Update attendance

module.exports = router;