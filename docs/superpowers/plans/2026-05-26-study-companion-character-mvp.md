# Study Companion Character MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Expo-based, web-first personal study timer in which completed focus sessions grow collectible companion characters and welcome users back after a break.

**Architecture:** Keep product documentation at the repository root and create the executable Expo Router application in `mobile/`. The MVP is local-first: pure domain functions calculate rewards and growth, a persisted Zustand store owns app state, and route components render the home, focus, collection, and history experiences. The data model includes future raid roles and skills but does not implement social or combat systems.

**Tech Stack:** Expo, React Native, Expo Router, TypeScript, Zustand, `@react-native-async-storage/async-storage`, Jest with `jest-expo`, React Native Testing Library, Expo web/PWA support.

---

## File Structure

```text
docs/superpowers/specs/2026-05-26-study-companion-character-mvp-design.md
docs/superpowers/plans/2026-05-26-study-companion-character-mvp.md
mobile/
  app/
    _layout.tsx                 # Tab navigation and persisted-state boot
    index.tsx                   # Character-centered home screen
    focus.tsx                   # Active focus timer experience
    reward.tsx                  # Last completed session rewards and growth reveal
    collection.tsx              # Character collection and details
    history.tsx                 # Today/week study record
  assets/                       # Expo template assets; character art can replace CSS cards later
  src/
    components/
      CharacterCard.tsx         # Reusable character visualization and progress display
      PrimaryButton.tsx         # Shared action button
    domain/
      catalog.ts                # Eight fixed character definitions
      progression.ts            # XP, friendship, evolution, unlock rules
      rewards.ts                # Time-based reward and daily diminishing-return rules
      returnGift.ts             # Comeback eligibility and deterministic gift creation
      types.ts                  # Stable domain contracts
    storage/
      appStorage.ts             # AsyncStorage JSON persistence adapter
    state/
      initialState.ts           # First-run state creation
      useAppStore.ts            # Session actions, rewards, feeding, discovery, hydration
    theme/
      tokens.ts                 # Colors, spacing, typography constants
    utils/
      time.ts                   # Date-key and duration display helpers
    __tests__/
      rewards.test.ts
      progression.test.ts
      returnGift.test.ts
      useAppStore.test.ts
  app.json
  babel.config.js
  jest.config.js
  package.json
  tsconfig.json
```

## Scope Boundary

This plan implements only the solo-growth MVP. It intentionally leaves authentication, cloud sync, friend invitations, raids, push notifications, final illustration assets, subject-by-subject medical study analytics, and App Store submission for later plans. The role and skill fields are stored now only to prevent character collection data from needing redesign when cooperative raids are designed later.

### Task 1: Scaffold the Expo Router App and Test Harness

**Files:**
- Create: `mobile/` via Expo scaffold
- Modify: `mobile/package.json`
- Create: `mobile/jest.config.js`
- Create: `mobile/src/__tests__/smoke.test.ts`

- [ ] **Step 1: Create the Expo application under `mobile/`**

Run from the repository root:

```powershell
npx create-expo-app@latest mobile --template default
Set-Location mobile
npx expo install @react-native-async-storage/async-storage
npm install zustand
npm install --save-dev jest jest-expo @types/jest @testing-library/react-native
```

Expected: `mobile/package.json` exists and Expo dependency installation succeeds.

- [ ] **Step 2: Configure tests and scripts**

Add the following scripts to `mobile/package.json` without altering the versions produced by Expo:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest --runInBand",
    "typecheck": "tsc --noEmit"
  }
}
```

Create `mobile/jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
```

- [ ] **Step 3: Write and run the first failing smoke test**

Create `mobile/src/__tests__/smoke.test.ts`:

```ts
import { createInitialState } from '../state/initialState';

describe('application scaffold', () => {
  it('creates a starter companion state', () => {
    const state = createInitialState('starter-sprout');
    expect(state.activeCharacterId).toBe('starter-sprout');
    expect(state.characters['starter-sprout'].stage).toBe('egg');
  });
});
```

Run:

```powershell
npm test -- src/__tests__/smoke.test.ts
```

Expected: FAIL because `../state/initialState` does not exist yet.

- [ ] **Step 4: Leave the red test in place for Task 2**

Do not commit while the smoke test is failing. Task 2 supplies the minimum implementation and commits the working scaffold together with the first passing behavior.

### Task 2: Define Character Catalog and Initial State

**Files:**
- Create: `mobile/src/domain/types.ts`
- Create: `mobile/src/domain/catalog.ts`
- Create: `mobile/src/state/initialState.ts`
- Modify: `mobile/src/__tests__/smoke.test.ts`

- [ ] **Step 1: Expand the failing test for the starter catalog**

Replace `mobile/src/__tests__/smoke.test.ts` with:

```ts
import { CHARACTER_CATALOG, STARTER_IDS } from '../domain/catalog';
import { createInitialState } from '../state/initialState';

describe('application scaffold', () => {
  it('offers exactly three starters and five discoveries', () => {
    expect(STARTER_IDS).toHaveLength(3);
    expect(Object.keys(CHARACTER_CATALOG)).toHaveLength(8);
  });

  it('creates a starter companion state and locks other characters', () => {
    const state = createInitialState('starter-sprout');
    expect(state.activeCharacterId).toBe('starter-sprout');
    expect(state.characters['starter-sprout']).toMatchObject({
      discovered: true,
      stage: 'egg',
      xp: 0,
      friendship: 0,
    });
    expect(state.characters['cloud-puff'].discovered).toBe(false);
  });
});
```

Run: `npm test -- src/__tests__/smoke.test.ts`

Expected: FAIL with missing `catalog` and `initialState` modules.

- [ ] **Step 2: Create the stable domain types**

Create `mobile/src/domain/types.ts`:

```ts
export type CharacterStage = 'egg' | 'baby' | 'growing' | 'adult';
export type CharacterRole = 'attack' | 'defense' | 'heal' | 'support';
export type GiftType = 'snack' | 'decor' | 'friendship';

