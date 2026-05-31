import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { StageProgressPanel } from '../components/stage/StageProgressPanel';
import {
  applyStudyMinutesToStageProgress,
  BOSS_STAGE_ART,
  createInitialStageProgress,
  getCurrentStage,
  getCurrentBossHp,
  getAccumulatedDamage,
  isCurrentStageCleared,
  getMinutesUntilNextBoss,
  getRewardPreview,
  STAGE_CATALOG,
} from '../domain/stageProgression';

describe('stage progression domain', () => {
  test('starts at the first stage with no cleared stages', () => {
    const progress = createInitialStageProgress();

    expect(progress.currentStageId).toBe(STAGE_CATALOG[0].id);
    expect(progress.accumulatedMinutes).toBe(0);
    expect(progress.clearedStageIds).toEqual([]);
  });

  test('has boss art for every raid stage', () => {
    STAGE_CATALOG.forEach((stage) => {
      expect(BOSS_STAGE_ART[stage.id]).toBeTruthy();
    });
  });

  test('adds study minutes as raid damage before the boss is defeated', () => {
    const result = applyStudyMinutesToStageProgress(createInitialStageProgress(), 10);

    expect(result.progress.currentStageId).toBe('chapter-1-raid-1');
    expect(result.progress.accumulatedMinutes).toBe(10);
    expect(result.clearedStages).toEqual([]);
    expect(result.reward).toEqual({ xp: 0, snacks: 0, discoveryPoints: 0 });
  });

  test('defeats a raid boss, carries extra damage, and grants boss rewards', () => {
    const result = applyStudyMinutesToStageProgress(createInitialStageProgress(), 20);

    expect(result.progress.currentStageId).toBe('chapter-1-raid-2');
    expect(result.progress.accumulatedMinutes).toBe(5);
    expect(result.progress.clearedStageIds).toEqual(['chapter-1-raid-1']);
    expect(result.clearedStages.map((stage) => stage.id)).toEqual(['chapter-1-raid-1']);
    expect(result.reward).toEqual({ xp: 15, snacks: 1, discoveryPoints: 2 });
  });

  test('can defeat multiple raid bosses in one long study session', () => {
    const result = applyStudyMinutesToStageProgress(createInitialStageProgress(), 100);

    expect(result.progress.currentStageId).toBe('chapter-1-raid-4');
    expect(result.progress.accumulatedMinutes).toBe(10);
    expect(result.progress.clearedStageIds).toEqual([
      'chapter-1-raid-1',
      'chapter-1-raid-2',
      'chapter-1-raid-3',
    ]);
    expect(result.reward).toEqual({ xp: 90, snacks: 4, discoveryPoints: 9 });
  });

  test('ignores invalid or negative study minutes', () => {
    const progress = createInitialStageProgress();

    expect(applyStudyMinutesToStageProgress(progress, Number.NaN).progress).toBe(progress);
    expect(applyStudyMinutesToStageProgress(progress, -1).progress).toBe(progress);
  });

  test('returns the current stage definition', () => {
    expect(getCurrentStage(createInitialStageProgress()).title).toBe('몽롱한 졸음 요정');
  });

  test('HP does not drop below 0', () => {
    const progress = createInitialStageProgress();
    progress.accumulatedMinutes = 100;
    expect(getCurrentBossHp(progress)).toBe(0);
  });

  test('helper functions calculate correct raid progression values', () => {
    let progress = createInitialStageProgress();
    expect(getCurrentBossHp(progress)).toBe(15);
    expect(getAccumulatedDamage(progress)).toBe(0);
    expect(isCurrentStageCleared(progress)).toBe(false);
    expect(getMinutesUntilNextBoss(progress)).toBe(15);
    expect(getRewardPreview(progress).xp).toBe(15);

    progress = applyStudyMinutesToStageProgress(progress, 20).progress;
    expect(getCurrentBossHp(progress)).toBe(25);
    expect(getAccumulatedDamage(progress)).toBe(5);
    expect(isCurrentStageCleared(progress)).toBe(false);
    expect(getMinutesUntilNextBoss(progress)).toBe(25);
    expect(getRewardPreview(progress).xp).toBe(30);
  });
});

describe('StageProgressPanel', () => {
  test('renders current stage, progress percentage, and next reward', () => {
    const progress = applyStudyMinutesToStageProgress(createInitialStageProgress(), 10).progress;

    render(<StageProgressPanel progress={progress} />);

    expect(screen.getByText('몽롱한 졸음 요정')).toBeTruthy();
    expect(screen.getByLabelText('몽롱한 졸음 요정 보스 이미지')).toBeTruthy();
    expect(screen.getByText('HP 5 남음')).toBeTruthy();
    expect(screen.getByText('10 / 15 피해')).toBeTruthy();
    expect(screen.getByText('67%')).toBeTruthy();
    expect(screen.getByText('XP')).toBeTruthy();
    expect(screen.getByText('+15')).toBeTruthy();
    expect(screen.getByText('간식')).toBeTruthy();
    expect(screen.getByText('+1')).toBeTruthy();
    expect(screen.getByText('다음 목표까지 5분 남았습니다.')).toBeTruthy();
  });

  test('renders cleared state for maxed progression', () => {
    let progress = createInitialStageProgress();
    progress = applyStudyMinutesToStageProgress(progress, 300).progress;

    render(<StageProgressPanel progress={progress} />);

    expect(screen.getByText('토벌 완료')).toBeTruthy();
    expect(screen.getByText('90 / 90 피해')).toBeTruthy();
    expect(screen.getByText('모든 방해 요소를 물리쳤습니다!')).toBeTruthy();
    expect(screen.getByText('토벌 성공!')).toBeTruthy();
    expect(screen.getByText('챕터 토벌 완료')).toBeTruthy();
  });

  test('renders result panel with next raid name when a stage is cleared', () => {
    const progress = {
      currentStageId: 'chapter-1-raid-1',
      accumulatedMinutes: 15,
      clearedStageIds: [],
    };

    render(<StageProgressPanel progress={progress} />);

    expect(screen.getByText('토벌 성공!')).toBeTruthy();
    expect(screen.getByText('다음 목표: 5분만 더 슬라임')).toBeTruthy();
  });
});
