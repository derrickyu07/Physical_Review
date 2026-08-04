const {
  createPhysicalActivityEntryService,
  updatePhysicalActivityEntryService,
  getPhysicalActivityEntryService,
  getPhysicalActivityEntriesService,
  deletePhysicalActivityEntryService,
} = require('../services/activityService');

const createPhysicalActivityEntry = async (req, res) => {
  try {
    const { duration, activityType, activityDate, intensity } = req.body;
    const caloriesBurned = req.body.caloriesBurned ?? null;
    if (!duration || !activityType || !activityDate || !intensity) {
      return res.status(400).json({ message: 'fill in required fields' });
    }

    const activityEntry = await createPhysicalActivityEntryService({
      userId: req.user._id,
      caloriesBurned,
      intensity,
      duration,
      activityType,
      activityDate,
    });
    res.status(201).json(activityEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePhysicalActivityEntry = async (req, res) => {
  try {
    const updatedPhysicalActivity = await updatePhysicalActivityEntryService({
      id: req.params.id,
      userId: req.user._id,
      updates: req.body,
    });

    if (!updatedPhysicalActivity) {
      return res.status(404).json({ message: 'Physical Activity not found' });
    }

    res.status(200).json(updatedPhysicalActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPhysicalActivityEntry = async (req, res) => {
  try {
    const activityEntry = await getPhysicalActivityEntryService(
      req.params.id,
      req.user._id,
    );
    if (!activityEntry) {
      return res
        .status(404)
        .json({ message: 'Could not find the physical activity entry' });
    }
    res.status(200).json(activityEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPhysicalActivites = async (req, res) => {
  try {
    const activityEntries = await getPhysicalActivityEntriesService(
      req.user._id,
    );
    res.status(200).json(activityEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePhysicalActivityEntry = async (req, res) => {
  try {
    const deletedActivityEntry = await deletePhysicalActivityEntryService(
      req.params.id,
      req.user._id,
    );
    if (!deletedActivityEntry) {
      return res.status(404).json({
        message: 'physical activity entry was not found',
      });
    }
    res
      .status(200)
      .json({ message: 'physical activity entry was successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPhysicalActivityEntry,
  updatePhysicalActivityEntry,
  getPhysicalActivityEntry,
  deletePhysicalActivityEntry,
  getAllPhysicalActivites,
};