export interface CharacterDefinition {
  id: string;
  name: string;
  description: string;
  role: CharacterRole;
  skillName: string;
  starter: boolean;
  palette: { primary: string; secondary: string };
}

export interface OwnedCharacter {
  id: string;
  discovered: boolean;
  stage: CharacterStage;
  xp: number;
  friendship: number;
}

export interface StudySession {
  id: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  rewardClaimed: boolean;
}

export interface RewardBundle {
  xp: number;
  snacks: number;
  discoveryPoints: number;
}

export interface ReturnGift {
  type: GiftType;
  amount: number;
  grantedAt: string;
}

export interface RewardReceipt {
  sessionId: string;
  reward: RewardBundle;
  characterId: string;
  grewFrom?: CharacterStage;
  grewTo?: CharacterStage;
  unlockedCharacterId?: string;
  returnGift?: ReturnGift;
}

export interface AppData {
  selectedStarter: boolean;
  activeCharacterId: string | null;
  characters: Record<string, OwnedCharacter>;
  sessions: StudySession[];
  snacks: number;
  discoveryPoints: number;
  decorTokens: number;
  lastReward?: RewardReceipt;
}
```

- [ ] **Step 3: Create the fixed eight-character catalog**

Create `mobile/src/domain/catalog.ts`:

```ts
import { CharacterDefinition } from './types';

export const STARTER_IDS = ['starter-sprout', 'starter-comet', 'starter-mallow'] as const;

export const CHARACTER_CATALOG: Record<string, CharacterDefinition> = {
  'starter-sprout': {
    id: 'starter-sprout', name: '새싹콩', description: '차분하게 곁을 지키는 친구',
    role: 'defense', skillName: '포근한 보호막', starter: true,
    palette: { primary: '#8DCB8A', secondary: '#ECF8D8' },
  },
  'starter-comet': {
    id: 'starter-comet', name: '별콩', description: '호기심 많은 반짝 친구',
    role: 'attack', skillName: '반짝 돌진', starter: true,
    palette: { primary: '#F8C45C', secondary: '#FFF1C9' },
  },
  'starter-mallow': {
    id: 'starter-mallow', name: '몽실이', description: '칭찬을 아끼지 않는 친구',
    role: 'heal', skillName: '달콤한 회복', starter: true,
    palette: { primary: '#F3A8BD', secondary: '#FDEAF0' },
  },
  'cloud-puff': {
    id: 'cloud-puff', name: '구름포', description: '느긋한 응원 담당',
    role: 'support', skillName: '구름 응원', starter: false,
    palette: { primary: '#B4C7EA', secondary: '#EDF3FC' },
  },
  'ember-dot': {
    id: 'ember-dot', name: '불씨톡', description: '작지만 뜨거운 용기',
    role: 'attack', skillName: '톡톡 불꽃', starter: false,
    palette: { primary: '#EE8C70', secondary: '#FCE2D8' },
  },
  'shell-nap': {
    id: 'shell-nap', name: '조개잠', description: '튼튼하고 잠이 많은 친구',
    role: 'defense', skillName: '단단한 낮잠', starter: false,
    palette: { primary: '#81B9B2', secondary: '#DCF2EF' },
  },
  'dew-bell': {
    id: 'dew-bell', name: '이슬방울', description: '마음을 맑게 해 주는 친구',
    role: 'heal', skillName: '맑은 물방울', starter: false,
    palette: { primary: '#66BBDC', secondary: '#E1F5FB' },
  },
  'moon-ribbon': {
    id: 'moon-ribbon', name: '달리본', description: '함께 있을수록 빛나는 친구',
    role: 'support', skillName: '달빛 합창', starter: false,
    palette: { primary: '#A58ADE', secondary: '#EFE9FC' },
  },
};
```

- [ ] **Step 4: Implement first-run state creation**

Create `mobile/src/state/initialState.ts`:

```ts
import { CHARACTER_CATALOG, STARTER_IDS } from '../domain/catalog';
import { AppData, OwnedCharacter } from '../domain/types';

