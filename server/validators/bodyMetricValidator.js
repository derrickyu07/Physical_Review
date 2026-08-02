const { body } = require('express-validator');

const updateBodyMetricValidation = [
  body('height')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Gender must be male or female'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('activityLevel')
    .optional()
    .isIn([
      'sedentary',
      'light',
      'moderate',
      'active',
      'veryActive',
      'extremelyActive',
    ])
    .withMessage('input a valid activityLevel'),
];

const createBodyMetricValidation = [
  body('height')
    .notEmpty()
    .withMessage('Height is required')
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  body('weight')
    .notEmpty()
    .withMessage('Weight is required')
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('gender')
    .isIn(['male', 'female'])
    .withMessage('Gender must be male or female'),
  body('age')
    .notEmpty()
    .withMessage('Age is required')
    .isInt({ min: 1 })
    .withMessage('Age must be over 0 and a whole number'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('activityLevel')
    .notEmpty()
    .withMessage('activityLevel is required')
    .isIn([
      'sedentary',
      'light',
      'moderate',
      'active',
      'veryActive',
      'extremelyActive',
    ])
    .withMessage('input a valid activityLevel'),
];

module.exports = {
  updateBodyMetricValidation,
  createBodyMetricValidation,
};
