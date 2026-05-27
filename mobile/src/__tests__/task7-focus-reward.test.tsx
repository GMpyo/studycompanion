import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import TabsLayout from '../app/(tabs)/_layout';
import FocusScreen from '../app/(tabs)/focus';
import RootLayout from '../app/_layout';
import RewardScreen from '../app/reward';
import type { StudySession } from '../domain/types';
import { createInitialState } from '../state/initialState';
import type { AppStore } from '../state/useAppStore';

const mockPush = jest.fn();
const mockStartSession = jest.fn<() => Promise<void>>(async () => undefined);
const mockStartSessionWithResult = jest.fn<() => Promise<boolean>>(async () => true);
const mockCompleteSession = jest.fn<(session: StudySession) => Promise<void>>(async () => undefined);
const mockCompleteSessionWithResult = jest.fn<(session: StudySession) => Promise<boolean>>(async () => true);
const mockClearActiveSession = jest.fn<() => Promise<void>>(async () => undefined);
let mockPathname = '/';
let mockStoreState: AppStore;

jest.mock('@/state/useAppStore', () => ({
  recoverElapsedMinutes: (startedAt: unknown, nowIso: unknown) => {
    if (typeof startedAt !== 'string' || typeof nowIso !== 'string') {
      return 0;
    }

    return Math.max(0, Math.floor((Date.parse(nowIso) - Date.parse(startedAt)) / (60 * 1000)));
  },
  useAppStore: (selector: (state: AppStore) => unknown) => selector(mockStoreState),
}));

jest.mock('@/components/app-tabs', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    const { Text } = require('react-native');

    return React.createElement(Text, null, 'product-tabs');
  },
}));

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    DarkTheme: {},
    DefaultTheme: {},
    Slot: () => React.createElement(Text, null, 'route-slot'),
    ThemeProvider: ({ children }: { children?: ReactNode }) => children ?? null,
    usePathname: () => mockPathname,
    useRouter: () => ({ push: mockPush }),
  };
});

function makeStore(data = createInitialState('starter-sprout')): AppStore {
  return {
    data,
    hydrated: true,
    hydrate: jest.fn(async () => undefined),
    selectStarter: jest.fn(async () => undefined),
    startSession: mockStartSession,
    startSessionWithResult: mockStartSessionWithResult,
    completeSession: mockCompleteSession,
    completeSessionWithResult: mockCompleteSessionWithResult,
    clearActiveSession: mockClearActiveSession,
    feedCharacter: jest.fn(async () => undefined),
    setActiveCharacter: jest.fn(async () => undefined),
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, reject, resolve };
}

describe('Task 7 focus timer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-26T01:00:00.000Z'));
    mockPathname = '/focus';
    mockStoreState = makeStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('resumes a persisted timer, completes a whole-minute session, and navigates only after save resolves', async () => {
    const completion = deferred<boolean>();
    mockCompleteSessionWithResult.mockImplementationOnce(() => completion.promise);
    mockStoreState.data.activeSessionStartedAt = '2026-05-26T01:00:00.000Z';

    render(<FocusScreen />);

    expect(screen.getByText('0분')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(125_000);
    });

    expect(screen.getByText('2분')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: '집중 완료' }));

    expect(mockCompleteSessionWithResult).toHaveBeenCalledTimes(1);
    const session = mockCompleteSessionWithResult.mock.calls[0][0];
    expect(Date.parse(session.startedAt)).toBe(new Date('2026-05-26T01:00:00.000Z').getTime());
    expect(Date.parse(session.completedAt)).toBe(new Date('2026-05-26T01:02:05.000Z').getTime());
    expect(session).toMatchObject({
      id: `session-${Date.parse(session.startedAt)}-${Date.parse(session.completedAt)}`,
      durationMinutes: 2,
      rewardClaimed: false,
    });
    expect(mockPush).not.toHaveBeenCalled();

    await act(async () => {
      completion.resolve(true);
      await completion.promise;
    });

    expect(mockPush).toHaveBeenCalledWith('/reward');
  });

  test('allows starting again after returning from a successful completion reward', async () => {
    const completion = deferred<boolean>();
    mockCompleteSessionWithResult.mockImplementationOnce(() => completion.promise);
    mockStoreState.data.activeSessionStartedAt = '2026-05-26T01:00:00.000Z';

    const { rerender } = render(<FocusScreen />);

    fireEvent.press(screen.getByRole('button', { name: '집중 완료' }));

    await act(async () => {
      completion.resolve(true);
      await completion.promise;
    });

    mockStoreState.data = { ...mockStoreState.data, activeSessionStartedAt: undefined };
    rerender(<FocusScreen />);

    const startButton = screen.getByRole('button', { name: '집중 시작' });
    expect(startButton.props.accessibilityState.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(startButton);
      await Promise.resolve();
    });

    expect(mockStartSessionWithResult).toHaveBeenCalledTimes(1);
  });

  test('announces a retryable save failure and stays in focus when completion rejects', async () => {
    mockCompleteSessionWithResult.mockRejectedValueOnce(new Error('save failed'));
    mockStoreState.data.activeSessionStartedAt = '2026-05-26T01:00:00.000Z';

    render(<FocusScreen />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: '집중 완료' }));
      await Promise.resolve();
    });

    const alert = screen.getByRole('alert');
    expect(alert.props.accessibilityLiveRegion).toBe('assertive');
    expect(screen.getByText('기록을 저장하지 못했어요. 다시 시도해 주세요.')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('announces a clock problem and stays in focus when a future marker completion is not applied', async () => {
    mockCompleteSessionWithResult.mockResolvedValueOnce(false);
    mockStoreState.data.activeSessionStartedAt = '2026-05-26T02:00:00.000Z';

    const { rerender } = render(<FocusScreen />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: '집중 완료' }));
      await Promise.resolve();
    });

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('기기 시간을 확인한 뒤 다시 시도해 주세요.')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();

    mockClearActiveSession.mockImplementationOnce(async () => {
      mockStoreState.data = { ...mockStoreState.data, activeSessionStartedAt: undefined };
    });

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: '타이머 취소' }));
      await Promise.resolve();
    });
    rerender(<FocusScreen />);

    expect(mockClearActiveSession).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '집중 시작' })).toBeTruthy();
  });

  test('announces a retryable save failure and retains cancellation when clearing an active timer rejects', async () => {
    mockClearActiveSession.mockRejectedValueOnce(new Error('save failed'));
    mockStoreState.data.activeSessionStartedAt = '2026-05-26T02:00:00.000Z';

    render(<FocusScreen />);

    expect(screen.getByRole('button', { name: '타이머 취소' })).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: '타이머 취소' }));
      await Promise.resolve();
    });

    expect(mockClearActiveSession).toHaveBeenCalledTimes(1);
    expect(screen.getByText('기록을 저장하지 못했어요. 다시 시도해 주세요.')).toBeTruthy();
    expect(screen.getByRole('button', { name: '타이머 취소' })).toBeTruthy();
    expect(mockCompleteSessionWithResult).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('announces a retryable failure when starting a persisted timer rejects', async () => {
    mockStartSessionWithResult.mockRejectedValueOnce(new Error('save failed'));

    render(<FocusScreen />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: '집중 시작' }));
      await Promise.resolve();
    });

    expect(mockStartSessionWithResult).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: '집중 시작' })).toBeTruthy();
  });

  test('announces a clock problem without an active marker when a rollback start is not applied', async () => {
    mockStartSessionWithResult.mockResolvedValueOnce(false);

    render(<FocusScreen />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: '집중 시작' }));
      await Promise.resolve();
    });

    expect(mockStartSessionWithResult).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('기기 시간을 확인한 뒤 다시 시도해 주세요.')).toBeTruthy();
    expect(screen.getByRole('button', { name: '집중 시작' })).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('blocks a session without an active study friend and provides a home return action', () => {
    mockStoreState = makeStore(createInitialState());

    render(<FocusScreen />);

    expect(screen.getByText('공부 친구를 먼저 선택해 주세요')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '집중 시작' })).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: '홈으로 돌아가기' }));

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

