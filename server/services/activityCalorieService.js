const ACTIVITY_MET = require('../constants/activityMet');
const { getUserMetrics } = require('./bodyMetricService');

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '');

const getCaloriesBurned = async ({
  userId,
  activityType,
  duration,
  intensity,
}) => {
  const bodyMetric = await getUserMetrics(userId);
  if (!bodyMetric) {
    throw new Error('No bodymetric found for this user');
  }

  const weightKg = bodyMetric.weight / 2.205;

  return calculateCaloriesBurned({
    activity: activityType,
    durationMinutes: Number(duration),
    intensity,
    weightKg,
  });
};

const getMet = (activity, intensity = 'moderate') => {
  const act = normalize(activity);
  const level = normalize(intensity);

  const activityData = ACTIVITY_MET[act];

  if (!activityData) {
    throw new Error('Unsupported activity');
  }
  return activityData[level] || activityData.moderate;
};

const calculateCaloriesBurned = ({
  activity,
  durationMinutes,
  intensity = 'moderate',
  weightKg,
}) => {
  if (!activity || !durationMinutes || !weightKg) {
    throw new Error('Missing required fields');
  }
  const met = getMet(activity, intensity);

  const hours = durationMinutes / 60;
  const calories = met * weightKg * hours;
  return Math.round(calories);
};

module.exports = {
  getMet,
  calculateCaloriesBurned,
  getCaloriesBurned,
};
