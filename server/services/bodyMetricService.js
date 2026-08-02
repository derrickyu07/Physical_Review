const BodyMetricEntry = require('../models/BodyMetricEntry');

const calculateBMI = (height, weight) => {
  return (weight / (height * height)) * 703;
};

const getUserMetrics = async (userId) => {
  const bodyMetric = await BodyMetricEntry.findOne({ userId: userId }).sort({
    createdAt: -1,
  });
  if (!bodyMetric) return null;
  return {
    gender: bodyMetric.gender,
    weight: bodyMetric.weight,
    height: bodyMetric.height,
    age: bodyMetric.age,
    activityLevel: bodyMetric.activityLevel,
    bmi: bodyMetric.bmi,
  };
};

const updateUserBodyMetric = async (id, userId, updates) => {
  if (updates.height || updates.weight) {
    // recalc BMI if either changed, using whichever value is fresher
    const existing = await BodyMetricEntry.findOne({ _id: id, userId });
    if (!existing) return null;
    const height = updates.height ?? existing.height;
    const weight = updates.weight ?? existing.weight;
    updates.bmi = calculateBMI(height, weight);
  }

  return BodyMetricEntry.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { returnDocument: 'after', runValidators: true },
  );
};

const createUserBodyMetric = async (
  userId,
  weight,
  height,
  gender,
  age,
  activityLevel,
) => {
  const bmi = calculateBMI(height, weight);

  const bodyMetric = await BodyMetricEntry.create({
    userId: userId,
    weight: weight,
    height: height,
    gender: gender,
    age: age,
    bmi: bmi,
    activityLevel: activityLevel,
  });
  return bodyMetric;
};

module.exports = {
  calculateBMI,
  getUserMetrics,
  updateUserBodyMetric,
  createUserBodyMetric,
};
