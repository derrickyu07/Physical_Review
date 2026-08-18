const {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
} = require('../constants/calories');
const MealEntry = require('../models/MealEntry');
const PhysicalActivityEntry = require('../models/PhysicalActivityEntry');

const netCalories = (caloriesBurned, caloriesConsumed) => {
  return caloriesConsumed - caloriesBurned;
};

const remainingCalories = (
  maintenanceCalories,
  caloriesConsumed,
  caloriesBurned,
) => {
  return Math.round(maintenanceCalories - caloriesConsumed + caloriesBurned);
};

const totalCaloriesConsumed = (meals) => {
  return meals.reduce((total, meal) => {
    return total + (meal.calories || 0);
  }, 0);
};

const totalCaloriesBurned = (activities) => {
  return activities.reduce((total, activity) => {
    return total + (activity.caloriesBurned || 0);
  }, 0);
};

const maintenanceCalorieCount = (
  gender,
  weight,
  height,
  age,
  activityLevel,
) => {
  const weightInKg = Number(weight) / 2.205;
  const heightInCm = height * 2.54;
  const temp = gender === 'male' ? 5 : -161;
  const multiplier =
    ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary;
  const bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + temp;

  return bmr * multiplier;
};

const targetCalorieCount = (maintenance, goalType, intensity) => {
  let adjustment;
  if (goalType === 'maintain') {
    adjustment = 0;
  } else {
    adjustment = GOAL_ADJUSTMENTS[goalType]?.[intensity] ?? 0;
  }
  return maintenance + adjustment;
};

const getEntriesForDateRange = async (userId, start, end) => {
  const [meals, activities] = await Promise.all([
    MealEntry.find({ userId, mealDate: { $gte: start, $lte: end } }),
    PhysicalActivityEntry.find({
      userId,
      activityDate: { $gte: start, $lte: end },
    }),
    PhysicalActivityEntry.findOne({ userId }),
  ]);
  return { meals, activities };
};

module.exports = {
  netCalories,
  totalCaloriesConsumed,
  totalCaloriesBurned,
  maintenanceCalorieCount,
  targetCalorieCount,
  getEntriesForDateRange,
  remainingCalories,
};
