import { StyleSheet, Text, View } from 'react-native';

import type { StageDefinition } from '../../domain/stages';
import { colors, spacing } from '../../theme/tokens';
import { GameSurface, StatPill } from '../ui';

interface StageRaidResultPanelProps {
  stage: StageDefinition;
  nextStage?: StageDefinition;
}

export function StageRaidResultPanel({ stage, nextStage }: StageRaidResultPanelProps) {
  return (
    <GameSurface>
      <View style={styles.header}>
        <Text style={styles.title}>토벌 성공!</Text>
        <Text style={styles.clearMessage}>{stage.clearMessage}</Text>
      </View>
      <View style={styles.rewardRow}>
        <StatPill label="XP" value={`+${stage.reward.xp}`} tone="reward" />
        <StatPill label="간식" value={`+${stage.reward.snacks}`} tone="reward" />
        <StatPill label="발견" value={`+${stage.reward.discoveryPoints}`} tone="study" />
      </View>
      <View style={styles.footer}>
        {nextStage ? (
          <Text style={styles.nextText}>다음 목표: {nextStage.title}</Text>
        ) : (
          <Text style={styles.nextText}>챕터 토벌 완료</Text>
        )}
      </View>
    </GameSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.inkStrong,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  clearMessage: {
    color: colors.study,
    fontSize: 14,
    fontWeight: '600',
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  footer: {
    borderTopColor: colors.panelMuted,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  nextText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
