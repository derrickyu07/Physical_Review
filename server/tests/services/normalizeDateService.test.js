const { describe, it, expect } = require('vitest');
const { normalizeDate } = require('../../services/healthLogService');

describe('normalizeDate', () => {
  it('zeroes out the time to UTC midnight for a date-only string', () => {
    const result = normalizeDate('2026-03-10');
    expect(result.toISOString()).toBe('2026-03-10T00:00:00.000Z');
  });

  it('strips the time from a full ISO datetime string', () => {
    const result = normalizeDate('2026-03-10T14:37:22.123Z');
    expect(result.toISOString()).toBe('2026-03-10T00:00:00.000Z');
  });

  it('strips the time from a Date object input', () => {
    const input = new Date('2026-03-10T23:59:59.999Z');
    const result = normalizeDate(input);
    expect(result.toISOString()).toBe('2026-03-10T00:00:00.000Z');
  });

  it('does not mutate the original Date object passed in', () => {
    const input = new Date('2026-03-10T23:59:59.999Z');
    const originalTime = input.getTime();
    normalizeDate(input);
    expect(input.getTime()).toBe(originalTime);
  });

  it('handles the December 31 -> January 1 year rollover correctly', () => {
    const result = normalizeDate('2025-12-31T23:30:00.000Z');
    expect(result.toISOString()).toBe('2025-12-31T00:00:00.000Z');
  });

  it('handles a leap day (Feb 29) without rolling into March', () => {
    const result = normalizeDate('2028-02-29T18:00:00.000Z');
    expect(result.toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });

  it('normalizes consistently regardless of the local timezone the test runs in', () => {
    // Guards against a regression to setHours (local time) instead of
    // setUTCHours — the exact bug class already caught once in this codebase.
    // A date string with an explicit UTC offset near a day boundary is the
    // sharpest test for this: local-time math would push it to the wrong day.
    const result = normalizeDate('2026-03-10T01:00:00+02:00'); // = 2026-03-09T23:00:00Z
    expect(result.toISOString()).toBe('2026-03-09T00:00:00.000Z');
  });
});
