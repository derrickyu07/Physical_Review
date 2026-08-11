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

async function getWeekRecords(userId) {
  const weekEnd = new Date();
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 7);

  return HealthLog.find({
    userId,
    date: { $gte: weekStart, $lte: weekEnd },
  })
    .sort({ date: 1 })
    .lean();
}

const logHealthEntry = async (userId, forDate) => {
  const date = normalizeDate(forDate || new Date());
  const start = new Date(date);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  const activities = await getActivitiesGivenTime(userId, start, end);
  const meals = await getMealsGivenTime(userId, start, end);
  const totalActivityTime = getTotalActivityTime(activities);

  const caloriesOut = totalCaloriesBurned(activities);
  const caloriesIn = totalCaloriesConsumed(meals);

  const totalProtein = getTotalProtein(meals);
  const totalCarbohydrate = getTotalCarbohydrate(meals);
  const totalFat = getTotalFat(meals);

  const { gender, weight, height, age, activityLevel } =
    await getUserMetrics(userId);

  return HealthLog.findOneAndUpdate(
    { userId, date },
    {
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
    { upsert: true, returnDocument: 'after' },
  );
};

module.exports = { logHealthEntry, getWeekRecords };
