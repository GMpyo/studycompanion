import { CHARACTER_CATALOG } from '../domain/catalog';
import type { AppData, CharacterId, OwnedCharacter } from '../domain/types';

export function createInitialState(starterId?: CharacterId): AppData {
  const definition = starterId ? CHARACTER_CATALOG[starterId] : undefined;

  if (starterId !== undefined && (!definition || !definition.starter || definition.id !== starterId)) {
    throw new Error('Invalid starter character');
  }

  const activeCharacterId = starterId ?? null;
  const characters = {} as Record<CharacterId, OwnedCharacter>;

  for (const [characterId, characterDefinition] of Object.entries(CHARACTER_CATALOG) as [
    CharacterId,
    (typeof CHARACTER_CATALOG)[CharacterId],
  ][]) {
    if (characterDefinition.id !== characterId) {
      throw new Error('Invalid starter character');
    }

    characters[characterId] = {
      id: characterId,
      stage: 'egg',
      xp: 0,
      friendship: 0,
      discovered: characterId === activeCharacterId,
    };
  }

  return {
    selectedStarter: Boolean(starterId),
    activeCharacterId,
    characters,
    sessions: [],
    snacks: 0,
    discoveryPoints: 0,
    decorTokens: 0,
  };
}
