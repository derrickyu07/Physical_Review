const {
  createGoalService,
  deriveGoalStatus,
  updateGoalService,
  getGoalService,
  getGoalsService,
  deleteGoalService,
} = require('../services/goalsService');

const createGoal = async (req, res) => {
  try {
    const { goalType, targetValue, currentValue, startDate, endDate } =
      req.body;
    if (!goalType || !targetValue || !startDate) {
      return res.status(400).json({ message: 'fill required fields' });
    }
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    if (isNaN(start.getTime()) || (end && isNaN(end.getTime()))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    const status = deriveGoalStatus(start, end);
    const userId = req.user._id;

    const userGoal = await createGoalService({
      userId,
      goalType,
      targetValue,
      currentValue,
      startDate: start,
      endDate: end,
      status,
    });
    res.status(200).json(userGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedGoal = await updateGoalService({
      id,
      userId: req.user._id,
      updates,
    });

    if (!updatedGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGoal = async (req, res) => {
  try {
    const goal = await getGoalService({
      id: req.params.id,
      userId: req.user._id,
    });
    if (!goal) {
      return res.status(404).json({ message: 'goal not found' });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await getGoalsService(req.user._id);
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await deleteGoalService({
      id: req.params.id,
      userId: req.user._id,
    });
    if (!deletedGoal) {
      return res.status(404).json({ message: 'goal not found' });
    }
    res.status(200).json({ message: 'goal was successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGoal,
  updateGoal,
  getGoal,
  deleteGoal,
  getGoals,
};
