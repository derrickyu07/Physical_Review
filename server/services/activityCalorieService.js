const ACTIVITY_MET = require('../constants/activityMet');

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '');

const getCaloriesBurned = async (userId, activityType, duration, intensity) => {
  // const bodyMetric = await BodyMetric.findOne({ userId });
  // if (!bodyMetric) {
  //   throw new Error('No body metrics found for user');
  // }
  return calculateCaloriesBurned(activityType, Number(duration), intensity, 27);
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

const calculateCaloriesBurned = (
  activity,
  durationMinutes,
  intensity = 'moderate',
  weightKg,
) => {
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
