import { describe, expect, test } from '@jest/globals';

import { calculateSessionReward } from '../domain/rewards';

describe('session rewards', () => {
  test('does not reward a session shorter than fifteen minutes', () => {
    expect(calculateSessionReward(14, 0)).toEqual({
      xp: 0,
      snacks: 0,
      discoveryPoints: 0,
    });
  });

  test('rewards effective study minutes at the full rate', () => {
    expect(calculateSessionReward(30, 0)).toEqual({
      xp: 30,
      snacks: 2,
      discoveryPoints: 3,
    });
  });

  test('halves effective study minutes after four hours rewarded today', () => {
    expect(calculateSessionReward(60, 240)).toEqual({
      xp: 30,
      snacks: 2,
      discoveryPoints: 3,
    });
  });

  test('gives no reward for a negative session duration', () => {
    expect(calculateSessionReward(-1, 0)).toEqual({
      xp: 0,
      snacks: 0,
      discoveryPoints: 0,
    });
  });

  test('gives no reward for negative rewarded minutes today', () => {
    expect(calculateSessionReward(30, -1)).toEqual({
      xp: 0,
      snacks: 0,
      discoveryPoints: 0,
    });
  });

  test('gives no reward for a non-finite session duration', () => {
    expect(calculateSessionReward(Number.NaN, 0)).toEqual({
      xp: 0,
      snacks: 0,
      discoveryPoints: 0,
    });
  });

  test('gives no reward for non-finite rewarded minutes today', () => {
    expect(calculateSessionReward(30, Number.POSITIVE_INFINITY)).toEqual({
      xp: 0,
      snacks: 0,
      discoveryPoints: 0,
    });
  });
});
