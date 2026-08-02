const express = require("express");
const router = express.Router();

const validation = require("../middleware/validationMiddleware");
const protect = require("../middleware/authMiddleware");
const {
  createMealEntryValidation,
  updateMealEntryValidation,
} = require("../validators/mealEntryValidator");

const {
  createMealEntry,
  updateMealEntry,
  getMealEntry,
  getMealsEntry,
  deleteMealEntry,
  getAllMealEntry,
} = require("../controllers/mealEntryController");

router.post(
  "/",
  protect,
  createMealEntryValidation,
  validation,
  createMealEntry,
);

router.put(
  "/:id",
  protect,
  updateMealEntryValidation,
  validation,
  updateMealEntry,
);

router.get("/:id", protect, getMealEntry);

router.get("/", protect, getAllMealEntry);

router.delete("/:id", protect, deleteMealEntry);

module.exports = router;
