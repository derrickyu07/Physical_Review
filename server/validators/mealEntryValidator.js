const { body } = require("express-validator");

const createMealEntryValidation = [
  body("name").trim().notEmpty().withMessage("Activity name is required"),
  body("calories")
    .notEmpty()
    .withMessage("Number of calories is required")
    .isFloat({ min: 0 })
    .withMessage("Calories must be 0 or greater"),
  body("fat")
    .notEmpty()
    .withMessage("Number of fat in grams is required")
    .isFloat({ min: 0 })
    .withMessage("fat must be 0 or greater"),
  body("carbohydrates")
    .notEmpty()
    .withMessage("Number of carbohydrates in grams is required")
    .isFloat({ min: 0 })
    .withMessage("carbohydrates must be 0 or greater"),
  body("protein")
    .notEmpty()
    .withMessage("Number of protein in grams is required")
    .isFloat({ min: 0 })
    .withMessage("protein must be 0 or greater"),
  body("mealDate")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be valid ISO date"),
  body("mealType")
    .notEmpty()
    .withMessage("Meal type is required")
    .isIn(["breakfast", "lunch", "dinner", "snack"]),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isFloat({ min: 0 })
    .withMessage("Quantity must be 0 or greater"),
  body("micronutrients")
    .optional()
    .isObject()
    .withMessage("Micronutrients must be an object"),

  body("micronutrients.vitaminA")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Vitamin A must be 0 or greater"),

  body("micronutrients.vitaminC")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Vitamin C must be 0 or greater"),

  body("micronutrients.calcium")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Calcium must be 0 or greater"),

  body("micronutrients.iron")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Iron must be 0 or greater"),

  body("micronutrients.potassium")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Potassium must be 0 or greater"),

  body("micronutrients.sodium")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Sodium must be 0 or greater"),
];

const updateMealEntryValidation = [
  body("name").trim().notEmpty().withMessage("Meal name is required"),
  body("calories")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Calories must be 0 or greater"),
  body("fat")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("fat must be 0 or greater"),
  body("carbohydrates")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("carbohydrates must be 0 or greater"),
  body("protein")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("protein must be 0 or greater"),
  body("mealType").optional().isIn(["breakfast", "lunch", "dinner", "snack"]),
  body("quantity")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Quantity must be 0 or greater"),
  body("micronutrients")
    .optional()
    .isObject()
    .withMessage("Micronutrients must be an object"),

  body("micronutrients.vitaminA")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Vitamin A must be 0 or greater"),

  body("micronutrients.vitaminC")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Vitamin C must be 0 or greater"),

  body("micronutrients.calcium")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Calcium must be 0 or greater"),

  body("micronutrients.iron")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Iron must be 0 or greater"),

  body("micronutrients.potassium")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Potassium must be 0 or greater"),

  body("micronutrients.sodium")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Sodium must be 0 or greater"),
];

module.exports = {
  createMealEntryValidation,
  updateMealEntryValidation,
};
