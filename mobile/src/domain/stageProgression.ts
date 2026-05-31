import type { ImageSourcePropType } from 'react-native';

import type { RewardBundle } from './types';
import {
  STAGE_CATALOG,
  type StageDefinition,
  type StageProgress,
} from './stages';

export { STAGE_CATALOG, type StageDefinition, type StageProgress } from './stages';

export const BOSS_STAGE_ART: Record<string, ImageSourcePropType> = {
  'chapter-1-raid-1': require('../../assets/images/bosses/drowsy-fairy.png'),
  'chapter-1-raid-2': require('../../assets/images/bosses/five-more-minutes-slime.png'),
  'chapter-1-raid-3': require('../../assets/images/bosses/distracted-desk-golem.png'),
  'chapter-1-raid-4': require('../../assets/images/bosses/cozy-bed-monster.png'),
  'chapter-1-boss': require('../../assets/images/bosses/fog-tree-boss.png'),
};

export function getBossStageArt(stageId: string): ImageSourcePropType {
  return BOSS_STAGE_ART[stageId];
}

export interface StageProgressResult {
  progress: StageProgress;
  clearedStages: StageDefinition[];
  reward: RewardBundle;
}

const EMPTY_REWARD: RewardBundle = { xp: 0, snacks: 0, discoveryPoints: 0 };

export function createInitialStageProgress(): StageProgress {
  return {
    currentStageId: STAGE_CATALOG[0].id,
    accumulatedMinutes: 0,
    clearedStageIds: [],
  };
}

export function getCurrentStage(progress: StageProgress): StageDefinition {
  return (
    STAGE_CATALOG.find((stage) => stage.id === progress.currentStageId) ?? STAGE_CATALOG[0]
  );
}

export function getCurrentBossHp(progress: StageProgress): number {
  const stage = getCurrentStage(progress);
  return Math.max(0, stage.requiredStudyMinutes - progress.accumulatedMinutes);
}

export function getAccumulatedDamage(progress: StageProgress): number {
  return progress.accumulatedMinutes;
}

export function isCurrentStageCleared(progress: StageProgress): boolean {
  return getCurrentBossHp(progress) === 0;
}

export function getMinutesUntilNextBoss(progress: StageProgress): number {
  return getCurrentBossHp(progress);
}

export function getRewardPreview(progress: StageProgress): RewardBundle {
  return getCurrentStage(progress).reward;
}

export function applyStudyMinutesToStageProgress(
  progress: StageProgress,
  studyMinutes: number,
): StageProgressResult {
  if (!Number.isFinite(studyMinutes) || studyMinutes < 0) {
    return { progress, clearedStages: [], reward: EMPTY_REWARD };
  }

  let currentStage = getCurrentStage(progress);
  let currentIndex = STAGE_CATALOG.findIndex((stage) => stage.id === currentStage.id);
  let remainingMinutes = progress.accumulatedMinutes + Math.floor(studyMinutes);
  const clearedStageIds = [...progress.clearedStageIds];
  const clearedStages: StageDefinition[] = [];
  const reward: RewardBundle = { ...EMPTY_REWARD };

  while (remainingMinutes >= currentStage.requiredStudyMinutes) {
    remainingMinutes -= currentStage.requiredStudyMinutes;

    if (!clearedStageIds.includes(currentStage.id)) {
      clearedStageIds.push(currentStage.id);
      clearedStages.push(currentStage);
      reward.xp += currentStage.reward.xp;
      reward.snacks += currentStage.reward.snacks;
      reward.discoveryPoints += currentStage.reward.discoveryPoints;
    }

    if (currentIndex >= STAGE_CATALOG.length - 1) {
      remainingMinutes = currentStage.requiredStudyMinutes;
      break;
    }

    currentIndex += 1;
    currentStage = STAGE_CATALOG[currentIndex];
  }

  return {
    progress: {
      ...progress,
      currentStageId: currentStage.id,
      accumulatedMinutes: remainingMinutes,
      clearedStageIds,
    },
    clearedStages,
    reward,
  };
}
