const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
  extremelyActive: 2.1,
};

const GOAL_ADJUSTMENTS = {
  fatLoss: {
    mild: -250,
    moderate: -500,
    aggressive: -750,
  },
  muscleGain: {
    mild: 250,
    moderate: 500,
    aggressive: 750,
  },
  maintain: {
    default: 0,
  },
};

module.exports = {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
};
