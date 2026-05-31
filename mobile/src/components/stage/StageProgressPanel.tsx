import { Image, StyleSheet, Text, View } from 'react-native';

import {
  getBossStageArt,
  getCurrentStage,
  getCurrentBossHp,
  getAccumulatedDamage,
  getRewardPreview,
  isCurrentStageCleared,
  type StageProgress,
} from '../../domain/stageProgression';
import { STAGE_CATALOG } from '../../domain/stages';
import { GameSurface, ProgressMeter, SectionHeader, StatPill } from '../ui';
import { colors, spacing } from '../../theme/tokens';
import { StageRaidResultPanel } from './StageRaidResultPanel';

interface StageProgressPanelProps {
  progress: StageProgress;
}

export function StageProgressPanel({ progress }: StageProgressPanelProps) {
  const stage = getCurrentStage(progress);
  const remainingHp = getCurrentBossHp(progress);
  const damage = getAccumulatedDamage(progress);
  const reward = getRewardPreview(progress);
  const isCleared = isCurrentStageCleared(progress);

  const stageIndex = STAGE_CATALOG.findIndex((s) => s.id === stage.id);
  const nextStage = STAGE_CATALOG[stageIndex + 1];

  return (
    <View style={styles.container}>
      <GameSurface>
      <SectionHeader eyebrow="개인 레이드" title={stage.title} trailing={isCleared ? '토벌 완료' : `HP ${remainingHp} 남음`} />
      <View style={styles.bossFrame}>
        <Image
          accessibilityLabel={`${stage.title} 보스 이미지`}
          resizeMode="contain"
          source={getBossStageArt(stage.id)}
          style={styles.bossImage}
        />
      </View>
      <Text style={styles.description}>{stage.description}</Text>
      <Text style={styles.theme}>방해 요소: {stage.bossTheme}</Text>
      <View style={styles.progressBlock}>
        <View style={styles.minuteRow}>
          <Text style={styles.minuteText}>
            {damage} / {stage.requiredStudyMinutes} 피해
          </Text>
        </View>
        <ProgressMeter
          label="토벌 진행도"
          value={damage}
          max={stage.requiredStudyMinutes}
        />
        <Text style={styles.nextGoalText}>
          {isCleared ? '모든 방해 요소를 물리쳤습니다!' : `다음 목표까지 ${remainingHp}분 남았습니다.`}
        </Text>
      </View>
      <View style={styles.rewardRow}>
        <StatPill label="XP" value={`+${reward.xp}`} tone="reward" />
        <StatPill label="간식" value={`+${reward.snacks}`} tone="reward" />
        <StatPill label="발견" value={`+${reward.discoveryPoints}`} tone="study" />
      </View>
      </GameSurface>
      {isCleared && (
        <View style={styles.resultContainer}>
          <StageRaidResultPanel stage={stage} nextStage={nextStage} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  resultContainer: {
    marginTop: spacing.sm,
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.md,
  },
  bossFrame: {
    alignItems: 'center',
    backgroundColor: colors.panelMuted,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 190,
    overflow: 'hidden',
  },
  bossImage: {
    height: 180,
    width: '100%',
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
  nextGoalText: {
    color: colors.study,
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
