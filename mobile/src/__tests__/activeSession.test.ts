import { describe, expect, jest, test } from '@jest/globals';

import type { AppData, StudySession } from '../domain/types';
import { createInitialState } from '../state/initialState';
import { createAppStore, recoverElapsedMinutes } from '../state/useAppStore';

function activeState(): AppData {
  return {
    ...createInitialState('starter-sprout'),
    activeSessionStartedAt: '2026-05-26T01:00:00.000Z',
  };
}

function session(): StudySession {
  return {
    id: 'recovered-session',
    startedAt: '2026-05-26T01:00:00.000Z',
    completedAt: '2026-05-26T01:30:00.000Z',
    durationMinutes: 30,
    rewardClaimed: false,
  };
}

describe('active session elapsed recovery', () => {
  test('floors valid elapsed time to complete minutes', () => {
    expect(recoverElapsedMinutes('2026-05-26T01:00:00.000Z', '2026-05-26T01:02:59.999Z')).toBe(2);
  });

  test('fails closed when Date parsing normalizes an impossible start date', () => {
    expect(recoverElapsedMinutes('2026-02-30T00:00:00.000Z', '2026-03-02T00:30:00.000Z')).toBe(0);
  });

  test.each([
    [undefined, '2026-05-26T01:02:00.000Z'],
    ['not-a-date', '2026-05-26T01:02:00.000Z'],
    ['2026-05-26T01:00:00.000Z', 'bad-now'],
    ['2026-05-26T01:03:00.000Z', '2026-05-26T01:02:00.000Z'],
  ])('fails closed for invalid or future input', (startedAt, nowIso) => {
    expect(recoverElapsedMinutes(startedAt, nowIso)).toBe(0);
  });
});

