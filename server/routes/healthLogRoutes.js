// routes/healthLogTestRoutes.js
const express = require('express');
const router = express.Router();
const {
  createHealthLog,
  generateWeeklyReport,
} = require('../controllers/healthLogController');
const protect = require('../middleware/authMiddleware');

router.post('/create-healthLog', protect, createHealthLog);
router.post('/test-weekly-report', protect, generateWeeklyReport);

module.exports = router;
