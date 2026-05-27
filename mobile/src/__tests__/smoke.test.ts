import { describe, expect, test } from '@jest/globals';

import { CHARACTER_CATALOG, STARTER_IDS } from '../domain/catalog';
import { createInitialState } from '../state/initialState';

describe('first functional slice', () => {
  test('provides three starter characters in an eight-character catalog', () => {
    expect(STARTER_IDS).toHaveLength(3);
    expect(Object.keys(CHARACTER_CATALOG)).toHaveLength(8);
    expect(CHARACTER_CATALOG['starter-sprout'].skillName).toBe('포근한 보호막');
    expect(CHARACTER_CATALOG['starter-sprout'].palette.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('discovers and activates only the selected starter initially', () => {
    const state = createInitialState('starter-sprout');
    const sprout = state.characters['starter-sprout'];
    const cloudPuff = state.characters['cloud-puff'];

    expect(state.selectedStarter).toBe(true);
    expect(state.activeCharacterId).toBe('starter-sprout');
    expect(sprout).toMatchObject({
      stage: 'egg',
      xp: 0,
      friendship: 0,
      discovered: true,
    });
    expect(cloudPuff.discovered).toBe(false);
  });

  test('defines and selects every starter as its only discovered character', () => {
    for (const starterId of STARTER_IDS) {
      const definition = CHARACTER_CATALOG[starterId];
      const state = createInitialState(starterId);
      const discoveredIds = Object.values(state.characters)
        .filter((character) => character.discovered)
        .map((character) => character.id);

      expect(definition.id).toBe(starterId);
      expect(definition.starter).toBe(true);
      expect(state.activeCharacterId).toBe(starterId);
      expect(discoveredIds).toEqual([starterId]);
    }
  });

  test('starts without an active character when no starter is selected', () => {
    const state = createInitialState();

    expect(state.selectedStarter).toBe(false);
    expect(state.activeCharacterId).toBeNull();
    expect(Object.values(state.characters).every((character) => !character.discovered)).toBe(true);
  });

  test('rejects a character that is not a starter', () => {
    expect(() => createInitialState('cloud-puff')).toThrow('Invalid starter character');
  });

  test('rejects a catalog character not marked as a starter', () => {
    const sprout = CHARACTER_CATALOG['starter-sprout'];
    const wasStarter = sprout.starter;

    try {
      sprout.starter = false;
      expect(() => createInitialState('starter-sprout')).toThrow('Invalid starter character');
    } finally {
      sprout.starter = wasStarter;
    }
  });

  test('rejects a starter definition whose id does not match its catalog key', () => {
    const sprout = CHARACTER_CATALOG['starter-sprout'];
    const originalId = sprout.id;

    try {
      sprout.id = 'starter-comet';
      expect(() => createInitialState('starter-sprout')).toThrow('Invalid starter character');
    } finally {
      sprout.id = originalId;
    }
  });
});