export function createInitialState(starterId?: string): AppData {
  if (starterId && !STARTER_IDS.includes(starterId as (typeof STARTER_IDS)[number])) {
    throw new Error('Invalid starter character');
  }

  const characters = Object.fromEntries(
    Object.keys(CHARACTER_CATALOG).map((id) => [
      id,
      { id, discovered: id === starterId, stage: 'egg', xp: 0, friendship: 0 } satisfies OwnedCharacter,
    ]),
  );

  return {
    selectedStarter: Boolean(starterId),
    activeCharacterId: starterId ?? null,
    characters,
    sessions: [],
    snacks: 0,
    discoveryPoints: 0,
    decorTokens: 0,
  };
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```powershell
npm test -- src/__tests__/smoke.test.ts
npm run typecheck
```

Expected: PASS for both starter tests and no TypeScript errors.

```powershell
git add mobile/src
git commit -m "feat: define companion catalog and starter state"
```

### Task 3: Implement Rewards, Evolution, Discovery, and Comeback Gift Rules

**Files:**
- Create: `mobile/src/domain/rewards.ts`
- Create: `mobile/src/domain/progression.ts`
- Create: `mobile/src/domain/returnGift.ts`
- Create: `mobile/src/__tests__/rewards.test.ts`
- Create: `mobile/src/__tests__/progression.test.ts`
- Create: `mobile/src/__tests__/returnGift.test.ts`

- [ ] **Step 1: Write failing reward-rule tests**

Create `mobile/src/__tests__/rewards.test.ts`:

```ts
import { calculateSessionReward } from '../domain/rewards';

describe('calculateSessionReward', () => {
  it('does not reward sessions shorter than fifteen minutes', () => {
    expect(calculateSessionReward(14, 0)).toEqual({ xp: 0, snacks: 0, discoveryPoints: 0 });
  });

  it('rewards a normal completed session', () => {
    expect(calculateSessionReward(30, 0)).toEqual({ xp: 30, snacks: 2, discoveryPoints: 3 });
  });

  it('reduces only the extra reward after four rewarded hours in one day', () => {
    expect(calculateSessionReward(60, 240)).toEqual({ xp: 30, snacks: 2, discoveryPoints: 3 });
  });
});
```

Run: `npm test -- src/__tests__/rewards.test.ts`

Expected: FAIL because `calculateSessionReward` is missing.

- [ ] **Step 2: Implement reward calculation**

Create `mobile/src/domain/rewards.ts`:

```ts
import { RewardBundle } from './types';

const MINIMUM_REWARDED_MINUTES = 15;
const FULL_RATE_DAILY_MINUTES = 240;

export function calculateSessionReward(
  durationMinutes: number,
  rewardedMinutesToday: number,
): RewardBundle {
  if (durationMinutes < MINIMUM_REWARDED_MINUTES) {
    return { xp: 0, snacks: 0, discoveryPoints: 0 };
  }

  const fullRateMinutes = Math.max(
    0,
    Math.min(durationMinutes, FULL_RATE_DAILY_MINUTES - rewardedMinutesToday),
  );
  const reducedMinutes = durationMinutes - fullRateMinutes;
  const effectiveMinutes = fullRateMinutes + Math.floor(reducedMinutes * 0.5);

  return {
    xp: effectiveMinutes,
    snacks: Math.max(1, Math.floor(effectiveMinutes / 15)),
    discoveryPoints: Math.max(1, Math.floor(effectiveMinutes / 10)),
  };
}
```

- [ ] **Step 3: Write failing progression tests**

Create `mobile/src/__tests__/progression.test.ts`:

```ts
import { applyGrowth, unlockNextCharacter } from '../domain/progression';
import { createInitialState } from '../state/initialState';

describe('companion progression', () => {
  it('grows an egg to a baby when xp and friendship meet the threshold', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];
    expect(applyGrowth({ ...character, xp: 60, friendship: 2 }).stage).toBe('baby');
  });

  it('does not grow from xp alone', () => {
    const character = createInitialState('starter-sprout').characters['starter-sprout'];
    expect(applyGrowth({ ...character, xp: 60, friendship: 0 }).stage).toBe('egg');
  });

  it('unlocks the first hidden character and spends one hundred discovery points', () => {
    const state = createInitialState('starter-sprout');
    expect(unlockNextCharacter(state.characters, 140)).toEqual({
      unlockedCharacterId: 'cloud-puff',
      remainingPoints: 40,
    });
  });
});
```

Run: `npm test -- src/__tests__/progression.test.ts`

Expected: FAIL because progression functions are missing.

- [ ] **Step 4: Implement deterministic progression**

Create `mobile/src/domain/progression.ts`:

```ts
import { CHARACTER_CATALOG } from './catalog';
import { CharacterStage, OwnedCharacter } from './types';

const STAGE_RULES: Record<CharacterStage, { next?: CharacterStage; xp: number; friendship: number }> = {
  egg: { next: 'baby', xp: 60, friendship: 2 },
  baby: { next: 'growing', xp: 240, friendship: 8 },
  growing: { next: 'adult', xp: 600, friendship: 18 },
  adult: { xp: Number.POSITIVE_INFINITY, friendship: Number.POSITIVE_INFINITY },
};

export function applyGrowth(character: OwnedCharacter): OwnedCharacter {
  const rule = STAGE_RULES[character.stage];
  if (rule.next && character.xp >= rule.xp && character.friendship >= rule.friendship) {
    return { ...character, stage: rule.next };
  }
  return character;
}

export function unlockNextCharacter(
  characters: Record<string, OwnedCharacter>,
  discoveryPoints: number,
): { unlockedCharacterId?: string; remainingPoints: number } {
  const requiredPoints = 100;
  if (discoveryPoints < requiredPoints) return { remainingPoints: discoveryPoints };
  const unlockedCharacterId = Object.values(CHARACTER_CATALOG)
    .filter((definition) => !definition.starter)
    .find((definition) => !characters[definition.id].discovered)?.id;
  if (!unlockedCharacterId) return { remainingPoints: discoveryPoints };
  return { unlockedCharacterId, remainingPoints: discoveryPoints - requiredPoints };
}
```

- [ ] **Step 5: Write failing comeback-gift tests**

Create `mobile/src/__tests__/returnGift.test.ts`:

```ts
import { createReturnGift } from '../domain/returnGift';

describe('return gift', () => {
  it('gives no gift when the last session was yesterday', () => {
    expect(createReturnGift('2026-05-25T10:00:00.000Z', '2026-05-26T10:00:00.000Z')).toBeUndefined();
  });

  it('welcomes a user completing a session after at least one full missed day', () => {
    expect(createReturnGift('2026-05-23T10:00:00.000Z', '2026-05-26T10:00:00.000Z')).toEqual({
      type: 'snack',
      amount: 2,
      grantedAt: '2026-05-26T10:00:00.000Z',
    });
  });
});
```

Run: `npm test -- src/__tests__/returnGift.test.ts`

Expected: FAIL because `createReturnGift` is missing.

- [ ] **Step 6: Implement a non-escalating return gift**

Create `mobile/src/domain/returnGift.ts`:

```ts
import { ReturnGift } from './types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function createReturnGift(
  previousCompletedAt: string | undefined,
  completedAt: string,
): ReturnGift | undefined {
  if (!previousCompletedAt) return undefined;
  const absenceMs = new Date(completedAt).getTime() - new Date(previousCompletedAt).getTime();
  if (absenceMs < ONE_DAY_MS * 2) return undefined;
  return { type: 'snack', amount: 2, grantedAt: completedAt };
}
```

- [ ] **Step 7: Run domain tests and commit**

Run:

```powershell
npm test -- src/__tests__/rewards.test.ts src/__tests__/progression.test.ts src/__tests__/returnGift.test.ts
npm run typecheck
```

Expected: PASS for reward, progression, and comeback behavior.

```powershell
git add mobile/src/domain mobile/src/__tests__
git commit -m "feat: add study reward and companion progression rules"
```

### Task 4: Persist State and Process Completed Sessions Exactly Once

**Files:**
- Create: `mobile/src/storage/appStorage.ts`
- Create: `mobile/src/utils/time.ts`
- Create: `mobile/src/state/useAppStore.ts`
- Create: `mobile/src/__tests__/useAppStore.test.ts`

- [ ] **Step 1: Write failing store behavior tests**

Create `mobile/src/__tests__/useAppStore.test.ts`:

```ts
import { createInitialState } from '../state/initialState';
import { createAppActions } from '../state/useAppStore';

describe('study app actions', () => {
  it('awards one completed session exactly once', () => {
    const initial = createInitialState('starter-sprout');
    const actions = createAppActions(() => initial);
    const afterFirst = actions.completeSession(initial, {
      id: 'session-1',
      startedAt: '2026-05-26T00:00:00.000Z',
      completedAt: '2026-05-26T00:30:00.000Z',
      durationMinutes: 30,
      rewardClaimed: false,
    });
    const afterSecond = actions.completeSession(afterFirst, afterFirst.sessions[0]);

    expect(afterFirst.snacks).toBe(2);
    expect(afterFirst.characters['starter-sprout'].xp).toBe(30);
    expect(afterSecond.snacks).toBe(2);
    expect(afterSecond.characters['starter-sprout'].xp).toBe(30);
  });

  it('uses a snack to raise friendship and trigger growth', () => {
    const initial = createInitialState('starter-sprout');
    const ready = {
      ...initial,
      snacks: 2,
      characters: {
        ...initial.characters,
        'starter-sprout': { ...initial.characters['starter-sprout'], xp: 60, friendship: 1 },
      },
    };
    const actions = createAppActions(() => ready);
    const updated = actions.feedCharacter(ready, 'starter-sprout');
    expect(updated.characters['starter-sprout']).toMatchObject({ friendship: 2, stage: 'baby' });
    expect(updated.snacks).toBe(1);
  });
});
```

Run: `npm test -- src/__tests__/useAppStore.test.ts`

Expected: FAIL because state actions do not exist.

- [ ] **Step 2: Implement date utilities and AsyncStorage adapter**

Create `mobile/src/utils/time.ts`:

```ts
export function localDateKey(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}시간 ${rest}분` : `${rest}분`;
}
```

Create `mobile/src/storage/appStorage.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from '../domain/types';

