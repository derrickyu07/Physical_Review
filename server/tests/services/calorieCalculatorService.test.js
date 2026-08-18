const { describe, it, expect, vi, beforeEach } = require('vitest');
const {
  netCalories,
  remainingCalories,
  totalCaloriesConsumed,
  maintenanceCalorieCount,
  targetCalorieCount,
  getEntriesForDateRange,
} = require('../../services/calorieCalculatorService');
const MealEntry = require('../../models/MealEntry');
const PhysicalActivityEntry = require('../../models/PhysicalActivityEntry');

describe('netCalories', () => {
  it('returns consumed minus burned', () => {
    const calories = netCalories(400, 2000);
    expect(calories).toBe(1600);
  });

  it('returns consumed minus burned', () => {
    expect(netCalories(400, 2000)).toBe(1600);
  });

  it('returns a negative number when burned is higher than consumed', () => {
    expect(netCalories(2000, 1800)).toBe(-200);
  });
  it('returns zero when burned is same as consumed calories', () => {
    expect(netCalories(400, 400)).toBe(0);
  });
});

describe('remaingCalories', () => {
  it('return maintenanceCalories plus caloriesBurned minus caloriesConsumed ', () => {
    expect(remainingCalories(2000, 1500, 300)).toBe(800);
  });
  it('rounds the result', () => {
    expect(remainingCalories(2000.4, 1500.2, 300.1)).toBe(800);
  });
  it('can go negative when consumed heavily exceeds maintenance + burned', () => {
    expect(remainingCalories(2000, 40000, 30)).toBe(37070);
  });
});

describe('totalCaloriesConsumed', () => {
  it('total number of calories from given list', () => {
    const mealCalories = [{ calorie: 200 }, { calorie: 300 }, { calorie: 400 }];
    expect(totalCaloriesConsumed(mealCalories)).toBe(900);
  });
  it('treat calorie as 0 if the meal entry is empty', () => {
    const mealCalories = [{ calorie: 200 }, { calorie: 300 }, {}];
    expect(totalCaloriesConsumed(mealCalories)).toBe(500);
  });
  it('total number of calories from an empty list', () => {
    const mealCalories = [];
    expect(totalCaloriesConsumed(mealCalories)).toBe(0);
  });
});

describe('totalCaloriesBurned', () => {
  it('total number of calories from given list', () => {
    const burnedConsumed = [
      { calorie: 200 },
      { calorie: 300 },
      { calorie: 400 },
    ];
    expect(totalCaloriesConsumed(burnedConsumed)).toBe(900);
  });
  it('treat calorie as 0 if the activity entry is empty', () => {
    const burnedConsumed = [{ calorie: 200 }, { calorie: 300 }, {}];
    expect(totalCaloriesConsumed(burnedConsumed)).toBe(500);
  });
  it('total number of calories from an empty list', () => {
    const burnedConsumed = [];
    expect(totalCaloriesConsumed(burnedConsumed)).toBe(0);
  });
});

describe('maintenanceCalorieCount', () => {
  it('applies the male BMR offset and the given activity multiplier', () => {
    const result = maintenanceCalorieCount('male', 180, 70, 30, 'sedentary');
    expect(result).toBeCloseTo(1782.55 * 1.22);
  });
  it('applies the non-male BMR offset (-161)', () => {
    const result = maintenanceCalorieCount('female', 140, 65, 28, 'sedentary');
    const weightKg = 140 / 2.205;
    const heightCm = 65 * 2.54;
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * 28 - 161;
    expect(result).toBeCloseTo(bmr * 1.2, 1);
  });

  it('falls back to sedentary multiplier for an unrecognized activity level', () => {
    const known = maintenanceCalorieCount('male', 180, 70, 30, 'sedentary');
    const unknown = maintenanceCalorieCount(
      'male',
      180,
      70,
      30,
      'not-a-real-level',
    );
    expect(unknown).toBe(known);
  });
});

describe('targetCalorieCount', () => {
  it('returns maintenance unchanged when goal is "maintain"', () => {
    expect(targetCalorieCount(2000, 'maintain', 'moderate')).toBe(2000);
  });

  it('applies a negative adjustment for a "lose" goal', () => {
    expect(targetCalorieCount(2000, 'lose', 'moderate')).toBe(1500);
  });

  it('applies a positive adjustment for a "gain" goal', () => {
    expect(targetCalorieCount(2000, 'gain', 'mild')).toBe(2250);
  });

  it('falls back to 0 adjustment for an unrecognized goal/intensity combo', () => {
    expect(targetCalorieCount(2000, 'lose', 'not-a-real-intensity')).toBe(2000);
  });
});

describe('getEntriesForDateRange', () => {
  const USER_ID = 'user-123';
  const start = new Date('2026-03-10T00:00:00.000Z');
  const end = new Date('2026-03-10T23:59:59.999Z');

  beforeEach(() => {
    vi.clearAllMocks();
    MealEntry.find.mockResolvedValue([{ id: 'm1' }]);
    PhysicalActivityEntry.find.mockResolvedValue([{ id: 'a1' }]);
    PhysicalActivityEntry.findOne.mockResolvedValue(null);
  });

  it('queries both meals and activities scoped to userId and the date range', async () => {
    await getEntriesForDateRange(USER_ID, start, end);

    expect(MealEntry.find).toHaveBeenCalledWith({
      userId: USER_ID,
      mealDate: { $gte: start, $lte: end },
    });
    expect(PhysicalActivityEntry.find).toHaveBeenCalledWith({
      userId: USER_ID,
      activityDate: { $gte: start, $lte: end },
    });
  });

  it('returns meals and activities from the queries', async () => {
    const result = await getEntriesForDateRange(USER_ID, start, end);

    expect(result).toEqual({
      meals: [{ id: 'm1' }],
      activities: [{ id: 'a1' }],
    });
  });
});
