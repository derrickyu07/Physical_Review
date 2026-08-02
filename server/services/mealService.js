const MealEntry = require('../models/MealEntry');

async function getMealsGivenTime(userId, start, end) {
  const activities = await MealEntry.find({
    userId,
    mealDate: { $gte: start, $lte: end },
  });
  return activities;
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

module.exports = {
  getMealsGivenTime,
  getTotalProtein,
  getTotalCarbohydrate,
  getTotalFat,
};