const APP_DATA_KEY = 'study-companion/app-data/v1';

export async function loadAppData(): Promise<AppData | null> {
  const stored = await AsyncStorage.getItem(APP_DATA_KEY);
  return stored ? (JSON.parse(stored) as AppData) : null;
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}
```

- [ ] **Step 3: Implement pure actions plus persisted Zustand store**

Create `mobile/src/state/useAppStore.ts`:

```ts
import { create } from 'zustand';
import { AppData, StudySession } from '../domain/types';
import { calculateSessionReward } from '../domain/rewards';
import { applyGrowth, unlockNextCharacter } from '../domain/progression';
import { createReturnGift } from '../domain/returnGift';
import { loadAppData, saveAppData } from '../storage/appStorage';
import { localDateKey } from '../utils/time';
import { createInitialState } from './initialState';

export function createAppActions(getData: () => AppData) {
  return {
    completeSession(data: AppData, session: StudySession): AppData {
      if (data.sessions.some((saved) => saved.id === session.id && saved.rewardClaimed)) return data;
      const activeId = data.activeCharacterId;
      if (!activeId) return data;
      const previousSession = data.sessions.filter((saved) => saved.rewardClaimed).at(-1);
      const rewardedMinutesToday = data.sessions
        .filter((saved) => saved.rewardClaimed && localDateKey(saved.completedAt) === localDateKey(session.completedAt))
        .reduce((sum, saved) => sum + saved.durationMinutes, 0);
      const reward = calculateSessionReward(session.durationMinutes, rewardedMinutesToday);
      const returnGift = createReturnGift(previousSession?.completedAt, session.completedAt);
      const before = data.characters[activeId];
      const after = applyGrowth({ ...before, xp: before.xp + reward.xp });
      const earnedDiscoveryPoints = data.discoveryPoints + reward.discoveryPoints;
      const { unlockedCharacterId, remainingPoints: discoveryPoints } =
        unlockNextCharacter(data.characters, earnedDiscoveryPoints);
      const characters = {
        ...data.characters,
        [activeId]: after,
        ...(unlockedCharacterId
          ? { [unlockedCharacterId]: { ...data.characters[unlockedCharacterId], discovered: true } }
          : {}),
      };
      const receipt = {
        sessionId: session.id,
        reward,
        characterId: activeId,
        ...(before.stage !== after.stage ? { grewFrom: before.stage, grewTo: after.stage } : {}),
        ...(unlockedCharacterId ? { unlockedCharacterId } : {}),
        ...(returnGift ? { returnGift } : {}),
      };
      return {
        ...data,
        characters,
        snacks: data.snacks + reward.snacks + (returnGift?.type === 'snack' ? returnGift.amount : 0),
        discoveryPoints,
        sessions: [...data.sessions, { ...session, rewardClaimed: true }],
        lastReward: receipt,
      };
    },
    feedCharacter(data: AppData, characterId: string): AppData {
      if (data.snacks < 1 || !data.characters[characterId]?.discovered) return data;
      const updated = applyGrowth({
        ...data.characters[characterId],
        friendship: data.characters[characterId].friendship + 1,
      });
      return { ...data, snacks: data.snacks - 1, characters: { ...data.characters, [characterId]: updated } };
    },
  };
}

