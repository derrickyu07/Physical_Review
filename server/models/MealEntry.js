const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  calories: {
    type: Number,
    required: true,
    min: 0,
  },
  fat: {
    type: Number,
    required: true,
    min: 0,
  },
  carbohydrates: {
    type: Number,
    required: true,
    min: 0,
  },
  protein: {
    type: Number,
    required: true,
    min: 0,
  },
  mealDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  micronutrients: {
    type: {
      sugars: {
        type: Number,
        default: 0,
        min: 0,
      },
      fiber: {
        type: Number,
        default: 0,
        min: 0,
      },
      calcium: {
        type: Number,
        default: 0,
        min: 0,
      },
      iron: {
        type: Number,
        default: 0,
        min: 0,
      },
      sodium: {
        type: Number,
        default: 0,
        min: 0,
      },
      vitaminA: {
        type: Number,
        default: 0,
        min: 0,
      },
      vitaminC: {
        type: Number,
        default: 0,
        min: 0,
      },
      cholesterol: {
        type: Number,
        default: 0,
        min: 0,
      },
      transFat: {
        type: Number,
        default: 0,
        min: 0,
      },
      saturatedFat: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
});

module.exports = mongoose.model('MealEntry', mealEntrySchema);
