import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { StageProgressPanel } from '../components/stage/StageProgressPanel';
import {
  applyStudyMinutesToStageProgress,
  createInitialStageProgress,
  getCurrentStage,
  STAGE_CATALOG,
} from '../domain/stageProgression';

describe('stage progression domain', () => {
  test('starts at the first stage with no cleared stages', () => {
    const progress = createInitialStageProgress();

    expect(progress.currentStageId).toBe(STAGE_CATALOG[0].id);
    expect(progress.accumulatedMinutes).toBe(0);
    expect(progress.clearedStageIds).toEqual([]);
  });

  test('adds study minutes without clearing before the requirement is met', () => {
    const result = applyStudyMinutesToStageProgress(createInitialStageProgress(), 20);

    expect(result.progress.currentStageId).toBe('chapter-1-stage-1');
    expect(result.progress.accumulatedMinutes).toBe(20);
    expect(result.clearedStages).toEqual([]);
    expect(result.reward).toEqual({ xp: 0, snacks: 0, discoveryPoints: 0 });
  });

  test('clears a stage, carries extra minutes, and grants stage rewards', () => {
    const result = applyStudyMinutesToStageProgress(createInitialStageProgress(), 35);

    expect(result.progress.currentStageId).toBe('chapter-1-stage-2');
    expect(result.progress.accumulatedMinutes).toBe(5);
    expect(result.progress.clearedStageIds).toEqual(['chapter-1-stage-1']);
    expect(result.clearedStages.map((stage) => stage.id)).toEqual(['chapter-1-stage-1']);
    expect(result.reward).toEqual({ xp: 12, snacks: 1, discoveryPoints: 2 });
  });

  test('can clear multiple stages in one long study session', () => {
    const result = applyStudyMinutesToStageProgress(createInitialStageProgress(), 100);

    expect(result.progress.currentStageId).toBe('chapter-1-stage-3');
    expect(result.progress.accumulatedMinutes).toBe(25);
    expect(result.progress.clearedStageIds).toEqual(['chapter-1-stage-1', 'chapter-1-stage-2']);
    expect(result.reward).toEqual({ xp: 30, snacks: 2, discoveryPoints: 5 });
  });

  test('ignores invalid or negative study minutes', () => {
    const progress = createInitialStageProgress();

    expect(applyStudyMinutesToStageProgress(progress, Number.NaN).progress).toBe(progress);
    expect(applyStudyMinutesToStageProgress(progress, -1).progress).toBe(progress);
  });

  test('returns the current stage definition', () => {
    expect(getCurrentStage(createInitialStageProgress()).title).toBe('책상 정리 숲길');
  });
});

describe('StageProgressPanel', () => {
  test('renders current stage, progress percentage, and next reward', () => {
    const progress = applyStudyMinutesToStageProgress(createInitialStageProgress(), 15).progress;

    render(<StageProgressPanel progress={progress} />);

    expect(screen.getByText('책상 정리 숲길')).toBeTruthy();
    expect(screen.getByText('15 / 30분')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('XP')).toBeTruthy();
    expect(screen.getByText('+12')).toBeTruthy();
    expect(screen.getByText('간식')).toBeTruthy();
    expect(screen.getByText('+1')).toBeTruthy();
  });
});
