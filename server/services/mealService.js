const MealEntry = require('../models/MealEntry');

async function getMealsGivenTime(userId, start, end) {
  const mealEntries = await MealEntry.find({
    userId,
    mealDate: { $gte: start, $lte: end },
  });
  return mealEntries;
}

function getTotalProtein(meals) {
  const totalProtein = meals.reduce(
    (total, { protein }) => total + (protein ?? 0),
    0,
  );

  return totalProtein;
}

function getTotalCarbohydrate(meals) {
  const totalCarbohydrate = meals.reduce(
    (total, { carbohydrates }) => total + (carbohydrates ?? 0),
    0,
  );

  return totalCarbohydrate;
}

function getTotalFat(meals) {
  const totalFat = meals.reduce((total, { fat }) => total + (fat ?? 0), 0);
  return totalFat;
}

async function createMealEntryService({
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
}) {
  const mealEntry = await MealEntry.create({
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
  return mealEntry;
}

async function updateMealEntryService({ id, userId, updates }) {
  const updatedMealEntry = await MealEntry.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  return updatedMealEntry;
}

async function getMealEntryService(id, userId) {
  const mealEntry = await MealEntry.findOne({
    _id: id,
    userId,
  });
  return mealEntry;
}

async function getMealsService(userId) {
  const mealEntries = await MealEntry.find({ userId }).sort({
    mealDate: -1,
  });
  return mealEntries;
}

async function deleteMealService(id, userId) {
  const deletedMealEntry = await MealEntry.findOneAndDelete({
    _id: id,
    userId,
  });
  return deletedMealEntry;
}
module.exports = {
  getMealsGivenTime,
  getTotalProtein,
  getTotalCarbohydrate,
  getTotalFat,
  createMealEntryService,
  updateMealEntryService,
  getMealEntryService,
  getMealsService,
  deleteMealService,
};
