const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: { type: Date, required: true },
  activeMinutes: Number,
  caloriesIn: Number,
  caloriesOut: Number,
  proteinG: Number,
  carbohydrates: Number,
  fat: Number,
  weightLbs: Number,
  heightIn: Number,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  activityLevel: {
    type: String,
    enum: [
      'sedentary',
      'light',
      'moderate',
      'active',
      'veryActive',
      'extremelyActive',
    ],
    default: 'sedentary',
    required: true,
  },
});

healthLogSchema.index({ userId: 1, date: 1 }, { unique: true });
module.exports =
  mongoose.models.HealthLog || mongoose.model('HealthLog', healthLogSchema);
