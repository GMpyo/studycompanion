import type { RewardBundle } from './types';

export interface StageDefinition {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  requiredStudyMinutes: number;
  recommendedPower: number;
  bossTheme: string;
  clearMessage: string;
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
    id: 'chapter-1-raid-1',
    chapterId: 'chapter-1',
    title: '몽롱한 졸음 요정',
    description: '약한 졸음과 식곤증이 첫 집중을 흐리게 만들어요.',
    requiredStudyMinutes: 15,
    recommendedPower: 10,
    bossTheme: '약한 졸음과 식곤증',
    clearMessage: '무거운 눈꺼풀을 이겨내고 첫걸음을 내디뎠다!',
    reward: { xp: 15, snacks: 1, discoveryPoints: 2 },
  },
  {
    id: 'chapter-1-raid-2',
    chapterId: 'chapter-1',
    title: '5분만 더 슬라임',
    description: '시작을 미루는 핑계가 말랑하게 달라붙는 보스예요.',
    requiredStudyMinutes: 30,
    recommendedPower: 18,
    bossTheme: '시작을 미루는 습관',
    clearMessage: '미루고 싶은 핑계를 베어내고 지금을 선택했다!',
    reward: { xp: 30, snacks: 1, discoveryPoints: 3 },
  },
  {
    id: 'chapter-1-raid-3',
    chapterId: 'chapter-1',
    title: '산만한 책상 골렘',
    description: '정리되지 않은 주변 환경이 돌덩이처럼 집중을 막아요.',
    requiredStudyMinutes: 45,
    recommendedPower: 28,
    bossTheme: '정리 안 된 주변 환경',
    clearMessage: '어지러운 환경을 정리하니 마음도 맑아졌다!',
    reward: { xp: 45, snacks: 2, discoveryPoints: 4 },
  },
  {
    id: 'chapter-1-raid-4',
    chapterId: 'chapter-1',
    title: '폭신한 침대 괴물',
    description: '눕고 싶은 유혹이 푹신한 몸으로 책상 앞을 가로막아요.',
    requiredStudyMinutes: 60,
    recommendedPower: 42,
    bossTheme: '눕고 싶은 유혹',
    clearMessage: '달콤한 이불의 유혹을 뿌리치고 책상에 앉았다!',
    reward: { xp: 60, snacks: 2, discoveryPoints: 5 },
  },
  {
    id: 'chapter-1-boss',
    chapterId: 'chapter-1',
    title: '무기력의 안개나무',
    description: '시작의 숲을 뒤덮은 무기력의 안개를 걷어내는 챕터 보스예요.',
    requiredStudyMinutes: 90,
    recommendedPower: 60,
    bossTheme: '초기 무기력감',
    clearMessage: '안개처럼 덮여 있던 무기력함이 흩어진다. 진정한 여정의 시작이다!',
    reward: { xp: 100, snacks: 3, discoveryPoints: 8 },
  },
];
