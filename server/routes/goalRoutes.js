const express = require("express");
const router = express.Router();
const validation = require("../middleware/validationMiddleware");
const protect = require("../middleware/authMiddleware");
const {
  createGoalValidation,
  updateGoalValidation,
} = require("../validators/goalValidator");

const {
  createGoal,
  updateGoal,
  getGoal,
  deleteGoal,
  getGoals,
} = require("../controllers/goalController");

router.post("/", protect, createGoalValidation, validation, createGoal);

router.put("/:id", protect, updateGoalValidation, validation, updateGoal);

router.get("/:id", protect, getGoal);

router.get("/", protect, getGoals);

router.delete("/:id", protect, deleteGoal);

module.exports = router;
