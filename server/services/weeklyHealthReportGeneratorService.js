const MealEntry = require("../models/MealEntry");
const PhysicalActivityEntry = require("../models/PhysicalActivityEntry");
const WeeklyHealthReport = require("../models/WeeklyHealthReport");
const BodyMetric = require("../models/BodyMetricEntry");
const Goal = require("../models/Goal");
const { getRecommendations } = require("./recommendationService");
const {
  caloriesTotalCalories,
  maintenanceCalorieCount,
  calculateTotalCaloriesBurned,
} = require("./calorieCalculatorService");

const getWeeklyHealthReportService = async (userId, weekStartDate) => {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const bodyMetric = await BodyMetric.findOne({ userId });
  if (!bodyMetric) throw new Error("No body metrics found for user");

  const { gender, weight, height, age, activityLevel } = bodyMetric;

  const meals = await MealEntry.find({
    userId,
    mealDate: { $gte: start, $lt: end },
  });

  const activities = await PhysicalActivityEntry.find({
    userId,
    date: { $gte: start, $lt: end },
  });

  const caloriesConsumed = caloriesTotalCalories(meals);
  const maintenanceCalories = maintenanceCalorieCount(
    gender,
    weight,
    height,
    age,
    activityLevel,
  );
  const caloriesBurned = calculateTotalCaloriesBurned(
    activities,
    weight / 2.205,
  );

  const activeGoal = await Goal.findOne({
    userId,
    status: "active",
    startDate: { $lte: end },
    $or: [{ endDate: { $gte: start } }, { endDate: null }],
  });

  const goalType = activeGoal?.goalType || "maintain";
  const recommendations = getRecommendations(
    goalType,
    caloriesConsumed,
    caloriesBurned,
  );

  const report = await WeeklyHealthReport.findOneAndUpdate(
    { userId, weekStartDate: start },
    {
      userId,
      weekStartDate: start,
      weekEndDate: end,
      caloriesConsumed,
      caloriesBurned,
      maintenanceCalories,
      recommendations,
    },
    { upsert: true, new: true },
  );

  return report;
};

module.exports = { getWeeklyHealthReportService };
