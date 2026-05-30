import { StyleSheet, Text, View } from 'react-native';

import {
  getCurrentStage,
  type StageProgress,
} from '../../domain/stageProgression';
import { GameSurface, ProgressMeter, SectionHeader, StatPill } from '../ui';
import { colors, spacing } from '../../theme/tokens';

interface StageProgressPanelProps {
  progress: StageProgress;
}

export function StageProgressPanel({ progress }: StageProgressPanelProps) {
  const stage = getCurrentStage(progress);
  const remainingHp = Math.max(0, stage.requiredStudyMinutes - progress.accumulatedMinutes);

  return (
    <GameSurface>
      <SectionHeader eyebrow="개인 레이드" title={stage.title} trailing={`HP ${remainingHp} 남음`} />
      <Text style={styles.description}>{stage.description}</Text>
      <Text style={styles.theme}>방해 요소: {stage.bossTheme}</Text>
      <View style={styles.progressBlock}>
        <View style={styles.minuteRow}>
          <Text style={styles.minuteText}>
            {progress.accumulatedMinutes} / {stage.requiredStudyMinutes} 피해
          </Text>
        </View>
        <ProgressMeter
          label="토벌 진행도"
          value={progress.accumulatedMinutes}
          max={stage.requiredStudyMinutes}
        />
      </View>
      <View style={styles.rewardRow}>
        <StatPill label="XP" value={`+${stage.reward.xp}`} tone="reward" />
        <StatPill label="간식" value={`+${stage.reward.snacks}`} tone="reward" />
        <StatPill label="발견" value={`+${stage.reward.discoveryPoints}`} tone="study" />
      </View>
    </GameSurface>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.md,
  },
  theme: {
    color: colors.study,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  progressBlock: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  minuteRow: {
    alignItems: 'flex-end',
  },
  minuteText: {
    color: colors.inkStrong,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
