const HealthLog = require('../models/HealthLog');
const {
  getActivitiesGivenTime,
  getTotalActivityTime,
} = require('./activityService');
const { getUserMetrics } = require('./bodyMetricService');
const {
  totalCaloriesBurned,
  totalCaloriesConsumed,
} = require('./calorieCalculatorService');
const {
  getMealsGivenTime,
  getTotalProtein,
  getTotalCarbohydrate,
  getTotalFat,
} = require('./mealService');

function normalizeDate(rawDate) {
  const d = new Date(rawDate);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const defaultDeps = {
  HealthLog,
  getActivitiesGivenTime,
  getTotalActivityTime,
  getUserMetrics,
  totalCaloriesBurned,
  totalCaloriesConsumed,
  getMealsGivenTime,
  getTotalProtein,
  getTotalCarbohydrate,
  getTotalFat,
};

async function getWeekRecords(userId, deps = defaultDeps) {
  const weekEnd = new Date();
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 7);

  return deps.HealthLog.find({
    userId,
    date: { $gte: weekStart, $lte: weekEnd },
  })
    .sort({ date: 1 })
    .lean();
}

const logHealthEntry = async (userId, forDate, deps = defaultDeps) => {
  const date = normalizeDate(forDate || new Date());
  const start = new Date(date);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  const activities = await deps.getActivitiesGivenTime(userId, start, end);
  const meals = await deps.getMealsGivenTime(userId, start, end);
  const totalActivityTime = deps.getTotalActivityTime(activities);

  const caloriesOut = deps.totalCaloriesBurned(activities);
  const caloriesIn = deps.totalCaloriesConsumed(meals);

  const totalProtein = deps.getTotalProtein(meals);
  const totalCarbohydrate = deps.getTotalCarbohydrate(meals);
  const totalFat = deps.getTotalFat(meals);

  const { gender, weight, height, age, activityLevel } =
    await deps.getUserMetrics(userId);

  return deps.HealthLog.findOneAndUpdate(
    { userId, date },
    {
      $set: {
        userId,
        date,
        activeMinutes: totalActivityTime,
        caloriesIn,
        caloriesOut,
        proteinG: totalProtein,
        carbohydrates: totalCarbohydrate,
        fat: totalFat,
        weightLbs: weight,
        heightIn: height,
        age,
        gender,
        activityLevel,
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
};

module.exports = { logHealthEntry, getWeekRecords, normalizeDate };
