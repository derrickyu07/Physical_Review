const express = require('express');
const router = express.Router();

const validation = require('../middleware/validationMiddleware');
const protect = require('../middleware/authMiddleware');
const {
  updateBodyMetricValidation,
  createBodyMetricValidation,
} = require('../validators/bodyMetricValidator');
const {
  updateBodyMetric,
  getBodyMetric,
  createBodyMetric,
} = require('../controllers/bodyMetricController');

router.put(
  '/:id',
  protect,
  updateBodyMetricValidation,
  validation,
  updateBodyMetric,
);

router.get('/', protect, getBodyMetric);

router.post(
  '/',
  protect,
  createBodyMetricValidation,
  validation,
  createBodyMetric,
);

module.exports = router;
