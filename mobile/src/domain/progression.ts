import { CHARACTER_CATALOG } from './catalog';
import type { CharacterId, CharacterStage, OwnedCharacter } from './types';

const STAGE_RULES: Record<
  CharacterStage,
  { next?: CharacterStage; xp: number; friendship: number }
> = {
  egg: { next: 'baby', xp: 60, friendship: 2 },
  baby: { next: 'growing', xp: 240, friendship: 8 },
  growing: { next: 'adult', xp: 600, friendship: 18 },
  adult: { xp: Number.POSITIVE_INFINITY, friendship: Number.POSITIVE_INFINITY },
};

interface UnlockResult {
  unlockedCharacterId?: CharacterId;
  remainingPoints: number;
}

export function applyGrowth(character: OwnedCharacter): OwnedCharacter {
  const rule = STAGE_RULES[character.stage];

  if (rule.next && character.xp >= rule.xp && character.friendship >= rule.friendship) {
    return { ...character, stage: rule.next };
  }

  return character;
}

export function unlockNextCharacter(
  characters: Record<CharacterId, OwnedCharacter>,
  discoveryPoints: number,
): UnlockResult {
  const requiredPoints = 100;

  if (!Number.isFinite(discoveryPoints) || discoveryPoints < 0) {
    return { remainingPoints: 0 };
  }

  if (discoveryPoints < requiredPoints) {
    return { remainingPoints: discoveryPoints };
  }

  const unlockedCharacterId = Object.values(CHARACTER_CATALOG).find(
    (definition) => !definition.starter && !characters[definition.id].discovered,
  )?.id;

  if (!unlockedCharacterId) {
    return { remainingPoints: discoveryPoints };
  }

  return {
    unlockedCharacterId,
    remainingPoints: discoveryPoints - requiredPoints,
  };
}
