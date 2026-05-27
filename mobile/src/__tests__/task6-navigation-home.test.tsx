import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import HomeScreen from '../app/(tabs)/index';
import RootLayout from '../app/_layout';
import ExploreScreen from '../app/explore';
import AppTabsWeb, { TabButton } from '../components/app-tabs.web';
import { createInitialState } from '../state/initialState';
import type { AppStore } from '../state/useAppStore';

const mockHydrate = jest.fn(async () => undefined);
const mockSelectStarter = jest.fn(async () => undefined);
const mockFeedCharacter = jest.fn(async () => undefined);
const mockPush = jest.fn();
let mockStoreState: AppStore;

jest.mock('@/global.css', () => ({}));

jest.mock('@/state/useAppStore', () => ({
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

jest.mock('@/components/animated-icon', () => ({
  AnimatedIcon: () => null,
  AnimatedSplashOverlay: () => null,
}));

jest.mock('expo-router', () => ({
  DarkTheme: {},
  DefaultTheme: {},
  Link: ({ children }: { children?: ReactNode }) => children ?? null,
  Redirect: ({ href }: { href: string }) => {
    const React = require('react');
    const { Text } = require('react-native');

    return React.createElement(Text, null, `redirect:${href}`);
  },
  Slot: () => {
    const React = require('react');
    const { Text } = require('react-native');

    return React.createElement(Text, null, 'route-slot');
  },
  ThemeProvider: ({ children }: { children?: ReactNode }) => children ?? null,
  usePathname: () => '/',
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('expo-router/ui', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Wrapper = ({ children }: { children?: ReactNode }) =>
    React.createElement(View, null, children);

  return {
    Tabs: Wrapper,
    TabList: Wrapper,
    TabSlot: () => null,
    TabTrigger: Wrapper,
  };
});

jest.mock('expo-symbols', () => ({
  SymbolView: () => null,
}));

function makeStore(data = createInitialState(), hydrated = true): AppStore {
  return {
    data,
    hydrated,
    hydrate: mockHydrate,
    selectStarter: mockSelectStarter,
    startSession: jest.fn(async () => undefined),
    startSessionWithResult: jest.fn(async () => true),
    feedCharacter: mockFeedCharacter,
    completeSession: jest.fn(async () => undefined),
    completeSessionWithResult: jest.fn(async () => true),
    clearActiveSession: jest.fn(async () => undefined),
    setActiveCharacter: jest.fn(async () => undefined),
  };
}

function deferred() {
  let resolve!: (value: undefined) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<undefined>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, reject, resolve };
}

describe('Task 6 root product shell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState = makeStore();
  });

  test('hydrates once and keeps child routes behind a neutral loading state until ready', () => {
    mockStoreState = makeStore(createInitialState(), false);

    const { rerender } = render(<RootLayout />);

    expect(mockHydrate).toHaveBeenCalledTimes(1);
    expect(screen.getByText('불러오는 중...')).toBeTruthy();
    expect(screen.queryByText('product-tabs')).toBeNull();

    mockStoreState = makeStore(createInitialState(), true);
    rerender(<RootLayout />);

    expect(mockHydrate).toHaveBeenCalledTimes(1);
    expect(screen.getByText('route-slot')).toBeTruthy();
  });

  test('presents the four web destinations as labelled navigation rather than a tab widget', () => {
    render(<AppTabsWeb />);

    expect(
      screen.UNSAFE_getByProps({
        accessibilityLabel: '주요 화면',
        role: 'navigation',
      }),
    ).toBeTruthy();
    expect(screen.UNSAFE_queryByProps({ accessibilityRole: 'tablist' })).toBeNull();
    expect(screen.getByText('홈')).toBeTruthy();
    expect(screen.getByText('집중')).toBeTruthy();
    expect(screen.getByText('도감')).toBeTruthy();
    expect(screen.getByText('기록')).toBeTruthy();
    expect(screen.queryByText('Explore')).toBeNull();
  });

  test('marks the focused web destination as the current link while preserving accessibility state', () => {
    render(
      <TabButton isFocused accessibilityState={{ disabled: true }}>
        홈
      </TabButton>,
    );

    const currentLink = screen.getByRole('link', { name: '홈' });

    expect(currentLink.props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(currentLink.props.accessibilityState.selected).toBeUndefined();
    expect(currentLink.props['aria-current']).toBe('page');
    expect(screen.queryByRole('tab')).toBeNull();
  });

  test('redirects the obsolete explore route home instead of rendering Expo sample content', () => {
    render(<ExploreScreen />);

    expect(screen.queryByText('Explore')).toBeNull();
    expect(screen.getByText('redirect:/')).toBeTruthy();
  });
});

describe('Task 6 home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState = makeStore();
  });

  test('offers each starter with a named action and dispatches the chosen starter asynchronously', () => {
    render(<HomeScreen />);

    expect(screen.getByText('첫 공부 친구를 골라주세요')).toBeTruthy();
    expect(screen.getByText('새싹콩')).toBeTruthy();
    expect(screen.getByText('별콩')).toBeTruthy();
    expect(screen.getByText('몽실이')).toBeTruthy();

    expect(screen.getByRole('button', { name: '새싹콩과 시작하기' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '별콩과 시작하기' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '몽실이와 시작하기' })).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: '별콩과 시작하기' }));

    expect(mockSelectStarter).toHaveBeenCalledWith('starter-comet');
  });

  test('shows selection save failure feedback and clears it when retry begins', async () => {
    mockSelectStarter
      .mockRejectedValueOnce(new Error('save failed'))
      .mockImplementationOnce(() => new Promise<undefined>(() => undefined));

    render(<HomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: '새싹콩과 시작하기' }));

    const failureAlert = await screen.findByRole('alert');
    expect(failureAlert.props.accessibilityLiveRegion).toBe('assertive');
    expect(screen.getByText('저장하지 못했어요. 다시 시도해 주세요.')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: '새싹콩과 시작하기' }));

    expect(screen.queryByText('저장하지 못했어요. 다시 시도해 주세요.')).toBeNull();
    expect(mockSelectStarter).toHaveBeenCalledTimes(2);
  });

  test('ignores an earlier rejected save after a newer starter selection has completed', async () => {
    const firstSelection = deferred();
    const secondSelection = deferred();
    mockSelectStarter
      .mockImplementationOnce(() => firstSelection.promise)
      .mockImplementationOnce(() => secondSelection.promise);

    render(<HomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: '새싹콩과 시작하기' }));
    fireEvent.press(screen.getByRole('button', { name: '별콩과 시작하기' }));

    await act(async () => {
      secondSelection.resolve(undefined);
      await secondSelection.promise;
    });

    await act(async () => {
      firstSelection.reject(new Error('stale failure'));
      await Promise.resolve();
    });

    expect(screen.queryByText('저장하지 못했어요. 다시 시도해 주세요.')).toBeNull();
  });

  test('shows today summary and comeback gift while disabling feeding when snacks are empty', () => {
    const now = new Date().toISOString();
    const data = createInitialState('starter-sprout');
    data.sessions = [
      {
        id: 'today-session',
        startedAt: now,
        completedAt: now,
        durationMinutes: 25,
        rewardClaimed: true,
      },
    ];
    data.lastReward = {
      sessionId: 'today-session',
      characterId: 'starter-sprout',
      reward: { xp: 25, snacks: 1, discoveryPoints: 2 },
      returnGift: { type: 'snack', amount: 2, grantedAt: now },
    };
    mockStoreState = makeStore(data);

    render(<HomeScreen />);

    expect(screen.getByText('오늘 공부 25분')).toBeTruthy();
    expect(screen.getByText('보유 간식 0개')).toBeTruthy();
    expect(screen.getByText('돌아온 선물: 간식 2개')).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: '간식 주기' }));

    expect(mockFeedCharacter).not.toHaveBeenCalled();
  });

  test('navigates to focus and feeds the active character when a snack is owned', () => {
    const data = createInitialState('starter-sprout');
    data.snacks = 2;
    mockStoreState = makeStore(data);

    render(<HomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: '집중 시작' }));
    fireEvent.press(screen.getByRole('button', { name: '간식 주기' }));

    expect(mockPush).toHaveBeenCalledWith('/focus');
    expect(mockFeedCharacter).toHaveBeenCalledWith('starter-sprout');
  });

  test('shows failure feedback when feeding cannot be saved', async () => {
    const data = createInitialState('starter-sprout');
    data.snacks = 1;
    mockStoreState = makeStore(data);
    mockFeedCharacter.mockRejectedValueOnce(new Error('save failed'));

    render(<HomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: '간식 주기' }));

    expect(await screen.findByText('저장하지 못했어요. 다시 시도해 주세요.')).toBeTruthy();
  });
});
