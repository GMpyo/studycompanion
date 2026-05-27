import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import CollectionScreen from '../app/(tabs)/collection';
import HistoryScreen from '../app/(tabs)/history';
import { CHARACTER_CATALOG } from '../domain/catalog';
import type { CharacterId } from '../domain/types';
import { createInitialState } from '../state/initialState';
import type { AppStore } from '../state/useAppStore';

const mockSetActiveCharacter = jest.fn<(characterId: CharacterId) => Promise<void>>(async () => undefined);
let mockStoreState: AppStore;

jest.mock('@/state/useAppStore', () => ({
  useAppStore: (selector: (state: AppStore) => unknown) => selector(mockStoreState),
}));

function makeStore(data = createInitialState('starter-sprout')): AppStore {
  return {
    data,
    hydrated: true,
    hydrate: jest.fn(async () => undefined),
    selectStarter: jest.fn(async () => undefined),
    startSession: jest.fn(async () => undefined),
    startSessionWithResult: jest.fn(async () => true),
    completeSession: jest.fn(async () => undefined),
    completeSessionWithResult: jest.fn(async () => true),
    clearActiveSession: jest.fn(async () => undefined),
    feedCharacter: jest.fn(async () => undefined),
    setActiveCharacter: mockSetActiveCharacter,
  };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, reject, resolve };
}

describe('Task 8 collection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const data = createInitialState('starter-sprout');
    data.discoveryPoints = 12;
    data.characters['cloud-puff'] = {
      ...data.characters['cloud-puff'],
      discovered: true,
    };
    mockStoreState = makeStore(data);
  });

  test('renders discovered cards, mystery slots without leaks, and the active marker', () => {
    render(<CollectionScreen />);

    expect(screen.getByText('나의 도감')).toBeTruthy();
    expect(screen.getByText('발견 포인트 12')).toBeTruthy();
    expect(screen.getByText(CHARACTER_CATALOG['starter-sprout'].name)).toBeTruthy();
    expect(screen.getByText(CHARACTER_CATALOG['cloud-puff'].name)).toBeTruthy();
    expect(screen.getAllByText('아직 미발견')).toHaveLength(6);
    expect(screen.queryByText(CHARACTER_CATALOG['ember-dot'].name)).toBeNull();
    expect(screen.queryByText(CHARACTER_CATALOG['ember-dot'].skillName)).toBeNull();
    expect(screen.getByText('함께 공부 중')).toBeTruthy();
    expect(
      screen.queryByRole('button', {
        name: `${CHARACTER_CATALOG['ember-dot'].name} 대표로 선택`,
      }),
    ).toBeNull();
  });

  test('dispatches a uniquely named active-companion action for a discovered friend', () => {
    render(<CollectionScreen />);

    fireEvent.press(
      screen.getByRole('button', {
        name: `${CHARACTER_CATALOG['cloud-puff'].name} 대표로 선택`,
      }),
    );

    expect(mockSetActiveCharacter).toHaveBeenCalledWith('cloud-puff');
  });

  test('announces selection save failure and allows a retry', async () => {
    mockSetActiveCharacter
      .mockRejectedValueOnce(new Error('save failed'))
      .mockImplementationOnce(() => new Promise<void>(() => undefined));

    render(<CollectionScreen />);
    const button = screen.getByRole('button', {
      name: `${CHARACTER_CATALOG['cloud-puff'].name} 대표로 선택`,
    });

    fireEvent.press(button);

    const alert = await screen.findByRole('alert');
    expect(alert.props.accessibilityLiveRegion).toBe('assertive');
    expect(screen.getByText('저장하지 못했어요. 다시 시도해 주세요.')).toBeTruthy();

    fireEvent.press(button);

    expect(screen.queryByText('저장하지 못했어요. 다시 시도해 주세요.')).toBeNull();
    expect(mockSetActiveCharacter).toHaveBeenCalledTimes(2);
  });

  test('does not surface a stale rejected selection after a newer selection resolves', async () => {
    const data = mockStoreState.data;
    data.characters['starter-comet'] = {
      ...data.characters['starter-comet'],
      discovered: true,
    };
    mockStoreState = makeStore(data);
    const firstSelection = deferred();
    const secondSelection = deferred();
    mockSetActiveCharacter
      .mockImplementationOnce(() => firstSelection.promise)
      .mockImplementationOnce(() => secondSelection.promise);

    render(<CollectionScreen />);

    fireEvent.press(
      screen.getByRole('button', {
        name: `${CHARACTER_CATALOG['cloud-puff'].name} 대표로 선택`,
      }),
    );
    fireEvent.press(
      screen.getByRole('button', {
        name: `${CHARACTER_CATALOG['starter-comet'].name} 대표로 선택`,
      }),
    );

    await act(async () => {
      secondSelection.resolve();
      await secondSelection.promise;
    });

    await act(async () => {
      firstSelection.reject(new Error('stale failure'));
      await Promise.resolve();
    });

    expect(screen.queryByText('저장하지 못했어요. 다시 시도해 주세요.')).toBeNull();
  });
});