interface AppStore {
  data: AppData;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  selectStarter: (id: string) => Promise<void>;
  completeSession: (session: StudySession) => Promise<void>;
  feedCharacter: (id: string) => Promise<void>;
  setActiveCharacter: (id: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  data: createInitialState(),
  hydrated: false,
  hydrate: async () => {
    const stored = await loadAppData();
    set({ data: stored ?? createInitialState(), hydrated: true });
  },
  selectStarter: async (id) => {
    const data = createInitialState(id);
    await saveAppData(data);
    set({ data });
  },
  completeSession: async (session) => {
    const actions = createAppActions(() => get().data);
    const data = actions.completeSession(get().data, session);
    await saveAppData(data);
    set({ data });
  },
  feedCharacter: async (id) => {
    const actions = createAppActions(() => get().data);
    const data = actions.feedCharacter(get().data, id);
    await saveAppData(data);
    set({ data });
  },
  setActiveCharacter: async (id) => {
    const current = get().data;
    if (!current.characters[id]?.discovered) return;
    const data = { ...current, activeCharacterId: id };
    await saveAppData(data);
    set({ data });
  },
}));
```

- [ ] **Step 4: Run action tests and commit**

Run:

```powershell
npm test -- src/__tests__/useAppStore.test.ts
npm test
npm run typecheck
```

Expected: all domain/store tests PASS; no TypeScript errors.

```powershell
git add mobile/src
git commit -m "feat: persist study sessions and apply rewards once"
```

### Task 5: Build Theme and Shared Character Components

**Files:**
- Create: `mobile/src/theme/tokens.ts`
- Create: `mobile/src/components/PrimaryButton.tsx`
- Create: `mobile/src/components/CharacterCard.tsx`

- [ ] **Step 1: Create visual tokens**

Create `mobile/src/theme/tokens.ts`:

```ts
export const colors = {
  background: '#FFF9F2',
  surface: '#FFFFFF',
  ink: '#2E2A30',
  muted: '#776E75',
  accent: '#FF8769',
  accentSoft: '#FFE5DC',
  line: '#F0E3DB',
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 12, md: 20, lg: 28, pill: 999 };
```

- [ ] **Step 2: Create reusable button**

Create `mobile/src/components/PrimaryButton.tsx`:

```tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: { opacity: 0.45 },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 3: Create character visualization without final art assets**

Create `mobile/src/components/CharacterCard.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { CHARACTER_CATALOG } from '../domain/catalog';
import { OwnedCharacter } from '../domain/types';
import { colors, radius, spacing } from '../theme/tokens';

const stageLabel = { egg: '알', baby: '아기', growing: '성장기', adult: '성체' };

export function CharacterCard({ character, compact = false }: { character: OwnedCharacter; compact?: boolean }) {
  const definition = CHARACTER_CATALOG[character.id];
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={[styles.avatar, { backgroundColor: definition.palette.secondary }]}>
        <View style={[styles.egg, { backgroundColor: definition.palette.primary }]} />
      </View>
      <Text style={styles.name}>{definition.name}</Text>
      <Text style={styles.detail}>{stageLabel[character.stage]} · {definition.role} · {definition.skillName}</Text>
      {!compact && <Text style={styles.detail}>경험치 {character.xp} · 친밀도 {character.friendship}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  compact: { padding: spacing.sm },
  avatar: {
    height: 120,
    width: 120,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  egg: { height: 64, width: 52, borderRadius: 28 },
  name: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  detail: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});
```

- [ ] **Step 4: Type-check and commit UI primitives**

Run: `npm run typecheck`

Expected: PASS.

```powershell
git add mobile/src/components mobile/src/theme
git commit -m "feat: add companion UI primitives"
```

### Task 6: Implement Navigation, Starter Selection, and Home Screen

**Files:**
- Replace: `mobile/app/_layout.tsx`
- Replace: `mobile/app/index.tsx`

- [ ] **Step 1: Implement persisted-state boot and tab navigation**

Replace `mobile/app/_layout.tsx`:

```tsx
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useAppStore } from '../src/state/useAppStore';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  const hydrated = useAppStore((state) => state.hydrated);
  const hydrate = useAppStore((state) => state.hydrate);

  useEffect(() => { void hydrate(); }, [hydrate]);

  if (!hydrated) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator /></View>;
  }

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent }}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="focus" options={{ title: '집중' }} />
      <Tabs.Screen name="collection" options={{ title: '도감' }} />
      <Tabs.Screen name="history" options={{ title: '기록' }} />
      <Tabs.Screen name="reward" options={{ href: null }} />
    </Tabs>
  );
}
```

