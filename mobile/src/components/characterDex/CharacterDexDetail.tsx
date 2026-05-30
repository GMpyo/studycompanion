import { Image, StyleSheet, Text, View } from 'react-native';

import { CHARACTER_CATALOG } from '../../domain/catalog';
import {
  getCharacterDexEntry,
  getCharacterStageArt,
  getEvolutionSlots,
  ROLE_LABELS,
} from '../../domain/characterDex';
import type { OwnedCharacter } from '../../domain/types';
import { GameSurface, ProgressMeter, SectionHeader, StatPill } from '../ui';
import { colors, radius, spacing } from '../../theme/tokens';

interface CharacterDexDetailProps {
  character: OwnedCharacter;
}

export function CharacterDexDetail({ character }: CharacterDexDetailProps) {
  const entry = getCharacterDexEntry(character.id);
  const definition = CHARACTER_CATALOG[character.id];
  const evolutionSlots = getEvolutionSlots(character);

  if (!character.discovered) {
    return (
      <View style={styles.container}>
        <GameSurface>
          <SectionHeader eyebrow="미발견" title="???" />
          <View style={styles.lockedPortrait}>
            <Text style={styles.lockedMark}>?</Text>
          </View>
          <Text style={styles.bodyText}>{entry.unlockHint}</Text>
        </GameSurface>

        <GameSurface>
          <SectionHeader title="진화 기록" trailing="잠김" />
          <View style={styles.evolutionGrid}>
            {evolutionSlots.map((slot) => (
              <View key={slot.stage} style={styles.evolutionSlot}>
                <View style={styles.hiddenShape} />
                <Text style={styles.slotLabel}>{slot.label}</Text>
              </View>
            ))}
          </View>
        </GameSurface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GameSurface>
        <SectionHeader eyebrow="캐릭터 도감" title={entry.displayName} trailing={ROLE_LABELS[definition.role]} />
        <View style={[styles.portrait, { backgroundColor: definition.palette.secondary }]}>
          <Image
            accessibilityLabel={`${entry.displayName} ${evolutionSlots[0].label} 도감 이미지`}
            resizeMode="contain"
            source={getCharacterStageArt(character.id, character.stage)}
            style={styles.characterImage}
          />
        </View>
        <View style={styles.statRow}>
          <StatPill label="역할" value={ROLE_LABELS[definition.role]} tone="study" />
          <StatPill label="스킬" value={definition.skillName} tone="reward" />
        </View>
        <Text style={styles.bodyText}>{entry.shortBio}</Text>
        <Text style={styles.mutedText}>{entry.personality}</Text>
      </GameSurface>

      <GameSurface>
        <SectionHeader title="진화 기록" trailing={entry.artKey} />
        <View style={styles.evolutionGrid}>
          {evolutionSlots.map((slot) => (
            <View key={slot.stage} style={styles.evolutionSlot}>
              <Image
                accessibilityLabel={`${entry.displayName} ${slot.label}`}
                resizeMode="contain"
                source={getCharacterStageArt(character.id, slot.stage)}
                style={[styles.stageImage, slot.state === 'visible' && styles.futureImage]}
              />
              <Text style={styles.slotLabel}>{slot.label}</Text>
              <Text style={styles.slotDescription}>{slot.description}</Text>
            </View>
          ))}
        </View>
      </GameSurface>

      <GameSurface>
        <SectionHeader title="성장 조건" />
        <ProgressMeter label="경험치" value={character.xp} max={600} />
        <ProgressMeter label="친밀도" value={character.friendship} max={18} />
      </GameSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  portrait: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 150,
    justifyContent: 'center',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  lockedPortrait: {
    alignItems: 'center',
    backgroundColor: colors.panelMuted,
    borderRadius: radius.md,
    height: 150,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  lockedMark: {
    color: colors.muted,
    fontSize: 48,
    fontWeight: '900',
  },
  characterImage: {
    height: 132,
    width: 132,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  bodyText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: spacing.md,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  evolutionGrid: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  evolutionSlot: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  hiddenShape: {
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    height: 42,
    width: 34,
  },
  stageImage: {
    height: 54,
    width: 54,
  },
  futureImage: {
    opacity: 0.75,
    tintColor: colors.inkStrong,
  },
  slotLabel: {
    color: colors.inkStrong,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  slotDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
