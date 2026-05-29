import type { RewardBundle } from './types';

export interface StageDefinition {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  requiredStudyMinutes: number;
  recommendedPower: number;
  reward: RewardBundle;
}

export interface StageProgress {
  currentStageId: string;
  accumulatedMinutes: number;
  clearedStageIds: string[];
  idleRewardClaimedAt?: string;
}

export const STAGE_CATALOG: StageDefinition[] = [
  {
    id: 'chapter-1-stage-1',
    chapterId: 'chapter-1',
    title: '책상 정리 숲길',
    description: '첫 걸음은 공부 자리를 정돈하며 숲길을 여는 단계예요.',
    requiredStudyMinutes: 30,
    recommendedPower: 10,
    reward: { xp: 12, snacks: 1, discoveryPoints: 2 },
  },
  {
    id: 'chapter-1-stage-2',
    chapterId: 'chapter-1',
    title: '연필빛 언덕',
    description: '짧은 집중을 이어 붙여 언덕 위의 길을 밝혀요.',
    requiredStudyMinutes: 45,
    recommendedPower: 18,
    reward: { xp: 18, snacks: 1, discoveryPoints: 3 },
  },
  {
    id: 'chapter-1-stage-3',
    chapterId: 'chapter-1',
    title: '고요한 노트 다리',
    description: '흩어진 내용을 정리하며 다음 구역으로 건너가요.',
    requiredStudyMinutes: 60,
    recommendedPower: 28,
    reward: { xp: 24, snacks: 2, discoveryPoints: 4 },
  },
  {
    id: 'chapter-1-boss',
    chapterId: 'chapter-1',
    title: '졸음 그림자',
    description: '챕터 끝에서 졸음을 몰아내는 첫 보스 단계예요.',
    requiredStudyMinutes: 90,
    recommendedPower: 42,
    reward: { xp: 42, snacks: 3, discoveryPoints: 8 },
  },
];

