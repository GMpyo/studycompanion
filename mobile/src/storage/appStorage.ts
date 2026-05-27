import AsyncStorage from '@react-native-async-storage/async-storage';

import { CHARACTER_CATALOG } from '../domain/catalog';
import type {
  AppData,
  CharacterId,
  CharacterStage,
  GiftType,
  OwnedCharacter,
  RewardReceipt,
  StudySession,
} from '../domain/types';
import { isCanonicalIsoTimestamp, isChronologicalIsoRange } from '../utils/time';

const APP_STORAGE_KEY = 'study-companion/app-data/v1';
const CHARACTER_IDS = Object.keys(CHARACTER_CATALOG) as CharacterId[];
const CHARACTER_STAGES: CharacterStage[] = ['egg', 'baby', 'growing', 'adult'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonNegativeFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && CHARACTER_IDS.includes(value as CharacterId);
}

function isCharacterStage(value: unknown): value is CharacterStage {
  return typeof value === 'string' && CHARACTER_STAGES.includes(value as CharacterStage);
}

function isGiftType(value: unknown): value is GiftType {
  return value === 'snack' || value === 'decor' || value === 'friendship';
}

function normalizeCharacter(value: unknown, characterId: CharacterId): OwnedCharacter | null {
  if (
    !isRecord(value) ||
    value.id !== characterId ||
    !isCharacterStage(value.stage) ||
    !isNonNegativeFinite(value.xp) ||
    !isNonNegativeFinite(value.friendship) ||
    typeof value.discovered !== 'boolean'
  ) {
    return null;
  }

  return {
    id: characterId,
    stage: value.stage,
    xp: value.xp,
    friendship: value.friendship,
    discovered: value.discovered,
  };
}

function normalizeSession(value: unknown): StudySession | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    value.id.length === 0 ||
    !isCanonicalIsoTimestamp(value.startedAt) ||
    !isCanonicalIsoTimestamp(value.completedAt) ||
    !isChronologicalIsoRange(value.startedAt, value.completedAt) ||
    !isNonNegativeFinite(value.durationMinutes) ||
    typeof value.rewardClaimed !== 'boolean'
  ) {
    return null;
  }

  return {
    id: value.id,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
    durationMinutes: value.durationMinutes,
    rewardClaimed: value.rewardClaimed,
  };
}

function normalizeReceipt(value: unknown): RewardReceipt | undefined | null {
  if (value === undefined) {
    return undefined;
  }

  if (
    !isRecord(value) ||
    typeof value.sessionId !== 'string' ||
    !isCharacterId(value.characterId) ||
    !isRecord(value.reward) ||
    !isNonNegativeFinite(value.reward.xp) ||
    !isNonNegativeFinite(value.reward.snacks) ||
    !isNonNegativeFinite(value.reward.discoveryPoints)
  ) {
    return null;
  }

  const receipt: RewardReceipt = {
    sessionId: value.sessionId,
    characterId: value.characterId,
    reward: {
      xp: value.reward.xp,
      snacks: value.reward.snacks,
      discoveryPoints: value.reward.discoveryPoints,
    },
  };

  if (value.grewFrom !== undefined || value.grewTo !== undefined) {
    if (!isCharacterStage(value.grewFrom) || !isCharacterStage(value.grewTo)) {
      return null;
    }

    receipt.grewFrom = value.grewFrom;
    receipt.grewTo = value.grewTo;
  }

  if (value.unlockedCharacterId !== undefined) {
    if (!isCharacterId(value.unlockedCharacterId)) {
      return null;
    }

    receipt.unlockedCharacterId = value.unlockedCharacterId;
  }

  if (value.returnGift !== undefined) {
    if (
      !isRecord(value.returnGift) ||
      !isGiftType(value.returnGift.type) ||
      !isNonNegativeFinite(value.returnGift.amount) ||
      !isCanonicalIsoTimestamp(value.returnGift.grantedAt)
    ) {
      return null;
    }

    receipt.returnGift = {
      type: value.returnGift.type,
      amount: value.returnGift.amount,
      grantedAt: value.returnGift.grantedAt,
    };
  }

  return receipt;
}

export function normalizeAppData(value: unknown): AppData | null {
  if (
    !isRecord(value) ||
    typeof value.selectedStarter !== 'boolean' ||
    !(value.activeCharacterId === null || isCharacterId(value.activeCharacterId)) ||
    (value.activeSessionStartedAt !== undefined &&
      !isCanonicalIsoTimestamp(value.activeSessionStartedAt)) ||
    !isRecord(value.characters) ||
    !Array.isArray(value.sessions) ||
    !isNonNegativeFinite(value.snacks) ||
    !isNonNegativeFinite(value.discoveryPoints) ||
    !isNonNegativeFinite(value.decorTokens)
  ) {
    return null;
  }

  const characters = {} as AppData['characters'];

  for (const characterId of CHARACTER_IDS) {
    const character = normalizeCharacter(value.characters[characterId], characterId);

    if (!character) {
      return null;
    }

    characters[characterId] = character;
  }

  const discoveredCharacters = Object.values(characters).filter((character) => character.discovered);

  if (
    value.selectedStarter
      ? value.activeCharacterId === null || !characters[value.activeCharacterId].discovered
      : value.activeCharacterId !== null || discoveredCharacters.length > 0
  ) {
    return null;
  }

  const uniqueSessions = new Map<string, StudySession>();
  let previousCompletedAt: string | undefined;

  for (const rawSession of value.sessions) {
    const session = normalizeSession(rawSession);

    if (!session) {
      return null;
    }

    const existing = uniqueSessions.get(session.id);

    if (
      existing &&
      (existing.startedAt !== session.startedAt ||
        existing.completedAt !== session.completedAt ||
        existing.durationMinutes !== session.durationMinutes)
    ) {
      return null;
    }

    if (existing) {
      if (existing.rewardClaimed || !session.rewardClaimed) {
        return null;
      }

      uniqueSessions.set(session.id, session);
      continue;
    }

    if (
      previousCompletedAt !== undefined &&
      !isChronologicalIsoRange(previousCompletedAt, session.startedAt)
    ) {
      return null;
    }

    previousCompletedAt = session.completedAt;
    uniqueSessions.set(session.id, session);
  }

  const sessions = [...uniqueSessions.values()];

  const latestCompletedSession = sessions[sessions.length - 1];

  if (
    value.activeSessionStartedAt !== undefined &&
    latestCompletedSession &&
    !isChronologicalIsoRange(latestCompletedSession.completedAt, value.activeSessionStartedAt)
  ) {
    return null;
  }

  const lastReward = normalizeReceipt(value.lastReward);

  if (lastReward === null) {
    return null;
  }

  return {
    selectedStarter: value.selectedStarter,
    activeCharacterId: value.activeCharacterId,
    ...(value.activeSessionStartedAt !== undefined
      ? { activeSessionStartedAt: value.activeSessionStartedAt }
      : {}),
    characters,
    sessions,
    snacks: value.snacks,
    discoveryPoints: value.discoveryPoints,
    decorTokens: value.decorTokens,
    ...(lastReward ? { lastReward } : {}),
  };
}

export async function loadAppData(): Promise<AppData | null> {
  try {
    const storedData = await AsyncStorage.getItem(APP_STORAGE_KEY);

    return storedData ? normalizeAppData(JSON.parse(storedData) as unknown) : null;
  } catch {
    return null;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data));
}
