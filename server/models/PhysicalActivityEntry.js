const mongoose = require('mongoose');

const physicalActivityEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    activityType: {
      type: String,
      required: true,
      enum: [
        'running',
        'walking',
        'cycling',
        'weightlifting',
        'basketball',
        'soccer',
        'swimming',
        'hiking',
        'yoga',
        'boxing',
        'tennis',
        'crossfit',
      ],
    },

    duration: {
      required: true,
      type: Number,
      min: 1,
    },

    intensity: {
      type: String,
      enum: ['light', 'moderate', 'intense'],
      default: 'moderate',
    },

    activityDate: {
      type: Date,
      default: Date.now,
    },

    caloriesBurned: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.PhysicalActivityEntry ||
  mongoose.model('PhysicalActivityEntry', physicalActivityEntrySchema);
