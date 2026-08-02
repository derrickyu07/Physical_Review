const PhysicalActivity = require("../models/PhysicalActivityEntry");
const { getCaloriesBurned } = require("../services/activityCalorieService");

const createPhysicalActivityEntry = async (req, res) => {
  try {
    const { duration, activityType, activityDate, intensity } = req.body;
    let caloriesBurned = req.body.caloriesBurned ?? null;

    if (!duration || !activityType || !activityDate || !intensity) {
      return res.status(400).json({ message: "fill in required fields" });
    }

    caloriesBurned =
      caloriesBurned ??
      (await getCaloriesBurned(
        req.user._id,
        activityType,
        duration,
        intensity,
      ));
    const userPhysicalActivityEntry = await PhysicalActivity.create({
      userId: req.user._id,
      caloriesBurned,
      intensity,
      duration,
      activityType,
      activityDate,
    });
    res.status(201).json(userPhysicalActivityEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePhysicalActivityEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedPhysicalActivity = await PhysicalActivity.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedPhysicalActivity) {
      return res.status(404).json({ message: "Physical Activity not found" });
    }

    res.status(200).json(updatedPhysicalActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPhysicalActivityEntry = async (req, res) => {
  try {
    const physicalActivity = await PhysicalActivity.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!physicalActivity) {
      return res
        .status(404)
        .json({ message: "Could not find the physical activity entry" });
    }
    res.status(200).json(physicalActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePhysicalActivityEntry = async (req, res) => {
  try {
    const physicalActivity = await PhysicalActivity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!physicalActivity) {
      return res.status(404).json({
        message: "physical activity entry was not found",
      });
    }
    res
      .status(200)
      .json({ message: "physical activity entry was successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPhysicalActivites = async (req, res) => {
  try {
    const activities = await PhysicalActivity.find({
      userId: req.user._id,
    }).sort({
      activityDate: -1,
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getPhysicalActivityEntryCaloriesBurned = async (req, res) => {
//   try {
//     const { physicalActivity, intensity } = req.body;
//     if (!physicalActivity) {
//       return res
//         .status(400)
//         .json({ message: 'Input a valid physical activity' });
//     }
//     const caloriesBurned = calculateCaloriesBurned(
//       physicalActivity,
//       100,
//       100,
//       intensity,
//     );
//     res.status(200).json(caloriesBurned);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

module.exports = {
  createPhysicalActivityEntry,
  updatePhysicalActivityEntry,
  getPhysicalActivityEntry,
  deletePhysicalActivityEntry,
  getAllPhysicalActivites,
  // getPhysicalActivityEntryCaloriesBurned,
};