describe('Task 8 history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T12:00:00.000Z'));
    mockStoreState = makeStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('includes a completed sub-15-minute session in today and recent totals and list', () => {
    const data = createInitialState('starter-sprout');
    data.sessions = [
      {
        id: 'short-session',
        startedAt: '2026-05-26T01:50:00.000Z',
        completedAt: '2026-05-26T02:00:00.000Z',
        durationMinutes: 10,
        rewardClaimed: false,
      },
    ];
    mockStoreState = makeStore(data);

    render(<HistoryScreen />);

    expect(screen.getByText('공부 기록')).toBeTruthy();
    expect(screen.getByText('오늘 총 공부 10분')).toBeTruthy();
    expect(screen.getByText('최근 7일 총 공부 10분')).toBeTruthy();
    expect(screen.getByText('10분 공부')).toBeTruthy();
  });

  test('refreshes today total after local midnight while the history screen stays mounted', () => {
    jest.setSystemTime(new Date('2026-05-26T23:59:30+09:00'));
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const data = createInitialState('starter-sprout');
    data.sessions = [
      {
        id: 'before-midnight',
        startedAt: '2026-05-26T22:20:00+09:00',
        completedAt: '2026-05-26T22:50:00+09:00',
        durationMinutes: 30,
        rewardClaimed: true,
      },
    ];
    mockStoreState = makeStore(data);

    const { unmount } = render(<HistoryScreen />);

    expect(screen.getByText('오늘 총 공부 30분')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.getByText('오늘 총 공부 0분')).toBeTruthy();
    expect(screen.getByText('30분 공부')).toBeTruthy();

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  test('sorts valid sessions newest-first and excludes old or invalid completion times from week total', () => {
    const data = createInitialState('starter-sprout');
    data.sessions = [
      {
        id: 'outside-week',
        startedAt: '2026-05-18T10:20:00.000Z',
        completedAt: '2026-05-18T11:00:00.000Z',
        durationMinutes: 40,
        rewardClaimed: true,
      },
      {
        id: 'within-week',
        startedAt: '2026-05-21T10:40:00.000Z',
        completedAt: '2026-05-21T11:00:00.000Z',
        durationMinutes: 20,
        rewardClaimed: true,
      },
      {
        id: 'newest',
        startedAt: '2026-05-26T10:30:00.000Z',
        completedAt: '2026-05-26T11:00:00.000Z',
        durationMinutes: 30,
        rewardClaimed: true,
      },
      {
        id: 'boundary',
        startedAt: '2026-05-19T11:55:00.000Z',
        completedAt: '2026-05-19T12:00:00.000Z',
        durationMinutes: 5,
        rewardClaimed: false,
      },
      {
        id: 'invalid',
        startedAt: 'not-a-date',
        completedAt: 'not-a-date',
        durationMinutes: 900,
        rewardClaimed: true,
      },
    ];
    mockStoreState = makeStore(data);

    render(<HistoryScreen />);

    expect(screen.getByText('최근 7일 총 공부 55분')).toBeTruthy();
    const rows = screen.getAllByText(/분 공부$/);
    expect(rows.map((row) => row.props.children.join(''))).toEqual([
      '30분 공부',
      '20분 공부',
      '5분 공부',
      '40분 공부',
    ]);
  });

  test('shows an empty state when there are no completed sessions', () => {
    render(<HistoryScreen />);

    expect(screen.getByText('아직 공부 기록이 없어요')).toBeTruthy();
  });
});
