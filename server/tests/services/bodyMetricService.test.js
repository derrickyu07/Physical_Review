const { describe, it, expect, vi, beforeEach } = require('vitest');
const {
  calculateBMI,
  getUserMetrics,
  updateUserBodyMetric,
  createUserBodyMetric,
} = require('../../services/bodyMetricService');
const BodyMetricEntry = require('../models/BodyMetric');

vi.mock('../../models/BodyMetricEntry');

const USER_ID = 'user_id';
beforeEach(() => {
  vi.clearAllMocks();
});

describe('calculateBMI', () => {
  it('returns BMI given weight and height', () => {
    expect(calculateBMI(60, 140).toBe(27));
  });
});
describe('getUserMetrics', async () => {
  it('queries the most recent entry for the given user, sorted by createdAt descending', async () => {
    const sort = vi.fn().mockResolvedValue({
      gender: 'female',
      weight: 140,
      height: 65,
      age: 29,
      activityLevel: 'moderate',
      bmi: 23.3,
    });
    BodyMetricEntry.findOne.mockReturnValue({ sort });

    await getUserMetrics(USER_ID);

    expect(BodyMetricEntry.findOne).toHaveBeenCalledWith({ userId: USER_ID });
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });
  it('returns null when the user has no body metric entries', async () => {
    const sort = vi.fn().mockResolvedValue(null);
    BodyMetricEntry.findOne.mockReturnValue({ sort });

    const result = await getUserMetrics(USER_ID);

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
    BodyMetricEntry.findOne.mockReturnValue({ sort });

    const result = await getUserMetrics(USER_ID);

    expect(result).toEqual({
      gender: 'male',
      weight: 180,
      height: 70,
      age: 34,
      activityLevel: 'active',
      bmi: 25.8,
    });
    // Confirms internal/unrelated document fields aren't passed through
    expect(result).not.toHaveProperty('_id');
    expect(result).not.toHaveProperty('createdAt');
  });
});

describe('updateUserBodyMetric', () => {
  const ID = 'metric-1';

  it('recalculates BMI using the new height and the existing weight when only height changes', async () => {
    BodyMetricEntry.findOne.mockResolvedValue({ height: 65, weight: 140 });
    BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });
    calculateBMI.mockReturnValue(24.1);

    await updateUserBodyMetric(ID, USER_ID, { height: 68 });

    expect(calculateBMI).toHaveBeenCalledWith(68, 140); // new height, existing weight
    const [, update] = BodyMetricEntry.findOneAndUpdate.mock.calls[0];
    expect(update.$set.bmi).toBe(24.1);
  });

  it('recalculates BMI using the new weight and the existing height when only weight changes', async () => {
    BodyMetricEntry.findOne.mockResolvedValue({ height: 65, weight: 140 });
    BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });
    calculateBMI.mockReturnValue(25.5);

    await updateUserBodyMetric(ID, USER_ID, { weight: 148 });

    expect(calculateBMI).toHaveBeenCalledWith(65, 148); // existing height, new weight
  });

  it('recalculates BMI using both new values when both change', async () => {
    BodyMetricEntry.findOne.mockResolvedValue({ height: 65, weight: 140 });
    BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });
    calculateBMI.mockReturnValue(26.0);

    await updateUserBodyMetric(ID, USER_ID, { height: 68, weight: 150 });

    expect(calculateBMI).toHaveBeenCalledWith(68, 150);
  });

  it('does not touch BMI or call findOne when neither height nor weight is being updated', async () => {
    BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });

    await updateUserBodyMetric(ID, USER_ID, { activityLevel: 'active' });

    expect(BodyMetricEntry.findOne).not.toHaveBeenCalled();
    expect(calculateBMI).not.toHaveBeenCalled();
    const [, update] = BodyMetricEntry.findOneAndUpdate.mock.calls[0];
    expect(update.$set).not.toHaveProperty('bmi');
  });

  it('returns null and never calls findOneAndUpdate when no matching entry exists for this user (IDOR safety)', async () => {
    BodyMetricEntry.findOne.mockResolvedValue(null);

    const result = await updateUserBodyMetric(ID, 'some-other-user', {
      height: 68,
    });

    expect(result).toBeNull();
    expect(BodyMetricEntry.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('scopes the update to both _id and userId, using $set with runValidators', async () => {
    BodyMetricEntry.findOneAndUpdate.mockResolvedValue({ _id: ID });

    await updateUserBodyMetric(ID, USER_ID, { activityLevel: 'sedentary' });

    const [filter, update, options] =
      BodyMetricEntry.findOneAndUpdate.mock.calls[0];
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
    calculateBMI.mockReturnValue(22.9);
    BodyMetricEntry.create.mockResolvedValue({ _id: 'new-metric' });

    await createUserBodyMetric(USER_ID, 140, 65, 'female', 29, 'moderate');

    expect(calculateBMI).toHaveBeenCalledWith(65, 140); // height, weight order
    expect(BodyMetricEntry.create).toHaveBeenCalledWith({
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
    calculateBMI.mockReturnValue(22.9);
    const created = { _id: 'new-metric', userId: USER_ID };
    BodyMetricEntry.create.mockResolvedValue(created);

    const result = await createUserBodyMetric(
      USER_ID,
      140,
      65,
      'female',
      29,
      'moderate',
    );

    expect(result).toEqual(created);
  });
});
