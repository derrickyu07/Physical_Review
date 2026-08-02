const MealEntry = require("../models/MealEntry");
const { isMissing } = require("../utils/validation.js");

const createMealEntry = async (req, res) => {
  try {
    const {
      name,
      calories,
      fat,
      carbohydrates,
      protein,
      mealDate,
      mealType,
      quantity,
      micronutrients,
    } = req.body;
    if (
      !name ||
      isMissing(calories) ||
      isMissing(fat) ||
      isMissing(carbohydrates) ||
      isMissing(protein) ||
      !mealDate ||
      !mealType ||
      !quantity
    ) {
      return res.status(404).json({ message: "please fill required fields" });
    }
    const userId = req.user.id;

    const userMealEntry = await MealEntry.create({
      userId,
      name,
      calories,
      fat,
      carbohydrates,
      protein,
      mealDate,
      mealType,
      quantity,
      micronutrients,
    });
    res.status(201).json(userMealEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMealEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const meal = await MealEntry.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    res.status(200).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMealEntry = async (req, res) => {
  try {
    const mealEntry = await MealEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!mealEntry) {
      return res.status(404).json({ message: "Could not find the meal entry" });
    }
    res.status(200).json(mealEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllMealEntry = async (req, res) => {
  try {
    const meals = await MealEntry.find({
      userId: req.user._id,
    }).sort({ mealDate: -1 });
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMealEntry = async (req, res) => {
  try {
    const mealEntry = MealEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!mealEntry) {
      return res.status(404).json({ message: "meal entry not found" });
    }
    res.status(200).json({ message: "meal entry was successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMealEntry,
  updateMealEntry,
  getMealEntry,
  deleteMealEntry,
  getAllMealEntry,
};