describe('persisted active sessions', () => {
  test('does not publish a session start until its marker save succeeds', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T01:00:00.000Z'));
    let resolveSave!: () => void;
    const saving = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    const saveAppData = jest.fn(() => saving);
    const store = createAppStore({
      loadAppData: async () => createInitialState('starter-sprout'),
      saveAppData,
    });
    await store.getState().hydrate();

    const start = store.getState().startSession();
    await Promise.resolve();

    expect(saveAppData).toHaveBeenCalledWith({
      ...createInitialState('starter-sprout'),
      activeSessionStartedAt: '2026-05-26T01:00:00.000Z',
    });
    expect(store.getState().data.activeSessionStartedAt).toBeUndefined();

    resolveSave();
    await start;
    expect(store.getState().data.activeSessionStartedAt).toBe('2026-05-26T01:00:00.000Z');
    jest.useRealTimers();
  });

  test('leaves no visible timer after a session start save fails', async () => {
    const store = createAppStore({
      loadAppData: async () => createInitialState('starter-sprout'),
      saveAppData: async () => {
        throw new Error('save failed');
      },
    });
    await store.getState().hydrate();

    await expect(store.getState().startSession()).rejects.toThrow('save failed');
    expect(store.getState().data.activeSessionStartedAt).toBeUndefined();
  });

  test('does not persist a new active marker while the device clock is before the latest completion', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T00:30:00.000Z'));
    const lastCompletedState: AppData = {
      ...createInitialState('starter-sprout'),
      sessions: [
        {
          id: 'last-completed',
          startedAt: '2026-05-26T00:30:00.000Z',
          completedAt: '2026-05-26T01:00:00.000Z',
          durationMinutes: 30,
          rewardClaimed: true,
        },
      ],
    };
    const saveAppData = jest.fn(async () => undefined);
    const store = createAppStore({
      loadAppData: async () => lastCompletedState,
      saveAppData,
    });
    await store.getState().hydrate();

    await store.getState().startSession();

    expect(saveAppData).not.toHaveBeenCalled();
    expect(store.getState().data).toEqual(lastCompletedState);
    jest.useRealTimers();
  });

  test('reports no start while the device clock is before the latest completion', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T00:30:00.000Z'));
    const lastCompletedState: AppData = {
      ...createInitialState('starter-sprout'),
      sessions: [
        {
          id: 'last-completed',
          startedAt: '2026-05-26T00:30:00.000Z',
          completedAt: '2026-05-26T01:00:00.000Z',
          durationMinutes: 30,
          rewardClaimed: true,
        },
      ],
    };
    const saveAppData = jest.fn(async () => undefined);
    const store = createAppStore({
      loadAppData: async () => lastCompletedState,
      saveAppData,
    });
    await store.getState().hydrate();

    const started = await store.getState().startSessionWithResult();

    expect(started).toBe(false);
    expect(saveAppData).not.toHaveBeenCalled();
    expect(store.getState().data).toEqual(lastCompletedState);
    jest.useRealTimers();
  });

  test('atomically removes the active marker when completion persists', async () => {
    const saveAppData = jest.fn(async () => undefined);
    const store = createAppStore({
      loadAppData: async () => activeState(),
      saveAppData,
    });
    await store.getState().hydrate();

    await store.getState().completeSession(session());

    expect(saveAppData).toHaveBeenCalledWith(
      expect.objectContaining({
        activeSessionStartedAt: undefined,
        sessions: [{ ...session(), rewardClaimed: true }],
      }),
    );
    expect(store.getState().data.activeSessionStartedAt).toBeUndefined();
  });

  test('keeps the active marker when completion persistence fails so completion can be retried', async () => {
    const store = createAppStore({
      loadAppData: async () => activeState(),
      saveAppData: async () => {
        throw new Error('save failed');
      },
    });
    await store.getState().hydrate();

    await expect(store.getState().completeSession(session())).rejects.toThrow('save failed');
    expect(store.getState().data).toEqual(activeState());
  });

  test('does not publish a cleared active marker until its save succeeds', async () => {
    let resolveSave!: () => void;
    const saving = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    const saveAppData = jest.fn(() => saving);
    const store = createAppStore({
      loadAppData: async () => activeState(),
      saveAppData,
    });
    await store.getState().hydrate();

    const clear = store.getState().clearActiveSession();
    await Promise.resolve();

    expect(saveAppData).toHaveBeenCalledWith({
      ...activeState(),
      activeSessionStartedAt: undefined,
    });
    expect(store.getState().data.activeSessionStartedAt).toBe('2026-05-26T01:00:00.000Z');

    resolveSave();
    await clear;
    expect(store.getState().data.activeSessionStartedAt).toBeUndefined();
  });

  test('keeps the active marker when clearing it cannot be saved so cancellation can be retried', async () => {
    const store = createAppStore({
      loadAppData: async () => activeState(),
      saveAppData: async () => {
        throw new Error('save failed');
      },
    });
    await store.getState().hydrate();

    await expect(store.getState().clearActiveSession()).rejects.toThrow('save failed');
    expect(store.getState().data).toEqual(activeState());
  });

  test('does not save when clearing without an active marker', async () => {
    const inactiveState = createInitialState('starter-sprout');
    const saveAppData = jest.fn(async () => undefined);
    const store = createAppStore({
      loadAppData: async () => inactiveState,
      saveAppData,
    });
    await store.getState().hydrate();

    await store.getState().clearActiveSession();

    expect(saveAppData).not.toHaveBeenCalled();
    expect(store.getState().data).toEqual(inactiveState);
  });

  test('ignores completion for a different active start marker', async () => {
    const saveAppData = jest.fn(async () => undefined);
    const store = createAppStore({
      loadAppData: async () => activeState(),
      saveAppData,
    });
    await store.getState().hydrate();

    await store.getState().completeSession({
      ...session(),
      startedAt: '2026-05-26T00:00:00.000Z',
    });

    expect(saveAppData).not.toHaveBeenCalled();
    expect(store.getState().data).toEqual(activeState());
  });

  test('reports no completion and does not persist for a matching future active start marker', async () => {
    const futureActiveState: AppData = {
      ...activeState(),
      activeSessionStartedAt: '2026-05-26T02:00:00.000Z',
    };
    const saveAppData = jest.fn(async () => undefined);
    const store = createAppStore({
      loadAppData: async () => futureActiveState,
      saveAppData,
    });
    await store.getState().hydrate();

    const completed = await store.getState().completeSessionWithResult({
      ...session(),
      startedAt: futureActiveState.activeSessionStartedAt!,
    });

    expect(completed).toBe(false);
    expect(saveAppData).not.toHaveBeenCalled();
    expect(store.getState().data).toEqual(futureActiveState);
  });
});
