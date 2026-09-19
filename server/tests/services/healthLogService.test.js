import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  logHealthEntry,
  getWeekRecords,
} from '../../services/healthLogService';

const USER_ID = 'user-123';

const mockUserMetrics = {
  gender: 'female',
  weight: 140,
  height: 66,
  age: 29,
  activityLevel: 'moderate',
};

function mockDeps() {
  return {
    HealthLog: {
      findOneAndUpdate: vi.fn(),
      find: vi.fn(),
    },
    getActivitiesGivenTime: vi.fn(),
    getTotalActivityTime: vi.fn(),
    getUserMetrics: vi.fn(),
    totalCaloriesBurned: vi.fn(),
    totalCaloriesConsumed: vi.fn(),
    getMealsGivenTime: vi.fn(),
    getTotalProtein: vi.fn(),
    getTotalCarbohydrate: vi.fn(),
    getTotalFat: vi.fn(),
  };
}

let deps;

beforeEach(() => {
  deps = mockDeps();

  deps.getActivitiesGivenTime.mockResolvedValue([{ id: 'a1' }]);
  deps.getMealsGivenTime.mockResolvedValue([{ id: 'm1' }]);
  deps.getTotalActivityTime.mockReturnValue(45);
  deps.totalCaloriesBurned.mockReturnValue(400);
  deps.totalCaloriesConsumed.mockReturnValue(2100);
  deps.getTotalProtein.mockReturnValue(120);
  deps.getTotalCarbohydrate.mockReturnValue(230);
  deps.getTotalFat.mockReturnValue(70);
  deps.getUserMetrics.mockResolvedValue(mockUserMetrics);

  deps.HealthLog.findOneAndUpdate.mockResolvedValue({ _id: 'log-1' });
});

describe('logHealthEntry', () => {
  it('queries activities and meals for the full UTC day of the given date', async () => {
    await logHealthEntry(USER_ID, '2026-03-10', deps);

    const [, activityStart, activityEnd] =
      deps.getActivitiesGivenTime.mock.calls[0];
    expect(activityStart.toISOString()).toBe('2026-03-10T00:00:00.000Z');
    expect(activityEnd.toISOString()).toBe('2026-03-10T23:59:59.999Z');
    const [, mealStart, mealEnd] = deps.getMealsGivenTime.mock.calls[0];
    expect(mealStart.toISOString()).toBe('2026-03-10T00:00:00.000Z');
    expect(mealEnd.toISOString()).toBe('2026-03-10T23:59:59.999Z');
  });

  it('defaults to today when no date is provided', async () => {
    const before = new Date();
    before.setUTCHours(0, 0, 0, 0);

    await logHealthEntry(USER_ID, undefined, deps);

    const [, activityStart] = deps.getActivitiesGivenTime.mock.calls[0];
    expect(activityStart.toISOString()).toBe(before.toISOString());
  });

  it('aggregates activity, meal, and user metric data into the upsert payload', async () => {
    await logHealthEntry(USER_ID, '2026-03-10', deps);

    const [, updatePayload] = deps.HealthLog.findOneAndUpdate.mock.calls[0];
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
    await logHealthEntry(USER_ID, '2026-03-10', deps);

    const [filter] = deps.HealthLog.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({
      userId: USER_ID,
      date: expect.any(Date),
    });
  });

  it('upserts and returns the post-update document', async () => {
    await logHealthEntry(USER_ID, '2026-03-10', deps);

    const [, , options] = deps.HealthLog.findOneAndUpdate.mock.calls[0];
    expect(options).toMatchObject({ upsert: true, returnDocument: 'after' });
  });

  it('uses $set so unrelated fields on the existing document are preserved', async () => {
    await logHealthEntry(USER_ID, '2026-03-10', deps);

    const [, updatePayload] = deps.HealthLog.findOneAndUpdate.mock.calls[0];
    expect(updatePayload).toHaveProperty('$set');
  });
});

describe('getWeekRecords', () => {
  it('queries HealthLog scoped to the user and sorts/leans the result', async () => {
    const sort = vi.fn().mockReturnThis();
    const lean = vi.fn().mockResolvedValue([{ id: 'log-1' }]);
    deps.HealthLog.find.mockReturnValue({ sort, lean });

    const result = await getWeekRecords(USER_ID, deps);

    expect(deps.HealthLog.find).toHaveBeenCalledWith(
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
