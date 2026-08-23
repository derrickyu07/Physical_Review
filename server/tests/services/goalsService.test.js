const { describe, it, expect, vi, beforeEach } = require('vitest');

const { deriveGoalStatus } = require('../../services/goalService');

const NOW = new Date('2026-06-15T12:00:00.000Z');
const PAST = new Date('2026-01-01T00:00:00.000Z');
const FUTURE = new Date('2026-12-31T00:00:00.000Z');

describe('deriveGoalStatus', () => {
  it('goal status is completed', () => {
    expect(deriveGoalStatus(PAST, PAST, NOW)).toBe('complete');
  });
  it('returns "complete" based on end date alone, even if start is in the future', () => {
    const weirdFutureStart = new Date('2026-06-20T00:00:00.000Z');
    expect(deriveGoalStatus(weirdFutureStart, PAST, NOW)).toBe('complete');
  });

  it('goal status is active', () => {
    expect(deriveGoalStatus(PAST, FUTURE, NOW)).toBe('active');
  });
  it('goal status is active when end date is null or undefined', () => {
    expect(deriveGoalStatus(PAST, null, NOW)).toBe('active');
    expect(deriveGoalStatus(PAST, undefined, NOW)).toBe('active');
  });
  it('goal status is inactive', () => {
    expect(deriveGoalStatus(FUTURE, null, NOW)).toBe('inactive');
  });
  it('treats start exactly equal to now as already active (inclusive boundary)', () => {
    expect(deriveGoalStatus(NOW, FUTURE, NOW)).toBe('active');
  });
  it('defaults to the real current time when now is not provided', () => {
    const start = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const end = new Date(Date.now() + 1000 * 60 * 60 * 24);
    expect(deriveGoalStatus(start, end)).toBe('active');
  });
});
