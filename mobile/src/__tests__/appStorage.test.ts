import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StudySession } from '../domain/types';
import { createInitialState } from '../state/initialState';
import { loadAppData, normalizeAppData } from '../storage/appStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockedGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;

function session(id: string, rewardClaimed: boolean): StudySession {
  return {
    id,
    startedAt: '2026-05-26T09:30:00.000Z',
    completedAt: '2026-05-26T10:00:00.000Z',
    durationMinutes: 30,
    rewardClaimed,
  };
}

describe('app storage recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads malformed JSON as no saved state', async () => {
    mockedGetItem.mockResolvedValueOnce('{not json');

    await expect(loadAppData()).resolves.toBeNull();
  });

  test('rejects a partial persisted state', () => {
    expect(normalizeAppData({ selectedStarter: true })).toBeNull();
  });

  test('deduplicates an unclaimed then claimed exact session identity and retains a claimed record', () => {
    const initial = createInitialState('starter-sprout');
    const laterSession = {
      ...session('other-id', true),
      startedAt: '2026-05-26T10:00:00.000Z',
      completedAt: '2026-05-26T10:30:00.000Z',
    };
    const normalized = normalizeAppData({
      ...initial,
      sessions: [session('same-id', false), session('same-id', true), laterSession],
    });

    expect(normalized?.sessions).toEqual([session('same-id', true), laterSession]);
  });

  test('rejects distinct restored sessions that overlap even when completion times increase', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        sessions: [
          {
            ...session('first', true),
            startedAt: '2026-05-26T09:00:00.000Z',
          },
          {
            ...session('overlap', true),
            completedAt: '2026-05-26T10:30:00.000Z',
          },
        ],
      }),
    ).toBeNull();
  });

  test('rejects repeated unclaimed duplicate session identities', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        sessions: [session('same-id', false), session('same-id', false)],
      }),
    ).toBeNull();
  });

  test('rejects repeated claimed duplicate session identities', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        sessions: [session('same-id', true), session('same-id', true)],
      }),
    ).toBeNull();
  });

  test('rejects duplicate session ids with different identity fields', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        sessions: [
          session('same-id', false),
          {
            ...session('same-id', true),
            completedAt: '2026-05-26T10:30:00.000Z',
            durationMinutes: 60,
          },
        ],
      }),
    ).toBeNull();
  });

  test('rejects a raw completion backstep before a duplicate can hide it', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        activeSessionStartedAt: '2026-05-26T11:00:00.000Z',
        sessions: [
          {
            ...session('same-id', false),
            completedAt: '2026-05-26T12:00:00.000Z',
            durationMinutes: 150,
          },
          session('same-id', true),
        ],
      }),
    ).toBeNull();
  });

  test('rejects persisted sessions whose completion order moves backward', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        sessions: [
          session('later', true),
          {
            ...session('earlier', true),
            startedAt: '2026-05-26T08:30:00.000Z',
            completedAt: '2026-05-26T09:00:00.000Z',
          },
        ],
      }),
    ).toBeNull();
  });

  test('rejects an active marker earlier than the latest completed session', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        activeSessionStartedAt: '2026-05-26T09:00:00.000Z',
        sessions: [session('latest', true)],
      }),
    ).toBeNull();
  });

  test('rejects a persisted session whose canonical completion precedes its start', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        activeSessionStartedAt: '2026-05-26T10:30:00.000Z',
        sessions: [
          {
            ...session('reverse-order', true),
            startedAt: '2026-05-26T10:30:00.000Z',
            completedAt: '2026-05-26T10:00:00.000Z',
          },
        ],
      }),
    ).toBeNull();
  });

  test('rejects selected starter state without an active character', () => {
    const selected = createInitialState('starter-sprout');

    expect(normalizeAppData({ ...selected, activeCharacterId: null })).toBeNull();
  });

  test('rejects unselected state with an active discovered character', () => {
    const selected = createInitialState('starter-sprout');

    expect(normalizeAppData({ ...selected, selectedStarter: false })).toBeNull();
  });

  test('rejects selected state whose active character is undiscovered', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        characters: {
          ...selected.characters,
          'starter-sprout': {
            ...selected.characters['starter-sprout'],
            discovered: false,
          },
        },
      }),
    ).toBeNull();
  });

  test('rejects unselected state containing any discovered character', () => {
    const unselected = createInitialState();

    expect(
      normalizeAppData({
        ...unselected,
        characters: {
          ...unselected.characters,
          'cloud-puff': {
            ...unselected.characters['cloud-puff'],
            discovered: true,
          },
        },
      }),
    ).toBeNull();
  });

  test('accepts selected progressed state with additional discovered characters', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        characters: {
          ...selected.characters,
          'cloud-puff': {
            ...selected.characters['cloud-puff'],
            discovered: true,
          },
        },
      })?.characters['cloud-puff'].discovered,
    ).toBe(true);
  });

  test('restores a valid active session marker', () => {
    const selected = createInitialState('starter-sprout');

    expect(
      normalizeAppData({
        ...selected,
        activeSessionStartedAt: '2026-05-26T09:30:00.000Z',
      })?.activeSessionStartedAt,
    ).toBe('2026-05-26T09:30:00.000Z');
  });

  test('loads persisted state with a malformed active session marker as no visible app data', async () => {
    const selected = createInitialState('starter-sprout');
    const invalidStoredData = { ...selected, activeSessionStartedAt: 'not-a-date' };

    expect(normalizeAppData(invalidStoredData)).toBeNull();

    mockedGetItem.mockResolvedValueOnce(JSON.stringify(invalidStoredData));
    await expect(loadAppData()).resolves.toBeNull();
  });

  test('rejects an active session marker that Date parsing would normalize', async () => {
    const invalidStoredData = {
      ...createInitialState('starter-sprout'),
      activeSessionStartedAt: '2026-02-30T00:00:00.000Z',
    };

    expect(normalizeAppData(invalidStoredData)).toBeNull();

    mockedGetItem.mockResolvedValueOnce(JSON.stringify(invalidStoredData));
    await expect(loadAppData()).resolves.toBeNull();
  });
});
