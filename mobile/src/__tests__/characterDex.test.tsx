import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { CharacterDexDetail } from '../components/characterDex/CharacterDexDetail';
import { CHARACTER_CATALOG } from '../domain/catalog';
import {
  CHARACTER_DEX,
  CHARACTER_STAGE_ART,
  getCharacterDexEntry,
  getEvolutionSlots,
} from '../domain/characterDex';
import type { CharacterId } from '../domain/types';
import { createInitialState } from '../state/initialState';

describe('character dex metadata', () => {
  test('has one dex entry for every catalog character without changing character ids', () => {
    expect(Object.keys(CHARACTER_DEX).sort()).toEqual(Object.keys(CHARACTER_CATALOG).sort());
  });

  test('has four stage art assets for every catalog character', () => {
    (Object.keys(CHARACTER_CATALOG) as CharacterId[]).forEach((characterId) => {
      expect(Object.keys(CHARACTER_STAGE_ART[characterId]).sort()).toEqual([
        'adult',
        'baby',
        'egg',
        'growing',
      ]);
    });
  });

  test('returns visible future silhouettes and unlocked current progress', () => {
    const character = {
      ...createInitialState('starter-sprout').characters['starter-sprout'],
      stage: 'baby' as const,
    };

    expect(getEvolutionSlots(character).map((slot) => [slot.stage, slot.state])).toEqual([
      ['egg', 'unlocked'],
      ['baby', 'unlocked'],
      ['growing', 'visible'],
      ['adult', 'visible'],
    ]);
  });

  test('keeps locked characters hidden behind mystery labels', () => {
    const locked = createInitialState('starter-sprout').characters['cloud-puff'];

    expect(getEvolutionSlots(locked).map((slot) => slot.state)).toEqual([
      'hidden',
      'hidden',
      'hidden',
      'hidden',
    ]);
  });
});

describe('CharacterDexDetail', () => {
  test('shows rich description, role, skill, and evolution silhouettes for discovered characters', () => {
    const data = createInitialState('starter-sprout');
    const character = data.characters['starter-sprout'];
    const entry = getCharacterDexEntry(character.id);

    render(<CharacterDexDetail character={character} />);

    expect(screen.getByText(entry.displayName)).toBeTruthy();
    expect(screen.getByText(entry.shortBio)).toBeTruthy();
    expect(screen.getByText(entry.personality)).toBeTruthy();
    expect(screen.getAllByText('방어형').length).toBeGreaterThan(0);
    expect(screen.getByText(CHARACTER_CATALOG['starter-sprout'].skillName)).toBeTruthy();
    expect(screen.getByLabelText('새싹콩 알 도감 이미지')).toBeTruthy();
    expect(screen.getByText('성장기 실루엣')).toBeTruthy();
    expect(screen.getByText('성체 실루엣')).toBeTruthy();
  });

  test('does not leak locked character names or descriptions', () => {
    const data = createInitialState('starter-sprout');
    const lockedCharacter = data.characters['ember-dot'];
    const lockedEntry = getCharacterDexEntry('ember-dot');

    render(<CharacterDexDetail character={lockedCharacter} />);

    expect(screen.getAllByText('???').length).toBeGreaterThan(0);
    expect(screen.getByText(lockedEntry.unlockHint)).toBeTruthy();
    expect(screen.queryByText(lockedEntry.displayName)).toBeNull();
    expect(screen.queryByText(lockedEntry.shortBio)).toBeNull();
  });

  test('renders all current character ids through the detail component', () => {
    const data = createInitialState('starter-sprout');

    (Object.keys(CHARACTER_CATALOG) as CharacterId[]).forEach((characterId) => {
      const { unmount } = render(<CharacterDexDetail character={data.characters[characterId]} />);
      if (data.characters[characterId].discovered) {
        expect(screen.getByText(getCharacterDexEntry(characterId).displayName)).toBeTruthy();
      } else {
        expect(screen.getAllByText('???').length).toBeGreaterThan(0);
      }
      unmount();
    });
  });
});
