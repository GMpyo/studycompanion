import { describe, expect, test } from '@jest/globals';

import { applyGrowth, unlockNextCharacter } from '../domain/progression';
import { createInitialState } from '../state/initialState';

describe('companion progression', () => {
  test('grows an egg to a baby when xp and friendship meet the threshold', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];

    expect(applyGrowth({ ...character, xp: 60, friendship: 2 }).stage).toBe('baby');
  });

  test('does not grow from xp alone', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];

    expect(applyGrowth({ ...character, xp: 60, friendship: 0 }).stage).toBe('egg');
  });

  test('unlocks the first hidden non-starter and spends one hundred discovery points', () => {
    const state = createInitialState('starter-sprout');

    expect(unlockNextCharacter(state.characters, 140)).toEqual({
      unlockedCharacterId: 'cloud-puff',
      remainingPoints: 40,
    });
  });

  test('does not unlock a character without enough discovery points', () => {
    const state = createInitialState('starter-sprout');

    expect(unlockNextCharacter(state.characters, 99)).toEqual({
      remainingPoints: 99,
    });
  });

  test('normalizes a non-finite discovery balance without unlocking', () => {
    const state = createInitialState('starter-sprout');

    expect(unlockNextCharacter(state.characters, Number.NaN)).toEqual({
      remainingPoints: 0,
    });
  });

  test('normalizes a negative discovery balance without unlocking', () => {
    const state = createInitialState('starter-sprout');

    expect(unlockNextCharacter(state.characters, -1)).toEqual({
      remainingPoints: 0,
    });
  });
});
