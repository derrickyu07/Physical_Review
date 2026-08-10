const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const { getOrCreateDemoUserService } = require('../services/userService');
const BodyMetricEntry = require('../models/BodyMetricEntry');
const MealEntry = require('../models/MealEntry');
const PhysicalActivityEntry = require('../models/PhysicalActivityEntry');
const Goal = require('../models/Goal');
const { calculateBMI } = require('../services/bodyMetricService');
const {
  calculateCaloriesBurned,
} = require('../services/activityCalorieService');

dotenv.config();

const DAYS_OF_HISTORY = 21;

const MEAL_TEMPLATES = [
  {
    name: 'Greek yogurt with berries',
    mealType: 'breakfast',
    calories: 320,
    protein: 24,
    carbohydrates: 38,
    fat: 8,
  },
  {
    name: 'Oatmeal with peanut butter',
    mealType: 'breakfast',
    calories: 410,
    protein: 16,
    carbohydrates: 52,
    fat: 15,
  },
  {
    name: 'Grilled chicken salad',
    mealType: 'lunch',
    calories: 480,
    protein: 42,
    carbohydrates: 28,
    fat: 20,
  },
  {
    name: 'Turkey sandwich',
    mealType: 'lunch',
    calories: 520,
    protein: 32,
    carbohydrates: 55,
    fat: 18,
  },
  {
    name: 'Salmon with rice and vegetables',
    mealType: 'dinner',
    calories: 610,
    protein: 45,
    carbohydrates: 50,
    fat: 22,
  },
  {
    name: 'Stir-fry beef and broccoli',
    mealType: 'dinner',
    calories: 560,
    protein: 38,
    carbohydrates: 42,
    fat: 24,
  },
  {
    name: 'Protein shake',
    mealType: 'snack',
    calories: 180,
    protein: 25,
    carbohydrates: 12,
    fat: 3,
  },
  {
    name: 'Apple with almond butter',
    mealType: 'snack',
    calories: 210,
    protein: 5,
    carbohydrates: 24,
    fat: 11,
  },
];

const ACTIVITY_TEMPLATES = [
  { activityType: 'running', duration: 30, intensity: 'moderate' },
  { activityType: 'weightlifting', duration: 45, intensity: 'intense' },
  { activityType: 'cycling', duration: 40, intensity: 'moderate' },
  { activityType: 'walking', duration: 35, intensity: 'light' },
  { activityType: 'yoga', duration: 25, intensity: 'light' },
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const dateDaysAgo = (days, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

async function clearDemoData(userId) {
  await Promise.all([
    BodyMetricEntry.deleteMany({ userId }),
    MealEntry.deleteMany({ userId }),
    PhysicalActivityEntry.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
  ]);
}

async function seedBodyMetric(userId) {
  const weight = 178;
  const height = 70;
  const bmi = calculateBMI(height, weight);

  return BodyMetricEntry.create({
    userId,
    weight,
    height,
    gender: 'male',
    age: 29,
    bmi,
    activityLevel: 'moderate',
  });
}

async function seedMeals(userId) {
  const meals = [];
  for (let day = 0; day < DAYS_OF_HISTORY; day++) {
    const mealsToday = [
      randomFrom(MEAL_TEMPLATES.filter((m) => m.mealType === 'breakfast')),
      randomFrom(MEAL_TEMPLATES.filter((m) => m.mealType === 'lunch')),
      randomFrom(MEAL_TEMPLATES.filter((m) => m.mealType === 'dinner')),
    ];
    if (Math.random() > 0.5) {
      mealsToday.push(
        randomFrom(MEAL_TEMPLATES.filter((m) => m.mealType === 'snack')),
      );
    }

    mealsToday.forEach((template, i) => {
      meals.push({
        userId,
        name: template.name,
        calories: template.calories,
        fat: template.fat,
        carbohydrates: template.carbohydrates,
        protein: template.protein,
        mealType: template.mealType,
        quantity: 1,
        mealDate: dateDaysAgo(day, 7 + i * 4),
      });
    });
  }
  return MealEntry.insertMany(meals);
}

async function seedActivities(userId, weightLbs) {
  const weightKg = weightLbs / 2.205;
  const activities = [];

  for (let day = 0; day < DAYS_OF_HISTORY; day++) {
    if (Math.random() > 0.4) continue; // skip some days, like a real user would

    const template = randomFrom(ACTIVITY_TEMPLATES);
    const caloriesBurned = calculateCaloriesBurned({
      activity: template.activityType,
      durationMinutes: template.duration,
      intensity: template.intensity,
      weightKg,
    });

    activities.push({
      userId,
      activityType: template.activityType,
      duration: template.duration,
      intensity: template.intensity,
      caloriesBurned,
      activityDate: dateDaysAgo(day, 17),
    });
  }
  return PhysicalActivityEntry.insertMany(activities);
}

async function seedGoal(userId) {
  return Goal.create({
    userId,
    goalType: 'weight loss',
    targetValue: 168,
    currentValue: 178,
    startDate: dateDaysAgo(DAYS_OF_HISTORY),
    endDate: dateDaysAgo(-42), // 6 weeks out
    status: 'active',
  });
}

async function seedDemo() {
  await connectDB();

  const demoUser = await getOrCreateDemoUserService();
  console.log(`Seeding demo data for user ${demoUser._id} (${demoUser.email})`);

  await clearDemoData(demoUser._id);

  const bodyMetric = await seedBodyMetric(demoUser._id);
  const meals = await seedMeals(demoUser._id);
  const activities = await seedActivities(demoUser._id, bodyMetric.weight);
  const goal = await seedGoal(demoUser._id);

  console.log(
    `Seeded: 1 body metric, ${meals.length} meals, ${activities.length} activities, 1 goal`,
  );

  await mongoose.disconnect();
  console.log('Done.');
}

if (require.main === module) {
  seedDemo().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { seedDemo };
