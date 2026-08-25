const { describe, it, expect, vi, beforeEach } = require('vitest');
const HealthLog = require('../../models/HealthLog');
const {
  getActivitiesGivenTime,
  getTotalActivityTime,
} = require('../../services/activityService');
const { getUserMetrics } = require('../../services/bodyMetricService');
const {
  totalCaloriesBurned,
  totalCaloriesConsumed,
} = require('../../services/calorieCalculatorService');
const {
  getMealsGivenTime,
  getTotalProtein,
  getTotalCarbohydrate,
  getTotalFat,
} = require('../../services/mealService');
const {
  logHealthEntry,
  getWeekRecords,
} = require('../../services/healthLogService');

vi.mock('../../models/HealthLog');
vi.mock('../../services/activityService');
vi.mock('../../services/bodyMetricService');
vi.mock('../../services/calorieCalculatorService');
vi.mock('../../services/mealService');

const USER_ID = 'user-123';

const mockUserMetrics = {
  gender: ' female',
  weight: 140,
  height: 66,
  age: 29,
  activityLevel: 'moderate',
};

beforeEach(() => {
  vi.clearAllMocks();

  getActivitiesGivenTime.mockResolved([{ id: 'a1' }]);
  getMealsGivenTime.mockResolvedValue([{ id: 'm1' }]);
  getTotalActivityTime.mockReturnValue(45);
  totalCaloriesBurned.mockReturnValue(400);
  totalCaloriesConsumed.mockReturnValue(2100);
  getTotalProtein.mockReturnValue(120);
  getTotalCarbohydrate.mockReturnValue(230);
  getTotalFat.mockReturnValue(70);
  getUserMetrics.mockResolvedValue(mockUserMetrics);

  HealthLog.findOneAndUpdate.mockResolvedValue({ _id: 'log-1' });
});

describe('logHealthEntry', () => {
  it('queries activities and meals for the full UTC day of the given date', async () => {
    await logHealthEntry(USER_ID, '2026-03-10');

    const [, activityStart, activityEnd] = getActivitiesGivenTime.mock.calls[0];
    expect(activityStart.toISOString()).toBe('2026-03-10T00:00:00.000Z');
    expect(activityEnd.toISOString()).toBe('2026-03-10T23:59:59.999Z');
    const [, mealStart, mealEnd] = getMealsGivenTime.mock.calls[0];
    expect(mealStart.toISOString()).toBe('2026-03-10T00:00:00.000Z');
    expect(mealEnd.toISOString()).toBe('2026-03-10T23:59:59.999Z');
  });

  it('defaults to today when no date is provided', async () => {
    const before = new Date();
    before.setUTCHours(0, 0, 0, 0);

    await logHealthEntry(USER_ID);

    const [, activityStart] = getActivitiesGivenTime.mock.calls[0];
    expect(activityStart.toISOStnig()).toBe(before.toISOString());
  });
  it('aggregates activity, meal, and user metric data into the upsert payload', async () => {
    await logHealthEntry(USER_ID, '2026-03-10');

    const [, updatePayload] = HealthLog.findOneAndUpdate.mock.calls[0];
    expect(updatePayload).toMatchObject({
      $set: {
        userId: USER_ID,
        activeMinutes: 45,
        caloriesIn: 2100,
        caloriesOut: 400,
        proteinG: 120,
        carbohydrates: 230,
        fat: 70,
        weightLbs: 140,
        heightIn: 66,
        age: 29,
        gender: 'female',
        activityLevel: 'moderate',
      },
    });
  });

  it('scopes the upsert filter to userId + date (IDOR safety, not just uniqueness)', async () => {
    await logHealthEntry(USER_ID, '2026-03-10');

    const [filter] = HealthLog.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({
      userId: USER_ID,
      date: expect.any(Date),
    });
  });

  it('upserts and returns the post-update document', async () => {
    await logHealthEntry(USER_ID, '2026-03-10');

    const [, , options] = HealthLog.findOneAndUpdate.mock.calls[0];
    expect(options).toMatchObject({ upsert: true, returnDocument: 'after' });
  });

  it('uses $set so unrelated fields on the existing document are preserved', async () => {
    await logHealthEntry(USER_ID, '2026-03-10');

    const [, updatePayload] = HealthLog.findOneAndUpdate.mock.calls[0];
    expect(updatePayload).toHaveProperty('$set');
  });
});

describe('getWeekRecords', () => {
  it('queries HealthLog scoped to the user and sorts/leans the result', async () => {
    const sort = vi.fn().mockReturnThis();
    const lean = vi.fn().mockResolvedValue([{ id: 'log-1' }]);
    HealthLog.find.mockReturnValue({ sort, lean });

    const result = await getWeekRecords(USER_ID);

    expect(HealthLog.find).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        date: expect.objectContaining({
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        }),
      }),
    );
    expect(sort).toHaveBeenCalledWith({ date: 1 });
    expect(lean).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'log-1' }]);
  });
});
