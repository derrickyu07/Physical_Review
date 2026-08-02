const Goal = require('../models/Goal');

const GOAL_TYPE_MAP = {
  'weight loss': 'lose_weight',
  'muscle gain': 'build_muscle',
  'fat loss': 'lose_weight',
};

async function getGoalsForReport(userId) {
  const activeGoal = await Goal.findOne({ userId, status: 'active' })
    .sort({ createdAt: -1 })
    .lean();

  if (!activeGoal) return undefined;

  return {
    goal_type: GOAL_TYPE_MAP[activeGoal.goalType] || null,
    target_weight_lbs: activeGoal.targetValue,
  };
}

async function createGoalService({
  userId,
  goalType,
  targetValue,
  currentValue,
  startDate,
  endDate,
  status,
}) {
  const userGoal = await Goal.create({
    userId,
    goalType,
    targetValue,
    currentValue,
    startDate,
    endDate,
    status,
  });
  return userGoal;
}

const deriveGoalStatus = (start, end, now = new Date()) => {
  if (end && end < now) {
    return 'complete';
  }
  if (start <= now) {
    return 'active';
  }
  return 'inactive';
};

async function updateGoalService({ id, userId, updates }) {
  const updatedGoal = await Goal.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  return updatedGoal;
}

async function getGoalService({ id, userId }) {
  const goal = await Goal.findOne({
    _id: id,
    userId: userId,
  });
  return goal;
}

async function getGoalsService(userId) {
  const goals = await Goal.find({ userId: userId });
  return goals;
}

async function deleteGoalService({ id, userId }) {
  const deletedGoal = await Goal.findOneAndDelete({ _id: id, userId });
  return deletedGoal;
}

module.exports = {
  getGoalsForReport,
  createGoalService,
  deriveGoalStatus,
  updateGoalService,
  getGoalService,
  getGoalsService,
  deleteGoalService,
};