- [ ] **Step 2: Implement first-run selection and everyday home**

Replace `mobile/app/index.tsx`:

```tsx
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { STARTER_IDS } from '../src/domain/catalog';
import { CharacterCard } from '../src/components/CharacterCard';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useAppStore } from '../src/state/useAppStore';
import { colors, radius, spacing } from '../src/theme/tokens';
import { formatMinutes, localDateKey } from '../src/utils/time';

export default function HomeScreen() {
  const data = useAppStore((state) => state.data);
  const selectStarter = useAppStore((state) => state.selectStarter);
  const feedCharacter = useAppStore((state) => state.feedCharacter);
  const today = localDateKey(new Date().toISOString());
  const todayMinutes = data.sessions
    .filter((session) => localDateKey(session.completedAt) === today)
    .reduce((sum, session) => sum + session.durationMinutes, 0);

  if (!data.selectedStarter) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>첫 공부 친구를 골라주세요</Text>
        {STARTER_IDS.map((id) => (
          <View key={id} style={styles.selection}>
            <CharacterCard character={data.characters[id]} />
            <PrimaryButton label="이 친구와 시작하기" onPress={() => void selectStarter(id)} />
          </View>
        ))}
      </ScrollView>
    );
  }

  const active = data.characters[data.activeCharacterId!];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>오늘도 같이 공부해요</Text>
        <Text style={styles.studyTime}>오늘 {formatMinutes(todayMinutes)}</Text>
      </View>
      <CharacterCard character={active} />
      <PrimaryButton label="집중 시작" onPress={() => router.push('/focus')} />
      <View style={styles.actionRow}>
        <Text style={styles.note}>보유 간식 {data.snacks}개</Text>
        <PrimaryButton
          label="간식 주기"
          disabled={data.snacks < 1}
          onPress={() => void feedCharacter(active.id)}
        />
      </View>
      {data.lastReward?.returnGift && (
        <View style={styles.gift}>
          <Text style={styles.giftText}>다시 만나서 좋아요. 응원 간식 선물을 받았어요!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xs },
  title: { color: colors.ink, fontSize: 26, fontWeight: '800' },
  studyTime: { color: colors.muted, fontSize: 15 },
  selection: { gap: spacing.sm },
  actionRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  note: { color: colors.muted },
  gift: { backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: spacing.md },
  giftText: { color: colors.ink, fontWeight: '600' },
});
```

- [ ] **Step 3: Start web app and visually verify selection/home**

Run: `npm run web`

Expected: Expo web loads; first launch shows three selectable starter cards; after selecting a starter the home screen shows the character, focus button, and snack action.

- [ ] **Step 4: Commit navigation and home**

```powershell
git add mobile/app
git commit -m "feat: add starter selection and character home"
```

### Task 7: Implement Focus Timer and Reward Receipt Flow

**Files:**
- Create: `mobile/app/focus.tsx`
- Create: `mobile/app/reward.tsx`

- [ ] **Step 1: Implement the focus timer route**

Create `mobile/app/focus.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useAppStore } from '../src/state/useAppStore';
import { colors, spacing } from '../src/theme/tokens';

export default function FocusScreen() {
  const completeSession = useAppStore((state) => state.completeSession);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const elapsedMinutes = useMemo(
    () => startedAt ? Math.floor((now - new Date(startedAt).getTime()) / 60000) : 0,
    [now, startedAt],
  );

  async function finishSession() {
    if (!startedAt) return;
    const completedAt = new Date().toISOString();
    await completeSession({
      id: `${startedAt}-${completedAt}`,
      startedAt,
      completedAt,
      durationMinutes: elapsedMinutes,
      rewardClaimed: false,
    });
    router.replace('/reward');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>함께 집중하는 시간</Text>
      <Text style={styles.timer}>{elapsedMinutes}분</Text>
      <Text style={styles.note}>15분 이상 완료하면 성장 보상을 받아요.</Text>
      {!startedAt ? (
        <PrimaryButton label="타이머 시작" onPress={() => { setStartedAt(new Date().toISOString()); setNow(Date.now()); }} />
      ) : (
        <PrimaryButton label="공부 마치기" onPress={() => void finishSession()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center', gap: spacing.lg },
  title: { textAlign: 'center', color: colors.ink, fontSize: 25, fontWeight: '800' },
  timer: { textAlign: 'center', color: colors.accent, fontSize: 64, fontWeight: '800' },
  note: { textAlign: 'center', color: colors.muted },
});
```

- [ ] **Step 2: Implement reward receipt route**

Create `mobile/app/reward.tsx`:

