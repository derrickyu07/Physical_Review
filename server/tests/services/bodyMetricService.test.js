import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateBMI,
  getUserMetrics,
  updateUserBodyMetric,
  createUserBodyMetric,
} from '../../services/bodyMetricService';

const USER_ID = 'user_id';

function mockDeps(overrides = {}) {
  return {
    BodyMetricEntry: {
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      create: vi.fn(),
    },
    calculateBMI: vi.fn(),
    ...overrides,
  };
}

describe('calculateBMI', () => {
  // Real implementation, not a mock -- this is the source of truth other
  // tests' calculateBMI mocks should stay consistent with.
  it('returns BMI given height and weight', () => {
    // calculateBMI(height, weight); height=60in, weight=140lb
    expect(calculateBMI(60, 140)).toBe(27.3);
  });
});

describe('getUserMetrics', () => {
  it('queries the most recent entry for the given user, sorted by createdAt descending', async () => {
    const sort = vi.fn().mockResolvedValue({
      gender: 'female',
      weight: 140,
      height: 65,
      age: 29,
      activityLevel: 'moderate',
      bmi: 23.3,
    });
    const deps = mockDeps();
    deps.BodyMetricEntry.findOne.mockReturnValue({ sort });

    await getUserMetrics(USER_ID, deps);

    expect(deps.BodyMetricEntry.findOne).toHaveBeenCalledWith({
      userId: USER_ID,
    });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it('returns null when the user has no body metric entries', async () => {
    const sort = vi.fn().mockResolvedValue(null);
    const deps = mockDeps();
    deps.BodyMetricEntry.findOne.mockReturnValue({ sort });

    const result = await getUserMetrics(USER_ID, deps);

    expect(result).toBeNull();
  });

  it('returns only the expected fields, mapped from the raw document', async () => {
    const sort = vi.fn().mockResolvedValue({
      _id: 'doc-1',
      userId: USER_ID,
      gender: 'male',
      weight: 180,
      height: 70,
      age: 34,
      activityLevel: 'active',
      bmi: 25.8,
      createdAt: new Date('2026-01-01'),
    });
    const deps = mockDeps();
    deps.BodyMetricEntry.findOne.mockReturnValue({ sort });

    const result = await getUserMetrics(USER_ID, deps);

    expect(result).toEqual({
      gender: 'male',
      weight: 180,
      height: 70,
      age: 34,
      activityLevel: 'active',
      bmi: 25.8,
    });
    expect(result).not.toHaveProperty('_id');
    expect(result).not.toHaveProperty('createdAt');
  });
});

describe('updateUserBodyMetric', () => {
  const ID = 'metric-1';

  it('recalculates BMI using the new height and the existing weight when only height changes', async () => {
    const deps = mockDeps();
    deps.BodyMetricEntry.findOne.mockResolvedValue({ height: 65, weight: 140 });
    deps.BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });
    deps.calculateBMI.mockReturnValue(24.1);

    await updateUserBodyMetric(ID, USER_ID, { height: 68 }, deps);

    expect(deps.calculateBMI).toHaveBeenCalledWith(68, 140); // new height, existing weight
    const [, update] = deps.BodyMetricEntry.findOneAndUpdate.mock.calls[0];
    expect(update.$set.bmi).toBe(24.1);
  });

  it('recalculates BMI using the new weight and the existing height when only weight changes', async () => {
    const deps = mockDeps();
    deps.BodyMetricEntry.findOne.mockResolvedValue({ height: 65, weight: 140 });
    deps.BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });
    deps.calculateBMI.mockReturnValue(25.5);

    await updateUserBodyMetric(ID, USER_ID, { weight: 148 }, deps);

    expect(deps.calculateBMI).toHaveBeenCalledWith(65, 148); // existing height, new weight
  });

  it('recalculates BMI using both new values when both change', async () => {
    const deps = mockDeps();
    deps.BodyMetricEntry.findOne.mockResolvedValue({ height: 65, weight: 140 });
    deps.BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });
    deps.calculateBMI.mockReturnValue(26.0);

    await updateUserBodyMetric(ID, USER_ID, { height: 68, weight: 150 }, deps);

    expect(deps.calculateBMI).toHaveBeenCalledWith(68, 150);
  });

  it('does not touch BMI or call findOne when neither height nor weight is being updated', async () => {
    const deps = mockDeps();
    deps.BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });

    await updateUserBodyMetric(ID, USER_ID, { activityLevel: 'active' }, deps);

    expect(deps.BodyMetricEntry.findOne).not.toHaveBeenCalled();
    expect(deps.calculateBMI).not.toHaveBeenCalled();
    const [, update] = deps.BodyMetricEntry.findOneAndUpdate.mock.calls[0];
    expect(update.$set).not.toHaveProperty('bmi');
  });

  it('returns null and never calls findOneAndUpdate when no matching entry exists for this user (IDOR safety)', async () => {
    const deps = mockDeps();
    deps.BodyMetricEntry.findOne.mockResolvedValue(null);

    const result = await updateUserBodyMetric(
      ID,
      'some-other-user',
      { height: 68 },
      deps,
    );

    expect(result).toBeNull();
    expect(deps.BodyMetricEntry.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('scopes the update to both _id and userId, using $set with runValidators', async () => {
    const deps = mockDeps();
    deps.BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });

    await updateUserBodyMetric(
      ID,
      USER_ID,
      { activityLevel: 'sedentary' },
      deps,
    );

    const [filter, update, options] =
      deps.BodyMetricEntry.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: ID, userId: USER_ID });
    expect(update).toEqual({ $set: { activityLevel: 'sedentary' } });
    expect(options).toMatchObject({
      returnDocument: 'after',
      runValidators: true,
    });
  });
});

describe('createUserBodyMetric', () => {
  it('calculates BMI and creates a body metric entry with all fields', async () => {
    const deps = mockDeps();
    deps.calculateBMI.mockReturnValue(22.9);
    deps.BodyMetricEntry.create.mockResolvedValue({ _id: 'new-metric' });

    await createUserBodyMetric(
      USER_ID,
      140,
      65,
      'female',
      29,
      'moderate',
      deps,
    );

    expect(deps.calculateBMI).toHaveBeenCalledWith(65, 140); // height, weight order
    expect(deps.BodyMetricEntry.create).toHaveBeenCalledWith({
      userId: USER_ID,
      weight: 140,
      height: 65,
      gender: 'female',
      age: 29,
      bmi: 22.9,
      activityLevel: 'moderate',
    });
  });

  it('returns whatever BodyMetricEntry.create resolves to', async () => {
    const deps = mockDeps();
    deps.calculateBMI.mockReturnValue(22.9);
    const created = { _id: 'new-metric', userId: USER_ID };
    deps.BodyMetricEntry.create.mockResolvedValue(created);

    const result = await createUserBodyMetric(
      USER_ID,
      140,
      65,
      'female',
      29,
      'moderate',
      deps,
    );

    expect(result).toEqual(created);
  });
});
