const {
  updateUserBodyMetric,
  getUserMetrics,
  createUserBodyMetric,
} = require('../services/bodyMetricService');

const updateBodyMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const updated = await updateUserBodyMetric(id, userId, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Body metric entry not found' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBodyMetric = async (req, res) => {
  try {
    const userId = req.user._id;
    const bodyMetric = await getUserMetrics(userId);
    if (!bodyMetric) {
      return res
        .status(404)
        .json({ message: 'No body metrics found for this user' });
    }
    return res.status(200).json(bodyMetric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBodyMetric = async (req, res) => {
  try {
    const { weight, height, gender, age, activityLevel } = req.body;
    const userId = req.user._id;

    if (!weight || !height || !gender || !age || !activityLevel) {
      return res.status(400).json({ message: 'Fill required fields' });
    }

    const bodyMetric = await createUserBodyMetric(
      userId,
      weight,
      height,
      gender,
      age,
      activityLevel,
    );
    return res.status(200).json(bodyMetric);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateBodyMetric,
  getBodyMetric,
  createBodyMetric,
};
