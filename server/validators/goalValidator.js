const { body } = require("express-validator");

const createGoalValidation = [
  body("goalType")
    .trim()
    .notEmpty()
    .withMessage("Goal Type is required")
    .isIn(["weight loss", "muscle gain", "fat loss"]),
  body("targetValue")
    .notEmpty()
    .withMessage("Target value is required")
    .isFloat({ min: 0 }),
  body("currentValue")
    .notEmpty()
    .withMessage("Current value is required")
    .isFloat({ min: 0 }),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
];

const updateGoalValidation = [
  body("goalType")
    .trim()
    .optional()
    .isIn(["weight loss", "muscle gain", "fat loss"]),
  body("targetValue").optional().isFloat({ min: 0 }),
  body("currentValue").optional().isFloat({ min: 0 }),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
  body("status").optional().isIn(["active", "complete", "inactive"]),
];

module.exports = {
  createGoalValidation,
  updateGoalValidation,
};