```tsx
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { CHARACTER_CATALOG } from '../src/domain/catalog';
import { useAppStore } from '../src/state/useAppStore';
import { colors, radius, spacing } from '../src/theme/tokens';

export default function RewardScreen() {
  const receipt = useAppStore((state) => state.data.lastReward);
  if (!receipt) {
    return <View style={styles.container}><PrimaryButton label="홈으로" onPress={() => router.replace('/')} /></View>;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 집중 완료</Text>
      <View style={styles.receipt}>
        <Text style={styles.item}>성장 경험치 +{receipt.reward.xp}</Text>
        <Text style={styles.item}>간식 +{receipt.reward.snacks}</Text>
        <Text style={styles.item}>발견 포인트 +{receipt.reward.discoveryPoints}</Text>
        {receipt.grewTo && <Text style={styles.highlight}>캐릭터가 {receipt.grewTo} 단계로 성장했어요!</Text>}
        {receipt.unlockedCharacterId && (
          <Text style={styles.highlight}>{CHARACTER_CATALOG[receipt.unlockedCharacterId].name}의 알을 발견했어요!</Text>
        )}
        {receipt.returnGift && <Text style={styles.highlight}>복귀 응원선물: 간식 +{receipt.returnGift.amount}</Text>}
      </View>
      <PrimaryButton label="캐릭터 만나러 가기" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center', gap: spacing.lg },
  title: { color: colors.ink, fontSize: 27, fontWeight: '800', textAlign: 'center' },
  receipt: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  item: { color: colors.ink, fontSize: 18 },
  highlight: { color: colors.accent, fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 3: Verify timer and rewards manually**

For development verification only, temporarily change `elapsedMinutes` calculation divisor from `60000` to `1000`, complete a 15-second session, then revert it before committing.

Run: `npm run web`

Expected: ending a rewarded session routes to the receipt; returning home displays updated character XP and snack balance. A less-than-15-minute production-rule session shows zero rewards.

- [ ] **Step 4: Commit focus and reward flow**

```powershell
git add mobile/app/focus.tsx mobile/app/reward.tsx
git commit -m "feat: connect focus sessions to growth rewards"
```

### Task 8: Implement Collection and Study History Screens

**Files:**
- Create: `mobile/app/collection.tsx`
- Create: `mobile/app/history.tsx`

- [ ] **Step 1: Implement collection display and active companion selection**

Create `mobile/app/collection.tsx`:

```tsx
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CharacterCard } from '../src/components/CharacterCard';
import { CHARACTER_CATALOG } from '../src/domain/catalog';
import { useAppStore } from '../src/state/useAppStore';
import { colors, radius, spacing } from '../src/theme/tokens';

