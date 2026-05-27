import { describe, expect, jest, test } from '@jest/globals';

import type { AppData, StudySession } from '../domain/types';
import { createInitialState } from '../state/initialState';
import { createAppActions, createAppStore } from '../state/useAppStore';

function completedSession(id: string, completedAt = '2026-05-26T10:00:00.000Z'): StudySession {
  return {
    id,
    startedAt: completedAt,
    completedAt,
    durationMinutes: 30,
    rewardClaimed: false,
  };
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

describe('app store actions', () => {
  const actions = createAppActions();

  test('awards a completed session only once', () => {
    const initial = createInitialState('starter-sprout');
    const session = completedSession('focus-1');

    const first = actions.completeSession(initial, session);
    const repeated = actions.completeSession(first, session);

    expect(first.snacks).toBe(2);
    expect(first.characters['starter-sprout'].xp).toBe(30);
    expect(first.sessions).toEqual([{ ...session, rewardClaimed: true }]);
    expect(repeated.snacks).toBe(2);
    expect(repeated.characters['starter-sprout'].xp).toBe(30);
    expect(repeated.sessions.filter((saved) => saved.id === session.id)).toHaveLength(1);
  });

  test('does not replace an unclaimed same-ID session with different completion identity', () => {
    const initial = createInitialState('starter-sprout');
    const unclaimed = completedSession('focus-reused', '2026-05-26T09:00:00.000Z');
    const existing = {
      ...initial,
      activeSessionStartedAt: '2026-05-26T10:00:00.000Z',
      snacks: 7,
      discoveryPoints: 98,
      sessions: [unclaimed],
      lastReward: {
        sessionId: 'previous',
        characterId: 'starter-sprout' as const,
        reward: { xp: 30, snacks: 2, discoveryPoints: 3 },
      },
    };

    const completed = actions.completeSession(
      existing,
      completedSession('focus-reused', '2026-05-26T10:00:00.000Z'),
    );

    expect(completed).toBe(existing);
    expect(completed.activeSessionStartedAt).toBe('2026-05-26T10:00:00.000Z');
    expect(completed.characters).toBe(existing.characters);
    expect(completed.snacks).toBe(7);
    expect(completed.discoveryPoints).toBe(98);
    expect(completed.lastReward).toBe(existing.lastReward);
    expect(completed.sessions).toBe(existing.sessions);
  });

  test('feeding a discovered starter spends a snack and applies growth', () => {
    const initial = createInitialState('starter-sprout');
    const readyToGrow = {
      ...initial,
      snacks: 2,
      characters: {
        ...initial.characters,
        'starter-sprout': {
          ...initial.characters['starter-sprout'],
          xp: 60,
          friendship: 1,
        },
      },
    };

    const fed = actions.feedCharacter(readyToGrow, 'starter-sprout');

    expect(fed.snacks).toBe(1);
    expect(fed.characters['starter-sprout']).toMatchObject({
      friendship: 2,
      stage: 'baby',
    });
  });

  test('does not feed an undiscovered character', () => {
    const initial = { ...createInitialState('starter-sprout'), snacks: 1 };

    expect(actions.feedCharacter(initial, 'cloud-puff')).toBe(initial);
  });

  test('does not feed without an available snack', () => {
    const initial = createInitialState('starter-sprout');

    expect(actions.feedCharacter(initial, 'starter-sprout')).toBe(initial);
  });

  test('unlocks the next character using earned discovery points', () => {
    const initial = { ...createInitialState('starter-sprout'), discoveryPoints: 98 };

    const completed = actions.completeSession(initial, completedSession('focus-unlock'));

    expect(completed.discoveryPoints).toBe(1);
    expect(completed.characters['cloud-puff'].discovered).toBe(true);
    expect(completed.lastReward?.unlockedCharacterId).toBe('cloud-puff');
  });

  test('adds a return gift to snack inventory and receipt after time away', () => {
    const initial = createInitialState('starter-sprout');
    const returned = {
      ...initial,
      sessions: [
        {
          ...completedSession('prior', '2026-05-23T10:00:00.000Z'),
          rewardClaimed: true,
        },
      ],
    };

    const completed = actions.completeSession(
      returned,
      completedSession('return', '2026-05-26T10:00:00.000Z'),
    );

    expect(completed.snacks).toBe(4);
    expect(completed.lastReward?.returnGift).toEqual({
      type: 'snack',
      amount: 2,
      grantedAt: '2026-05-26T10:00:00.000Z',
    });
  });

  test('records a short comeback session without awarding a return gift', () => {
    const initial = createInitialState('starter-sprout');
    const returned = {
      ...initial,
      sessions: [
        {
          ...completedSession('prior', '2026-05-23T10:00:00.000Z'),
          rewardClaimed: true,
        },
      ],
    };
    const shortSession = {
      ...completedSession('short-return', '2026-05-26T10:00:00.000Z'),
      durationMinutes: 10,
    };

    const completed = actions.completeSession(returned, shortSession);

    expect(completed.sessions).toContainEqual({ ...shortSession, rewardClaimed: true });
    expect(completed.lastReward?.reward).toEqual({
      xp: 0,
      snacks: 0,
      discoveryPoints: 0,
    });
    expect(completed.lastReward?.returnGift).toBeUndefined();
    expect(completed.snacks).toBe(0);
  });

  test('records a short session without spending banked discovery points on an unlock', () => {
    const initial = { ...createInitialState('starter-sprout'), discoveryPoints: 100 };
    const shortSession = {
      ...completedSession('short-banked-points'),
      durationMinutes: 10,
    };

    const completed = actions.completeSession(initial, shortSession);

    expect(completed.sessions).toContainEqual({ ...shortSession, rewardClaimed: true });
    expect(completed.lastReward?.reward).toEqual({
      xp: 0,
      snacks: 0,
      discoveryPoints: 0,
    });
    expect(completed.discoveryPoints).toBe(100);
    expect(completed.characters['cloud-puff'].discovered).toBe(false);
    expect(completed.lastReward?.unlockedCharacterId).toBeUndefined();
  });

  test('does not spend daily reward allowance on completed sessions too short to reward', () => {
    const initial = createInitialState('starter-sprout');
    const shortSessions = Array.from({ length: 18 }, (_, index) => ({
      ...completedSession(`short-${index}`),
      durationMinutes: 14,
      rewardClaimed: true,
    }));

    const completed = actions.completeSession(
      { ...initial, sessions: shortSessions },
      completedSession('qualifying'),
    );

    expect(completed.lastReward?.reward).toEqual({
      xp: 30,
      snacks: 2,
      discoveryPoints: 3,
    });
  });

  test.each([
    ['startedAt', { startedAt: '2026-02-30T00:00:00.000Z' }],
    ['completedAt', { completedAt: '2026-02-30T00:00:00.000Z' }],
  ])('does not generate rewards or a receipt for an impossible %s date', (_, invalidTime) => {
    const initial = createInitialState('starter-sprout');
    const eligibleForUnlockAndGift = {
      ...initial,
      discoveryPoints: 98,
      sessions: [
        {
          ...completedSession('prior', '2026-05-23T10:00:00.000Z'),
          rewardClaimed: true,
        },
      ],
    };

    const completed = actions.completeSession(eligibleForUnlockAndGift, {
      ...completedSession('invalid-completion', '2026-05-26T10:00:00.000Z'),
      ...invalidTime,
    });

    expect(completed).toBe(eligibleForUnlockAndGift);
    expect(completed.characters['starter-sprout'].xp).toBe(0);
    expect(completed.snacks).toBe(0);
    expect(completed.discoveryPoints).toBe(98);
    expect(completed.characters['cloud-puff'].discovered).toBe(false);
    expect(completed.lastReward).toBeUndefined();
    expect(completed.sessions).toEqual(eligibleForUnlockAndGift.sessions);
  });

  test.each([
    ['negative', -1],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
  ])('does not change marker, rewards, receipt, or sessions for a %s duration completion', (_, durationMinutes) => {
    const initial = createInitialState('starter-sprout');
    const priorSession = {
      ...completedSession('prior', '2026-05-26T00:30:00.000Z'),
      rewardClaimed: true,
    };
    const activeData = {
      ...initial,
      activeSessionStartedAt: '2026-05-26T01:00:00.000Z',
      snacks: 7,
      discoveryPoints: 98,
      sessions: [priorSession],
      lastReward: {
        sessionId: priorSession.id,
        characterId: 'starter-sprout' as const,
        reward: { xp: 30, snacks: 2, discoveryPoints: 3 },
      },
    };

    const completed = actions.completeSession(activeData, {
      id: `invalid-duration-${String(durationMinutes)}`,
      startedAt: activeData.activeSessionStartedAt,
      completedAt: '2026-05-26T01:30:00.000Z',
      durationMinutes,
      rewardClaimed: false,
    });

    expect(completed).toBe(activeData);
    expect(completed.activeSessionStartedAt).toBe(activeData.activeSessionStartedAt);
    expect(completed.characters).toBe(activeData.characters);
    expect(completed.snacks).toBe(7);
    expect(completed.discoveryPoints).toBe(98);
    expect(completed.lastReward).toBe(activeData.lastReward);
    expect(completed.sessions).toBe(activeData.sessions);
  });

  test('does not reward or record an ordered-marker session that completes before it starts', () => {
    const initial = createInitialState('starter-sprout');
    const eligibleForUnlockAndGift = {
      ...initial,
      activeSessionStartedAt: '2026-05-26T11:00:00.000Z',
      discoveryPoints: 98,
      sessions: [
        {
          ...completedSession('prior', '2026-05-23T10:00:00.000Z'),
          rewardClaimed: true,
        },
      ],
    };

    const completed = actions.completeSession(eligibleForUnlockAndGift, {
      ...completedSession('reverse-completion', '2026-05-26T10:00:00.000Z'),
      startedAt: '2026-05-26T11:00:00.000Z',
    });

    expect(completed).toBe(eligibleForUnlockAndGift);
    expect(completed.activeSessionStartedAt).toBe('2026-05-26T11:00:00.000Z');
    expect(completed.characters['starter-sprout'].xp).toBe(0);
    expect(completed.snacks).toBe(0);
    expect(completed.discoveryPoints).toBe(98);
    expect(completed.characters['cloud-puff'].discovered).toBe(false);
    expect(completed.lastReward).toBeUndefined();
    expect(completed.sessions).toEqual(eligibleForUnlockAndGift.sessions);
  });

  test('does not change rewards, receipt, session, or marker for a completion before the latest completed session', () => {
    const initial = createInitialState('starter-sprout');
    const previouslyCompleted = {
      ...completedSession('latest', '2026-05-26T10:00:00.000Z'),
      rewardClaimed: true,
    };
    const chronologicalState = {
      ...initial,
      activeSessionStartedAt: '2026-05-26T09:00:00.000Z',
      snacks: 7,
      discoveryPoints: 98,
      sessions: [previouslyCompleted],
      lastReward: {
        sessionId: previouslyCompleted.id,
        characterId: 'starter-sprout' as const,
        reward: { xp: 30, snacks: 2, discoveryPoints: 3 },
      },
    };

    const completed = actions.completeSession(
      chronologicalState,
      completedSession('clock-rollback', '2026-05-26T09:00:00.000Z'),
    );

    expect(completed).toBe(chronologicalState);
    expect(completed.activeSessionStartedAt).toBe('2026-05-26T09:00:00.000Z');
    expect(completed.characters).toBe(chronologicalState.characters);
    expect(completed.snacks).toBe(7);
    expect(completed.discoveryPoints).toBe(98);
    expect(completed.lastReward).toBe(chronologicalState.lastReward);
    expect(completed.sessions).toBe(chronologicalState.sessions);
  });

  test('does not change marker, rewards, receipt, or sessions for a distinct completion overlapping the latest session', () => {
    const initial = createInitialState('starter-sprout');
    const previouslyCompleted = {
      id: 'latest',
      startedAt: '2026-05-26T09:00:00.000Z',
      completedAt: '2026-05-26T10:00:00.000Z',
      durationMinutes: 60,
      rewardClaimed: true,
    };
    const overlappingState = {
      ...initial,
      activeSessionStartedAt: '2026-05-26T09:30:00.000Z',
      snacks: 7,
      discoveryPoints: 98,
      sessions: [previouslyCompleted],
      lastReward: {
        sessionId: previouslyCompleted.id,
        characterId: 'starter-sprout' as const,
        reward: { xp: 30, snacks: 2, discoveryPoints: 3 },
      },
    };

    const completed = actions.completeSession(overlappingState, {
      id: 'overlapping-new-session',
      startedAt: '2026-05-26T09:30:00.000Z',
      completedAt: '2026-05-26T10:30:00.000Z',
      durationMinutes: 60,
      rewardClaimed: false,
    });

    expect(completed).toBe(overlappingState);
    expect(completed.activeSessionStartedAt).toBe('2026-05-26T09:30:00.000Z');
    expect(completed.characters).toBe(overlappingState.characters);
    expect(completed.snacks).toBe(7);
    expect(completed.discoveryPoints).toBe(98);
    expect(completed.lastReward).toBe(overlappingState.lastReward);
    expect(completed.sessions).toBe(overlappingState.sessions);
  });
});

describe('persisted app store mutations', () => {
  test('does not publish a mutation when saving it rejects', async () => {
    const store = createAppStore({
      loadAppData: async () => null,
      saveAppData: async () => {
        throw new Error('save failed');
      },
    });

    await expect(store.getState().selectStarter('starter-sprout')).rejects.toThrow('save failed');
    expect(store.getState().data).toEqual(createInitialState());
  });

  test('serializes delayed writes so later actions persist after earlier actions', async () => {
    const saved: AppData[] = [];
    const saves: Array<ReturnType<typeof deferred<void>>> = [];
    const store = createAppStore({
      loadAppData: async () => null,
      saveAppData: jest.fn((data: AppData) => {
        const save = deferred<void>();
        saved.push(data);
        saves.push(save);
        return save.promise;
      }),
    });

    const first = store.getState().selectStarter('starter-sprout');
    const second = store.getState().completeSession(completedSession('ordered'));

    await Promise.resolve();
    expect(saved).toHaveLength(1);

    saves[0].resolve();
    await first;
    await Promise.resolve();
    expect(saved).toHaveLength(2);
    expect(saved[1].lastReward?.sessionId).toBe('ordered');

    saves[1].resolve();
    await second;
    expect(store.getState().data.lastReward?.sessionId).toBe('ordered');
  });

  test('does not overwrite a local mutation when delayed hydration resolves', async () => {
    const loaded = deferred<AppData | null>();
    const store = createAppStore({
      loadAppData: () => loaded.promise,
      saveAppData: async () => undefined,
    });

    const hydrate = store.getState().hydrate();
    await store.getState().selectStarter('starter-sprout');
    loaded.resolve(createInitialState('starter-comet'));
    await hydrate;

    expect(store.getState().data.activeCharacterId).toBe('starter-sprout');
    expect(store.getState().hydrated).toBe(true);
  });

  test('applies delayed hydration after a no-op mutation attempt', async () => {
    const loaded = deferred<AppData | null>();
    const saveAppData = jest.fn(async () => undefined);
    const store = createAppStore({
      loadAppData: () => loaded.promise,
      saveAppData,
    });

    const hydrate = store.getState().hydrate();
    await store.getState().completeSession(completedSession('no-starter'));
    loaded.resolve(createInitialState('starter-sprout'));
    await hydrate;

    expect(saveAppData).not.toHaveBeenCalled();
    expect(store.getState().data.activeCharacterId).toBe('starter-sprout');
  });

  test('applies delayed hydration after a rejected mutation save', async () => {
    const loaded = deferred<AppData | null>();
    const store = createAppStore({
      loadAppData: () => loaded.promise,
      saveAppData: async () => {
        throw new Error('save failed');
      },
    });

    const hydrate = store.getState().hydrate();
    await expect(store.getState().selectStarter('starter-sprout')).rejects.toThrow('save failed');
    loaded.resolve(createInitialState('starter-comet'));
    await hydrate;

    expect(store.getState().data.activeCharacterId).toBe('starter-comet');
  });
});
