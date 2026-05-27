import { create } from 'zustand';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import { applyGrowth, unlockNextCharacter } from '../domain/progression';
import { calculateSessionReward } from '../domain/rewards';
import { createReturnGift } from '../domain/returnGift';
import type { AppData, CharacterId, RewardReceipt, StudySession } from '../domain/types';
import { isCanonicalIsoTimestamp, isChronologicalIsoRange, localDateKey } from '../utils/time';
import { createInitialState } from './initialState';

export function recoverElapsedMinutes(startedAt: unknown, nowIso: unknown): number {
  if (!isCanonicalIsoTimestamp(startedAt) || !isCanonicalIsoTimestamp(nowIso)) {
    return 0;
  }

  const startedAtMs = Date.parse(startedAt);
  const nowMs = Date.parse(nowIso);

  if (!Number.isFinite(startedAtMs) || !Number.isFinite(nowMs) || startedAtMs > nowMs) {
    return 0;
  }

  return Math.floor((nowMs - startedAtMs) / (60 * 1000));
}

export interface AppActions {
  completeSession(data: AppData, session: StudySession): AppData;
  feedCharacter(data: AppData, characterId: CharacterId): AppData;
}

export function createAppActions(): AppActions {
  return {
    completeSession(data, session) {
      const characterId = data.activeCharacterId;
      const latestCompletedSession = data.sessions[data.sessions.length - 1];
      const existingSession = data.sessions.find((savedSession) => savedSession.id === session.id);

      if (
        !characterId ||
        !isChronologicalIsoRange(session.startedAt, session.completedAt) ||
        !Number.isFinite(session.durationMinutes) ||
        session.durationMinutes < 0 ||
        (latestCompletedSession !== undefined &&
          !isChronologicalIsoRange(latestCompletedSession.completedAt, session.completedAt)) ||
        (latestCompletedSession !== undefined &&
          latestCompletedSession.id !== session.id &&
          !isChronologicalIsoRange(latestCompletedSession.completedAt, session.startedAt)) ||
        (data.activeSessionStartedAt !== undefined && data.activeSessionStartedAt !== session.startedAt) ||
        (existingSession !== undefined &&
          (existingSession.rewardClaimed ||
            existingSession.startedAt !== session.startedAt ||
            existingSession.completedAt !== session.completedAt ||
            existingSession.durationMinutes !== session.durationMinutes))
      ) {
        return data;
      }

      const sessionDateKey = localDateKey(session.completedAt);
      const rewardedMinutesToday = data.sessions
        .filter(
          (savedSession) =>
            savedSession.rewardClaimed &&
            calculateSessionReward(savedSession.durationMinutes, 0).xp > 0 &&
            localDateKey(savedSession.completedAt) === sessionDateKey,
        )
        .reduce((minutes, savedSession) => minutes + savedSession.durationMinutes, 0);
      const reward = calculateSessionReward(session.durationMinutes, rewardedMinutesToday);
      const isRewardedSession = reward.xp > 0;
      const currentCharacter = data.characters[characterId];
      const grownCharacter = applyGrowth({
        ...currentCharacter,
        xp: currentCharacter.xp + reward.xp,
      });
      const unlock = isRewardedSession
        ? unlockNextCharacter(data.characters, data.discoveryPoints + reward.discoveryPoints)
        : { remainingPoints: data.discoveryPoints };
      const returnGift = isRewardedSession
        ? createReturnGift(
            [...data.sessions]
              .reverse()
              .find((savedSession) => savedSession.rewardClaimed)?.completedAt,
            session.completedAt,
          )
        : undefined;
      const receipt: RewardReceipt = {
        sessionId: session.id,
        reward,
        characterId,
      };

      if (grownCharacter.stage !== currentCharacter.stage) {
        receipt.grewFrom = currentCharacter.stage;
        receipt.grewTo = grownCharacter.stage;
      }

      if (unlock.unlockedCharacterId) {
        receipt.unlockedCharacterId = unlock.unlockedCharacterId;
      }

      if (returnGift) {
        receipt.returnGift = returnGift;
      }

      const characters = {
        ...data.characters,
        [characterId]: grownCharacter,
      };

      if (unlock.unlockedCharacterId) {
        characters[unlock.unlockedCharacterId] = {
          ...characters[unlock.unlockedCharacterId],
          discovered: true,
        };
      }

      const savedSession = { ...session, rewardClaimed: true };
      const sessions = data.sessions.some((existingSession) => existingSession.id === session.id)
        ? data.sessions.map((existingSession) =>
            existingSession.id === session.id ? savedSession : existingSession,
          )
        : [...data.sessions, savedSession];

      return {
        ...data,
        activeSessionStartedAt: undefined,
        characters,
        sessions,
        snacks: data.snacks + reward.snacks + (returnGift?.type === 'snack' ? returnGift.amount : 0),
        discoveryPoints: unlock.remainingPoints,
        lastReward: receipt,
      };
    },

    feedCharacter(data, characterId) {
      const character = data.characters[characterId];

      if (!Number.isFinite(data.snacks) || data.snacks < 1 || !character.discovered) {
        return data;
      }

      return {
        ...data,
        snacks: data.snacks - 1,
        characters: {
          ...data.characters,
          [characterId]: applyGrowth({
            ...character,
            friendship: character.friendship + 1,
          }),
        },
      };
    },
  };
}

