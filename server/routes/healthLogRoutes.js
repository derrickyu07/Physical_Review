// routes/healthLogTestRoutes.js
const express = require('express');
const router = express.Router();
const {
  testRollUpHealthLog,
  generateWeeklyReport,
} = require('../controllers/healthLogController');
const protect = require('../middleware/authMiddleware');

router.post('/test-rollup', protect, testRollUpHealthLog);
router.post('/test-weekly-report', protect, generateWeeklyReport);

module.exports = router;
