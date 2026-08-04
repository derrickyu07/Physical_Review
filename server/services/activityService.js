const PhysicalActivityEntry = require('../models/physicalActivityEntry.js');
const { getCaloriesBurned } = require('./activityCalorieService.js');

async function getActivitiesGivenTime(userId, start, end) {
  const activities = await PhysicalActivityEntry.find({
    userId,
    activityDate: { $gte: start, $lte: end },
  });
  return activities;
}

function getTotalActivityTime(activities) {
  const totalActivityTime = activities.reduce(
    (total, { duration }) => total + (duration ?? 0),
    0,
  );
  return totalActivityTime;
}

async function createPhysicalActivityEntryService({
  userId,
  caloriesBurned,
  intensity,
  duration,
  activityType,
  activityDate,
}) {
  const resolvedBurned =
    caloriesBurned ??
    (await getCaloriesBurned({ userId, activityType, duration, intensity }));

  const activityEntry = await PhysicalActivityEntry.create({
    userId,
    caloriesBurned: resolvedBurned,
    intensity,
    duration,
    activityType,
    activityDate,
  });
  return activityEntry;
}

async function updatePhysicalActivityEntryService({ id, userId, updates }) {
  const updatedActivityEntry = await PhysicalActivityEntry.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  return updatedActivityEntry;
}

async function getPhysicalActivityEntryService(id, userId) {
  const activityEntry = await PhysicalActivityEntry.findOne({
    _id: id,
    userId,
  });
  return activityEntry;
}

async function getPhysicalActivityEntriesService(userId) {
  const activityEntries = await PhysicalActivityEntry.find({ userId }).sort({
    activityDate: -1,
  });
  return activityEntries;
}

async function deletePhysicalActivityEntryService(id, userId) {
  const deletedActivityEntry = await PhysicalActivityEntry.findOneAndDelete({
    _id: id,
    userId,
  });
  return deletedActivityEntry;
}

module.exports = {
  getActivitiesGivenTime,
  getTotalActivityTime,
  createPhysicalActivityEntryService,
  updatePhysicalActivityEntryService,
  getPhysicalActivityEntryService,
  getPhysicalActivityEntriesService,
  deletePhysicalActivityEntryService,
};