export default function CollectionScreen() {
  const data = useAppStore((state) => state.data);
  const setActiveCharacter = useAppStore((state) => state.setActiveCharacter);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>나의 도감</Text>
      <Text style={styles.caption}>발견 포인트 {data.discoveryPoints}</Text>
      <View style={styles.grid}>
        {Object.keys(CHARACTER_CATALOG).map((id) => {
          const character = data.characters[id];
          if (!character.discovered) {
            return <View key={id} style={styles.unknown}><Text style={styles.question}>?</Text><Text style={styles.caption}>아직 미발견</Text></View>;
          }
          return (
            <Pressable key={id} style={styles.entry} onPress={() => void setActiveCharacter(id)}>
              <CharacterCard character={character} compact />
              {data.activeCharacterId === id && <Text style={styles.active}>함께 공부 중</Text>}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  title: { color: colors.ink, fontSize: 26, fontWeight: '800' },
  caption: { color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm },
  entry: { width: '48%', gap: spacing.xs },
  active: { textAlign: 'center', color: colors.accent, fontWeight: '700' },
  unknown: { width: '48%', height: 190, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  question: { fontSize: 42, color: colors.line, fontWeight: '800' },
});
```

- [ ] **Step 2: Implement daily/weekly history**

Create `mobile/app/history.tsx`:

```tsx
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../src/state/useAppStore';
import { colors, radius, spacing } from '../src/theme/tokens';
import { formatMinutes, localDateKey } from '../src/utils/time';

export default function HistoryScreen() {
  const sessions = useAppStore((state) => state.data.sessions).filter((session) => session.rewardClaimed);
  const todayKey = localDateKey(new Date().toISOString());
  const todayMinutes = sessions
    .filter((session) => localDateKey(session.completedAt) === todayKey)
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekMinutes = sessions
    .filter((session) => new Date(session.completedAt).getTime() >= weekStart)
    .reduce((sum, session) => sum + session.durationMinutes, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>공부 기록</Text>
      <View style={styles.summary}>
        <Text style={styles.metric}>오늘 {formatMinutes(todayMinutes)}</Text>
        <Text style={styles.metric}>최근 7일 {formatMinutes(weekMinutes)}</Text>
      </View>
      {sessions.slice().reverse().map((session) => (
        <View key={session.id} style={styles.row}>
          <Text style={styles.date}>{localDateKey(session.completedAt)}</Text>
          <Text style={styles.duration}>{formatMinutes(session.durationMinutes)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  title: { color: colors.ink, fontSize: 26, fontWeight: '800' },
  summary: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  metric: { fontSize: 18, color: colors.ink, fontWeight: '700' },
  row: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
  date: { color: colors.muted },
  duration: { color: colors.ink, fontWeight: '700' },
});
```

- [ ] **Step 3: Verify collection and record flows**

Run:

```powershell
npm test
npm run typecheck
npm run web
```

Expected: tests PASS; the web UI shows collection silhouettes and recorded sessions; discovered characters can be selected as the active companion.

- [ ] **Step 4: Commit collection and history screens**

```powershell
git add mobile/app/collection.tsx mobile/app/history.tsx
git commit -m "feat: show collection and study history"
```

### Task 9: Add Timer Recovery and PWA Metadata

**Files:**
- Modify: `mobile/src/domain/types.ts`
- Modify: `mobile/src/storage/appStorage.ts`
- Modify: `mobile/src/state/useAppStore.ts`
- Modify: `mobile/app/focus.tsx`
- Modify: `mobile/app.json`
- Create: `mobile/src/__tests__/activeSession.test.ts`

- [ ] **Step 1: Write a failing active-session recovery test**

Create `mobile/src/__tests__/activeSession.test.ts`:

```ts
import { recoverElapsedMinutes } from '../state/useAppStore';

describe('active focus recovery', () => {
  it('calculates elapsed minutes after the app is reopened', () => {
    expect(recoverElapsedMinutes('2026-05-26T10:00:00.000Z', '2026-05-26T10:31:00.000Z')).toBe(31);
  });
});
```

Run: `npm test -- src/__tests__/activeSession.test.ts`

Expected: FAIL because the recovery helper is absent.

- [ ] **Step 2: Add active-session state and recovery helper**

Add to `AppData` in `mobile/src/domain/types.ts`:

```ts
  activeSessionStartedAt?: string;
```

Add to `mobile/src/state/useAppStore.ts`:

```ts
export function recoverElapsedMinutes(startedAt: string, nowIso: string): number {
  return Math.max(0, Math.floor((new Date(nowIso).getTime() - new Date(startedAt).getTime()) / 60000));
}
```

Extend `AppStore` with:

```ts
  startSession: () => Promise<void>;
  clearActiveSession: () => Promise<void>;
```

Add the store implementations:

```ts
  startSession: async () => {
    const data = { ...get().data, activeSessionStartedAt: new Date().toISOString() };
    await saveAppData(data);
    set({ data });
  },
  clearActiveSession: async () => {
    const data = { ...get().data, activeSessionStartedAt: undefined };
    await saveAppData(data);
    set({ data });
  },
```

Update `completeSession` to clear the active marker after awarding:

```ts
    const data = { ...actions.completeSession(get().data, session), activeSessionStartedAt: undefined };
```

- [ ] **Step 3: Bind the timer screen to persisted active session**

In `mobile/app/focus.tsx`, replace the local `startedAt` state with persisted values:

```tsx
  const startedAt = useAppStore((state) => state.data.activeSessionStartedAt);
  const startSession = useAppStore((state) => state.startSession);
```

Replace the start button callback with:

```tsx
<PrimaryButton label="타이머 시작" onPress={() => void startSession()} />
```

Keep completion based on `startedAt`, so reopening the route reconstructs elapsed time from the persisted ISO timestamp.

- [ ] **Step 4: Add installable web app metadata**

Update the Expo config portion of `mobile/app.json`:

```json
{
  "expo": {
    "name": "공부 친구",
    "slug": "study-companion",
    "scheme": "studycompanion",
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

Keep template-generated icon and splash file paths that exist in `mobile/assets/`; do not reference files that are not present.

- [ ] **Step 5: Run recovery test, export web, and commit**

Run:

```powershell
npm test -- src/__tests__/activeSession.test.ts
npm test
npm run typecheck
npx expo export --platform web
```

Expected: tests PASS, typecheck succeeds, and Expo exports an installable static web build to `mobile/dist/`.

```powershell
git add mobile/app.json mobile/app/focus.tsx mobile/src
git commit -m "feat: recover active timer sessions and configure web build"
```

### Task 10: Browser QA on the Complete MVP

**Files:**
- Modify only files necessary to resolve verified defects

- [ ] **Step 1: Start the web app for interactive testing**

Run:

```powershell
npm run web
```

Expected: Expo prints the local web URL, normally `http://localhost:8081`.

- [ ] **Step 2: Use the Browser plugin to verify core flows**

Open the local app in the in-app browser and confirm:

```text
First launch:
- Three starter characters appear.
- Selecting one moves to the character-centered home.

Study loop:
- Starting the timer shows an active session.
- Ending a session routes to the reward screen.
- A rewarded session changes XP/snacks exactly once.

Care loop:
- Giving a snack decreases snack inventory and raises friendship.
- Once XP and friendship thresholds are reached, stage changes render on home and collection.

Return and persistence:
- Refresh/reopen while timing reconstructs the in-progress session.
- Refresh after rewards preserves session history and companion state.

Navigation:
- Home, Focus, Collection, and History screens render on an iPhone-size viewport without clipped primary actions.
```

Expected: all checklist items are observable without console errors.

- [ ] **Step 3: Run final automated verification**

Run:

```powershell
npm test
npm run typecheck
npx expo export --platform web
```

Expected: tests PASS, TypeScript emits no errors, and static web export completes.

- [ ] **Step 4: Commit verified defect fixes, if any**

```powershell
git add mobile
git commit -m "fix: polish verified MVP flows"
```

Expected: only use this commit if QA produced fixes; do not create an empty commit.

## Deferred Follow-Up Plans

After real solo-use feedback, create separate design and implementation plans for:

1. Final illustrated character assets and room decoration inventory.
2. Authentication and cloud backup across devices.
3. Friend invitations, asynchronous parties, and automatic cooperative raids.
4. iOS TestFlight delivery, native notifications, and App Store readiness.

## Plan Self-Review

- **Spec coverage:** The plan implements focus sessions, immediate rewards, four growth stages, snack friendship, starter selection, eight-character collection, role/skill metadata, comeback gifts, home/focus/reward/collection/history screens, timer restoration, local persistence, and Expo web-first delivery. Social raids and richer medical-specific analytics remain explicitly deferred as specified.
- **Scope check:** Only one testable subsystem is built: the solo local-first growth MVP. Cooperative functionality is a separate future product slice.
- **Type consistency:** `AppData`, `OwnedCharacter`, `RewardReceipt`, and `StudySession` introduced in Task 2 are used consistently in subsequent tasks; reward and storage APIs keep the same identifiers. Discovery unlocking explicitly consumes 100 points so repeated unlocks require repeated earning.
- **Placeholder scan:** There are no incomplete implementation placeholders; the only intentionally deferred work is stated under excluded scope or follow-up plans.
