const { body, query } = require("express-validator");

const getWeeklyHealthReportValidation = [
  query("weekStartDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
];

const createWeeklyHealthReportValidation = [
  body("weekStartDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
];

module.exports = {
  getWeeklyHealthReportValidation,
  createWeeklyHealthReportValidation,
};