export interface AppPersistence {
  loadAppData(): Promise<AppData | null>;
  saveAppData(data: AppData): Promise<void>;
}

export interface AppStore {
  data: AppData;
  hydrated: boolean;
  hydrate(): Promise<void>;
  selectStarter(starterId: CharacterId): Promise<void>;
  startSession(): Promise<void>;
  startSessionWithResult(): Promise<boolean>;
  completeSession(session: StudySession): Promise<void>;
  completeSessionWithResult(session: StudySession): Promise<boolean>;
  clearActiveSession(): Promise<void>;
  feedCharacter(characterId: CharacterId): Promise<void>;
  setActiveCharacter(characterId: CharacterId): Promise<void>;
}

const actions = createAppActions();

function createStoreState(persistence: AppPersistence): StateCreator<AppStore> {
  return (set, get) => {
    let localMutationCommitted = false;
    let writeQueue: Promise<void> = Promise.resolve();

    function mutateWithResult(createData: (currentData: AppData) => AppData): Promise<boolean> {
      const queuedMutation = writeQueue.then(async () => {
        const currentData = get().data;
        const data = createData(currentData);

        if (data === currentData) {
          return false;
        }

        await persistence.saveAppData(data);
        set({ data });
        localMutationCommitted = true;
        return true;
      });

      writeQueue = queuedMutation.then(
        () => undefined,
        () => undefined,
      );

      return queuedMutation;
    }

    function mutate(createData: (currentData: AppData) => AppData): Promise<void> {
      return mutateWithResult(createData).then(() => undefined);
    }

    function startSessionWithResult(): Promise<boolean> {
      const startedAt = new Date().toISOString();

      return mutateWithResult((data) => {
        if (!data.activeCharacterId || data.activeSessionStartedAt) {
          return data;
        }

        const latestCompletedSession = data.sessions[data.sessions.length - 1];
        if (
          latestCompletedSession &&
          !isChronologicalIsoRange(latestCompletedSession.completedAt, startedAt)
        ) {
          return data;
        }

        return { ...data, activeSessionStartedAt: startedAt };
      });
    }

    return {
      data: createInitialState(),
      hydrated: false,

      async hydrate() {
        const storedData = await persistence.loadAppData();

        if (localMutationCommitted) {
          set({ hydrated: true });
          return;
        }

        set({ data: storedData ?? createInitialState(), hydrated: true });
      },

      selectStarter(starterId) {
        return mutate(() => createInitialState(starterId));
      },

      startSession() {
        return startSessionWithResult().then(() => undefined);
      },

      startSessionWithResult() {
        return startSessionWithResult();
      },

      completeSession(session) {
        return mutate((data) => actions.completeSession(data, session));
      },

      completeSessionWithResult(session) {
        return mutateWithResult((data) => actions.completeSession(data, session));
      },

      clearActiveSession() {
        return mutate((data) =>
          data.activeSessionStartedAt === undefined
            ? data
            : { ...data, activeSessionStartedAt: undefined },
        );
      },

      feedCharacter(characterId) {
        return mutate((data) => actions.feedCharacter(data, characterId));
      },

      setActiveCharacter(characterId) {
        return mutate((data) => {
          if (!data.characters[characterId].discovered) {
            return data;
          }

          return { ...data, activeCharacterId: characterId };
        });
      },
    };
  };
}

export function createAppStore(persistence: AppPersistence): StoreApi<AppStore> {
  return createStore<AppStore>(createStoreState(persistence));
}

const productionPersistence: AppPersistence = {
  async loadAppData() {
    const { loadAppData } = await import('../storage/appStorage');
    return loadAppData();
  },
  async saveAppData(data) {
    const { saveAppData } = await import('../storage/appStorage');
    await saveAppData(data);
  },
};

export const useAppStore = create<AppStore>(createStoreState(productionPersistence));