describe('Task 7 receipt navigation shell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/reward';
    mockStoreState = makeStore();
  });

  test.each(['/focus', '/reward'])(
    'renders its child route slot at %s instead of owning a tab navigator',
    (pathname) => {
      mockPathname = pathname;

      render(<RootLayout />);

      expect(screen.getByText('route-slot')).toBeTruthy();
      expect(screen.queryByText('product-tabs')).toBeNull();
    },
  );

  test('keeps product tabs in the grouped tab layout', () => {
    render(<TabsLayout />);

    expect(screen.getByText('product-tabs')).toBeTruthy();
  });
});

describe('Task 7 reward receipt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/reward';
    mockStoreState = makeStore();
  });

  test('shows receipt amounts and conditional events with Korean growth stages', () => {
    const data = createInitialState('starter-sprout');
    data.lastReward = {
      sessionId: 'session-reward',
      characterId: 'starter-sprout',
      reward: { xp: 60, snacks: 4, discoveryPoints: 10 },
      grewFrom: 'egg',
      grewTo: 'baby',
      unlockedCharacterId: 'cloud-puff',
      returnGift: {
        type: 'snack',
        amount: 2,
        grantedAt: '2026-05-26T01:02:05.000Z',
      },
    };
    mockStoreState = makeStore(data);

    render(<RewardScreen />);

    expect(screen.getByText('경험치 +60')).toBeTruthy();
    expect(screen.getByText('간식 +4')).toBeTruthy();
    expect(screen.getByText('발견 포인트 +10')).toBeTruthy();
    expect(screen.getByText('성장: 알 → 아기')).toBeTruthy();
    expect(screen.getByText('새 친구 발견: 구름포')).toBeTruthy();
    expect(screen.getByText('돌아온 선물: 간식 2개')).toBeTruthy();
  });

  test('displays zero-valued rewards rather than hiding them', () => {
    const data = createInitialState('starter-sprout');
    data.lastReward = {
      sessionId: 'session-zero',
      characterId: 'starter-sprout',
      reward: { xp: 0, snacks: 0, discoveryPoints: 0 },
    };
    mockStoreState = makeStore(data);

    render(<RewardScreen />);

    expect(screen.getByText('경험치 +0')).toBeTruthy();
    expect(screen.getByText('간식 +0')).toBeTruthy();
    expect(screen.getByText('발견 포인트 +0')).toBeTruthy();
  });

  test('presents a safe empty receipt state with a return-home action', () => {
    render(<RewardScreen />);

    expect(screen.getByText('표시할 보상이 없어요')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: '홈으로 돌아가기' }));

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
