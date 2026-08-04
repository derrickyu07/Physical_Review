const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

const {
  getUploadUrl,
  confirmUpload,
  getDownloadUrl,
  getReports,
  createWeeklyReport,
  deleteWeeklyReport,
} = require('../controllers/reportController');

router.post('/upload-url', protect, getUploadUrl);
router.post('/:id/confirm', protect, confirmUpload);
router.get('/:id/download-url', protect, getDownloadUrl);
router.get('/get-user-reports', protect, getReports);
router.post('/create-report', protect, createWeeklyReport);
router.delete('/:id', protect, deleteWeeklyReport);

module.exports = router;
