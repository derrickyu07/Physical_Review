const { getUserMetrics } = require('../services/bodyMetricService');
const {
  getEntriesForDateRange,
  maintenanceCalorieCount,
  totalCaloriesBurned,
  totalCaloriesConsumed,
  remainingCalories,
} = require('../services/calorieCalculatorService');
const { buildDateRange } = require('../utils/dateUtils');

const getCalorieSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'startDate and endDate are required' });
    }
    const range = buildDateRange(startDate, endDate);
    if (!range) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    const { start, end } = range;
    const userId = req.user._id;
    const { meals, activities } = await getEntriesForDateRange(
      userId,
      start,
      end,
    );
    const bodyMetric = await getUserMetrics(userId);
    if (!bodyMetric) {
      return res
        .status(404)
        .json({ message: 'No body metrics found for this user' });
    }
    const caloriesBurned = totalCaloriesBurned(activities);
    const caloriesConsumed = totalCaloriesConsumed(meals);
    const maintenanceCalories = maintenanceCalorieCount(
      bodyMetric.gender,
      bodyMetric.weight,
      bodyMetric.height,
      bodyMetric.age,
      bodyMetric.activityLevel,
    );

    res.status(200).json({
      caloriesConsumed,
      caloriesBurned,
      remainingCalories: remainingCalories(
        maintenanceCalories,
        caloriesConsumed,
        caloriesBurned,
      ),
      startDate: start,
      endDate: end,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getCalorieSummary,
};
