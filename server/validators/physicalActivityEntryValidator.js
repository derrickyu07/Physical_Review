const { body } = require("express-validator");

const createPhysicalActivityValidation = [
  body("caloriesBurned")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Calories burned must be 0 or greater"),
  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isFloat({ min: 0 })
    .withMessage("Duration must 0 or greater"),
  body("activityType")
    .notEmpty()
    .withMessage("Activity type is required")
    .isIn([
      "running",
      "walking",
      "cycling",
      "weightlifting",
      "basketball",
      "soccer",
      "swimming",
      "hiking",
      "yoga",
      "boxing",
      "tennis",
      "crossfit",
    ]),
  body("intensity")
    .notEmpty()
    .withMessage("Intensity is required")
    .isIn(["light", "moderate", "intense"]),
  body("activityDate")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
];

const updatePhysicalActivityValidation = [
  body("caloriesBurned")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Calories burned must be 0 or greater"),
  body("duration")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Duration must 0 or greater"),
  body("activityType")
    .notEmpty()
    .withMessage("Activity type is required")
    .isIn([
      "running",
      "walking",
      "cycling",
      "weightlifting",
      "basketball",
      "soccer",
      "swimming",
      "hiking",
      "yoga",
      "boxing",
      "tennis",
      "crossfit",
    ]),
  body("intensity").optional().isIn(["light", "moderate", "intense"]),
  body("activityDate")
    .optional()
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
];

module.exports = {
  createPhysicalActivityValidation,
  updatePhysicalActivityValidation,
};
