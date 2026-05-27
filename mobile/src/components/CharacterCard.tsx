import { StyleSheet, Text, View } from 'react-native';

import { CHARACTER_CATALOG } from '../domain/catalog';
import type { CharacterRole, CharacterStage, OwnedCharacter } from '../domain/types';
import { colors, radius, spacing } from '../theme/tokens';

interface CharacterCardProps {
  character: OwnedCharacter;
  compact?: boolean;
}

const STAGE_LABELS: Record<CharacterStage, string> = {
  egg: '알',
  baby: '아기',
  growing: '성장기',
  adult: '성체',
};

const ROLE_LABELS: Record<CharacterRole, string> = {
  attack: '공격형',
  defense: '방어형',
  heal: '회복형',
  support: '지원형',
};

export function CharacterCard({ character, compact = false }: CharacterCardProps) {
  const definition = CHARACTER_CATALOG[character.id];

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.heading}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.portrait, { backgroundColor: definition.palette.secondary }]}>
          <View style={[styles.egg, { backgroundColor: definition.palette.primary }]}>
            <View style={styles.highlight} />
          </View>
          <View style={[styles.base, { backgroundColor: definition.palette.primary }]} />
        </View>

        <View style={styles.details}>
          <Text style={styles.name}>{definition.name}</Text>
          <View style={styles.badges}>
            <Text style={styles.stage}>{STAGE_LABELS[character.stage]}</Text>
            <Text style={styles.role}>{ROLE_LABELS[definition.role]}</Text>
          </View>
          <Text style={styles.skill}>{definition.skillName}</Text>
        </View>
      </View>

      <View style={styles.progress}>
        <Text style={styles.progressText}>경험치 {character.xp}</Text>
        <Text style={styles.progressText}>친밀도 {character.friendship}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  compactCard: {
    padding: spacing.md,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  portrait: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 80,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 80,
  },
  egg: {
    borderRadius: 30,
    height: 50,
    width: 40,
  },
  highlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: radius.pill,
    height: 14,
    marginLeft: 10,
    marginTop: 10,
    width: 9,
  },
  base: {
    borderRadius: radius.pill,
    bottom: 10,
    height: 5,
    opacity: 0.2,
    position: 'absolute',
    width: 48,
  },
  details: {
    flexShrink: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stage: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    color: colors.accentInk,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  role: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: spacing.xs,
  },
  skill: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  progress: {
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  progressText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
});
