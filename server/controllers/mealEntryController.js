const {
  createMealEntryService,
  updateMealEntryService,
  getMealEntryService,
  deleteMealService,
  getMealsService,
} = require('../services/mealService.js');
const { isMissing } = require('../utils/validation.js');

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
      return res.status(400).json({ message: 'please fill required fields' });
    }
    const userId = req.user.id;

    const mealEntry = await createMealEntryService({
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
    res.status(201).json(mealEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMealEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedMealEntry = await updateMealEntryService({
      id,
      userId: req.user._id,
      updates,
    });
    if (!updatedMealEntry) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.status(200).json(updatedMealEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMealEntry = async (req, res) => {
  try {
    const mealEntry = await getMealEntryService(req.params.id, req.user._id);
    if (!mealEntry) {
      return res.status(404).json({ message: 'Could not find the meal entry' });
    }
    res.status(200).json(mealEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllMealEntry = async (req, res) => {
  try {
    const mealEntries = await getMealsService(req.user._id);
    res.status(200).json(mealEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMealEntry = async (req, res) => {
  try {
    const deletedMealEntry = await deleteMealService(
      req.params.id,
      req.user._id,
    );
    if (!deletedMealEntry) {
      return res.status(404).json({ message: 'meal entry not found' });
    }
    res.status(200).json({ message: 'meal entry was successfully deleted' });
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
