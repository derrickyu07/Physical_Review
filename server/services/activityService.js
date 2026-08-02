const Activity = require('../models/physicalActivityEntry.js');

async function getActivitiesGivenTime(userId, start, end) {
  const activities = await Activity.find({
    userId,
    activityDate: { $gte: start, $lte: end },
  });
  return activities;
}

function getTotalActivityTime(activities) {
  const totalActivityTime = activities.reduce(
    (total, { duration }) => total + duration,
    0,
  );
  return totalActivityTime;
}

module.exports = { getActivitiesGivenTime, getTotalActivityTime };
