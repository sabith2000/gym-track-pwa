const express = require('express');
const router = express.Router();
const { handleSync } = require('../controllers/syncController');
const { resetHistory } = require('../controllers/attendanceController');

// POST /api/attendance/sync → Bi-directional sync (CRDT-lite LWW)
router.post('/sync', handleSync);

// DELETE /api/attendance → Wipe everything ☢️
router.delete('/', resetHistory);

module.exports = router;