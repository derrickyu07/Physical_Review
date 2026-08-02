const mongoose = require("mongoose");

const bodyMetricEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    height: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    bmi: {
      type: Number,
      required: false,
      min: 0,
    },
    activityLevel: {
      type: String,
      enum: [
        "sedentary",
        "light",
        "moderate",
        "active",
        "veryActive",
        "extremelyActive",
      ],
      default: "sedentary",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("BodyMetricEntry", bodyMetricEntrySchema);
