# 2단계 병렬 AI 개발 계획서

> 목적: 여러 AI 코딩 도구가 동시에 작업해도 충돌이 적도록, Supabase 기반 로그인/친구/랭킹, 캐릭터 도감, 솔로 스테이지 게임 루프, 고급 UI 작업을 나눠서 진행한다.

## 전체 방향

지금 앱은 이미 핵심 루프가 어느 정도 검증됐다.

- 공부 세션 완료
- 경험치 지급
- 간식 획득
- 간식 주기
- 누적/차감
- 같은 기기에서 앱을 껐다 켜도 유지

그래서 다음 단계는 “백엔드를 크게 먼저 만들기”보다, 지금 되는 공부-성장 루프를 지키면서 게임성과 소셜 기능을 얹는 방향이 좋다.

우선순위는 다음처럼 잡는다.

1. **솔로 게임 진행:** 공부하면 스테이지가 밀리고, 방치형 게임처럼 성장하는 느낌을 만든다.
2. **캐릭터 도감 강화:** 캐릭터를 누르면 설명, 현재 진화 단계, 다음 진화 실루엣, 해금 힌트가 보이게 한다.
3. **Supabase 백엔드:** 로그인, 클라우드 저장, 친구추가, 친구끼리 랭킹을 붙인다.
4. **고급 UI 기반:** MVP 느낌에서 벗어나, 수집형 방치 게임처럼 더 세련된 화면 체계를 만든다.

추천 개발 순서는 다음과 같다.

1. 로컬에서 솔로 스테이지 루프를 먼저 만든다.
2. 캐릭터 도감과 공통 UI 컴포넌트를 고급스럽게 다듬는다.
3. Supabase 로그인/친구/랭킹을 서비스 레이어로 만든다.
4. 마지막에 내가 통합하면서 상태 저장, 라우팅, 타입 충돌을 정리한다.

## 현재 프로젝트 상황

- 프로젝트 루트: `C:\Users\PC\Documents\공부시간어플`
- 메인 앱: `mobile/`
- 기술 스택: Expo, React Native, Expo Router, TypeScript, Zustand, AsyncStorage, Jest
- 중요한 기존 파일:
  - `mobile/src/state/useAppStore.ts`
  - `mobile/src/domain/types.ts`
  - `mobile/src/domain/catalog.ts`
  - `mobile/src/domain/rewards.ts`
  - `mobile/src/domain/progression.ts`
  - `mobile/src/app/(tabs)/index.tsx`
  - `mobile/src/app/(tabs)/collection.tsx`
  - `mobile/src/theme/tokens.ts`

## 충돌 방지 규칙

여러 AI를 동시에 쓰면 속도는 빨라지지만, 같은 파일을 건드리면 오히려 더 오래 걸린다. 아래 규칙을 꼭 지킨다.

1. 각 AI는 자기 브랜치나 별도 작업 복사본에서 작업한다.
2. 각 AI는 지정된 파일 범위만 수정한다.
3. 기능 담당 AI는 `mobile/src/state/useAppStore.ts`를 직접 수정하지 않는다.
4. 기능 담당 AI는 `mobile/src/domain/types.ts`를 직접 수정하지 않는다. 필요한 타입은 “제안”으로만 남긴다.
5. 기능 담당 AI는 `mobile/src/app/(tabs)/_layout.tsx`를 직접 수정하지 않는다. 탭/라우팅 연결은 통합 담당이 한다.
6. 패키지 버전 변경은 사전 승인 없이 하지 않는다.
7. 각 AI는 최소한 아래 명령을 실행한다.
   - `npm test`
   - `npm run typecheck`
8. 테스트를 실행하지 못했다면 이유를 정확히 적는다.
9. UI 작업은 화면마다 따로 스타일을 만들지 말고 공통 토큰/컴포넌트를 사용한다.
10. 백엔드 작업은 모바일 화면을 먼저 고치지 말고, typed service 함수와 문서부터 만든다.

## 모든 AI에게 공통으로 넣을 안전장치

각 AI 하네스 맨 위에 아래 규칙을 그대로 넣는다.

```text
중요한 충돌 방지 규칙:
1. 이 작업에서 허용된 파일/폴더 밖은 수정하지 마라.
2. 아래 파일은 절대 수정하지 마라.
   - mobile/src/state/useAppStore.ts
   - mobile/src/domain/types.ts
   - mobile/src/app/(tabs)/_layout.tsx
   - mobile/package.json
   - mobile/package-lock.json
3. 위 금지 파일을 수정해야 할 것 같으면, 직접 수정하지 말고 "통합 담당 요청사항"에 필요한 변경 내용을 적어라.
4. 기존 기능인 XP 지급, 간식 획득, 간식 주기, 로컬 저장을 깨지 마라.
5. 작업 마지막에는 변경한 파일 목록을 반드시 보고하라.
6. 가능하면 마지막에 `npm test`와 `npm run typecheck`를 실행하라.
7. 테스트를 실행하지 못하면 이유를 적어라.
```

각 AI는 작업 마지막에 아래 형식으로 보고한다.

```text
작업 요약:
- 

변경한 파일:
- 

수정 금지 파일을 건드렸는가:
- 아니오

통합 담당 요청사항:
- 

실행한 검증:
- 

실행하지 못한 검증과 이유:
- 
```

## AI별 담당 영역

| 담당 | 브랜치 예시 | 역할 | 주로 수정 가능한 파일 |
| --- | --- | --- | --- |
| 통합 담당 | `codex/phase-2-integration` | 공통 타입, store, 라우팅, 최종 병합 | 공유 파일 |
| AI A | `codex/phase-2-supabase-backend` | Supabase 로그인, 친구, 랭킹, 클라우드 저장 | `docs/contracts/`, `mobile/src/services/supabase/`, `mobile/src/services/auth/`, `mobile/src/services/social/` |
| AI B | `codex/phase-2-character-dex` | 캐릭터 도감, 상세 화면, 진화 실루엣 | `mobile/src/domain/characterDex.ts`, `mobile/src/components/characterDex/`, `mobile/src/app/character/` |
| AI C | `codex/phase-2-stage-loop` | 솔로 스테이지, 방치형 진행 로직 | `mobile/src/domain/stages.ts`, `mobile/src/domain/stageProgression.ts`, `mobile/src/components/stage/`, `mobile/src/app/stage/` |
| AI D | `codex/phase-2-premium-ui` | 고급 UI 토큰, 공통 컴포넌트, 화면 질감 | `mobile/src/theme/`, `mobile/src/components/ui/`, `docs/contracts/ui-system-contract.md` |

`useAppStore.ts`, `types.ts`, `_layout.tsx`는 충돌 위험이 크기 때문에 내가 통합 단계에서만 수정하는 것이 좋다.

## 먼저 고정할 공통 계약 문서

작업을 나누기 전에 아래 문서를 먼저 만든다.

- `docs/contracts/backend-api-contract.md`
- `docs/contracts/character-catalog-model.md`
- `docs/contracts/game-progression-model.md`
- `docs/contracts/ui-system-contract.md`

이 문서들은 “각 AI가 어디까지 생각하고 구현해야 하는지”를 맞추기 위한 기준점이다. 실제 공통 타입 파일인 `types.ts`는 통합 담당이 마지막에 반영한다.

## 캐릭터 도감 모델 초안

```ts
type CharacterStage = 'egg' | 'baby' | 'growing' | 'adult';

interface CharacterDexEntry {
  id: CharacterId;
  displayName: string;
  shortBio: string;
  personality: string;
  role: CharacterRole;
  stageDescriptions: Record<CharacterStage, string>;
  evolutionSilhouettes: Record<CharacterStage, 'hidden' | 'visible' | 'unlocked'>;
  unlockHint: string;
  artKey: string;
}
```

도감 UX는 게임에서 흔히 쓰는 방식으로 간다.

- 해금된 캐릭터: 이름, 설명, 현재 진화 단계, 역할, 스킬 공개
- 미해금 캐릭터: 실루엣, `???`, 해금 힌트 일부만 공개
- 아직 도달하지 않은 진화 단계: 형태는 그림자처럼 보이지만 상세 설명은 잠김
- 최종 목표: “다음 모습이 궁금해서 공부하게 되는” 구조

## 스테이지 진행 모델 초안

```ts
interface StageDefinition {
  id: string;
  chapterId: string;
  title: string;
  requiredStudyMinutes: number;
  recommendedPower: number;
  reward: {
    xp: number;
    snacks: number;
    discoveryPoints: number;
  };
}

interface StageProgress {
  currentStageId: string;
  accumulatedMinutes: number;
  clearedStageIds: string[];
  idleRewardClaimedAt?: string;
}
```

초반에는 복잡한 전투를 만들지 않는다.

처음 목표는 단순하다.

1. 공부 세션을 완료한다.
2. 공부 시간이 스테이지 진행도에 더해진다.
3. 요구 시간을 채우면 스테이지가 클리어된다.
4. 보상을 받고 다음 스테이지가 열린다.
5. 가끔 보스 스테이지처럼 특별한 목표를 둔다.

전투력, 속성, 자동 전투는 나중에 확장해도 된다.

## Supabase 백엔드 모델 초안

```ts
interface UserProfile {
  id: string;
  displayName: string;
  createdAt: string;
}

interface FriendSummary {
  userId: string;
  displayName: string;
  weeklyStudyMinutes: number;
  totalXp: number;
  activeCharacterId: CharacterId | null;
}

interface CloudSavePayload {
  appDataVersion: number;
  appData: unknown;
  updatedAt: string;
}
```

Supabase는 아래 기능에 사용한다.

- 로그인
- 유저 프로필
- 클라우드 저장
- 친구 요청
- 친구 수락/삭제
- 친구끼리 주간 공부시간 랭킹
- 친구끼리 총 경험치 랭킹

단, 로그인하지 않아도 앱은 계속 쓸 수 있어야 한다. 지금처럼 로컬 저장이 기본이고, 로그인은 “동기화와 소셜 기능을 여는 선택 기능”으로 둔다.

## 고급 UI 방향

UI는 나중에 한 번에 갈아엎기보다, 지금부터 고급 UI가 들어갈 수 있는 기반을 만들어야 한다.

방향은 다음과 같다.

- 공부앱보다 “수집형 방치 게임” 느낌
- 큰 마케팅 랜딩 페이지처럼 만들지 않기
- 홈, 도감, 스테이지, 랭킹이 하나의 게임 UI처럼 보이게 만들기
- 공통 카드, 진행바, 스탯 칩, 캐릭터 프레임, 섹션 헤더를 재사용
- 베이지/크림 한 가지 톤에 갇히지 않기
- 캐릭터별 포인트 컬러를 살리기
- 텍스트가 모바일 화면에서 잘리지 않게 하기
- 장식용 동그라미/그라데이션 덩어리는 쓰지 않기

먼저 만들 공통 컴포넌트 후보:

- `GameSurface`
- `StatPill`
- `ProgressMeter`
- `CharacterFrame`
- `SectionHeader`
- `IconButton`
- `StageCard`
- `DexEntryCard`

## 단계별 작업 계획

### Phase 2.0: 공통 계약 문서 작성

담당: 통합 담당

작업:

1. `docs/contracts/` 폴더를 만든다.
2. 백엔드, 도감, 스테이지, UI 계약 문서를 만든다.
3. 각 AI에게 “수정 가능한 파일”과 “건드리면 안 되는 파일”을 명확히 전달한다.
4. 현재 `catalog.ts`의 한글 텍스트가 깨져 있으므로, 도감 확장 전에 문구를 정리할지 결정한다.
5. Supabase 키는 나중에 환경변수로 넣고, 실제 키는 커밋하지 않는다고 명시한다.

완료 기준:

- 각 AI가 같은 파일을 동시에 수정하지 않아도 된다.
- 각 AI가 자기 작업을 독립적으로 시작할 수 있다.

### Phase 2.1: 고급 UI 기반 만들기

담당: AI D

작업:

1. `mobile/src/theme/tokens.ts`를 확장한다.
2. 공통 UI 컴포넌트를 만든다.
3. UI 사용 규칙을 `docs/contracts/ui-system-contract.md`에 적는다.
4. 기존 화면 전체를 대대적으로 고치지는 않는다.
5. 다른 AI들이 가져다 쓸 수 있는 기반만 만든다.

완료 기준:

- 기존 화면이 깨지지 않는다.
- `npm test`, `npm run typecheck`가 통과한다.
- 도감/스테이지 작업자가 재사용할 컴포넌트가 있다.

### Phase 2.2: 솔로 스테이지 루프 만들기

담당: AI C

작업:

1. 스테이지 정의 파일을 만든다.
2. 공부 시간이 스테이지 진행도로 바뀌는 순수 함수를 만든다.
3. 스테이지 클리어와 보상 계산 테스트를 작성한다.
4. 간단한 스테이지 카드 컴포넌트를 만든다.
5. `useAppStore.ts`에는 직접 연결하지 않고, 통합 담당에게 연결 방법을 문서로 남긴다.

완료 기준:

- 백엔드 없이도 스테이지 진행 로직이 테스트된다.
- 기존 공부 보상 로직을 깨지 않는다.

### Phase 2.3: 캐릭터 도감 업그레이드

담당: AI B

작업:

1. 캐릭터별 상세 설명 데이터를 추가한다.
2. 도감 상세 화면을 만든다.
3. 해금/미해금/미래 진화 단계 표시 방식을 구현한다.
4. 현재 단계 이후는 실루엣이나 잠금 상태로 보여준다.
5. AI D가 만든 UI 컴포넌트가 있으면 재사용한다.

완료 기준:

- 도감에서 캐릭터를 눌러 상세 화면으로 갈 수 있다.
- 미해금 캐릭터와 미래 진화 단계가 게임식으로 숨겨진다.
- store 변경 없이 기존 캐릭터 상태를 읽어서 표현한다.

### Phase 2.4: Supabase 백엔드/소셜 레이어

담당: AI A

작업:

1. Supabase 테이블 구조를 설계한다.
2. 필요한 SQL 또는 migration 문서를 만든다.
3. 모바일 서비스 모듈을 만든다.
4. 로그인하지 않아도 앱이 실행되게 만든다.
5. 친구 요청/수락/친구 랭킹 서비스 함수를 만든다.

완료 기준:

- 실제 Supabase 키 없이도 앱이 깨지지 않는다.
- 서비스 함수는 타입이 있고 테스트 가능하다.
- UI보다 서비스/계약이 먼저 완성된다.

### Phase 2.5: 통합

담당: 통합 담당

작업:

1. 각 AI의 변경 파일을 검토한다.
2. 필요한 공통 타입만 `mobile/src/domain/types.ts`에 반영한다.
3. 스테이지 진행을 `completeSession` 흐름에 연결한다.
4. 캐릭터 상세 화면을 라우팅에 연결한다.
5. Supabase 로그인/동기화는 선택 기능으로 연결한다.
6. 친구 랭킹 화면은 서비스가 안정된 뒤 붙인다.
7. 전체 테스트를 실행한다.

검증 명령:

```powershell
npm test
npm run typecheck
npm run web
```

완료 기준:

- 로그인하지 않아도 기존 로컬 공부 루프가 그대로 작동한다.
- 로그인하면 클라우드 저장과 친구 랭킹을 사용할 수 있다.
- 홈, 도감, 스테이지, 랭킹 화면의 UI 톤이 어긋나지 않는다.

## AI에게 입력할 하네스 프롬프트

아래 내용을 각 AI 코딩 도구에 그대로 붙여넣으면 된다.

### AI A용: Supabase 백엔드/소셜 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 Supabase 백엔드/소셜 레이어를 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

목표:
로그인, 클라우드 저장, 친구 추가, 친구 랭킹을 위한 Supabase 서비스 기반을 만든다.

먼저 읽을 파일:
- docs/roadmap/phase-2-parallel-ai-plan.md
- mobile/src/domain/types.ts
- mobile/src/state/useAppStore.ts
- mobile/package.json

수정 가능한 파일:
- docs/contracts/backend-api-contract.md
- docs/supabase/
- mobile/src/services/supabase/
- mobile/src/services/auth/
- mobile/src/services/social/
- mobile/src/__tests__/supabase*.test.ts
- mobile/src/__tests__/auth*.test.ts
- mobile/src/__tests__/social*.test.ts

수정 금지 파일:
- mobile/src/state/useAppStore.ts
- mobile/src/domain/types.ts
- mobile/src/app/(tabs)/_layout.tsx
- package 버전
- mobile/package.json
- mobile/package-lock.json
- mobile/src/app/ 화면 파일 전체

요구사항:
1. profiles, cloud_saves, friend_requests, friendships, weekly_ranking_snapshots 테이블을 설계한다.
2. typed service 함수를 만든다.
3. Supabase 환경변수가 없어도 앱이 깨지지 않게 한다.
4. 실제 Supabase 키는 절대 커밋하지 않는다.
5. 서비스 함수는 테스트 가능하게 만든다.
6. 화면 UI는 최소화하거나 만들지 않는다. 서비스 레이어가 먼저다.

작업 후 보고할 것:
- 변경한 파일 목록
- 수정 금지 파일을 건드렸는지 여부
- 제안하는 공통 타입
- 실행한 테스트 명령과 결과
- 통합 담당자가 `useAppStore.ts`에 연결해야 할 내용
```

### AI B용: 캐릭터 도감/진화 실루엣 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 캐릭터 도감과 진화 실루엣 UI를 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

목표:
도감에서 캐릭터를 누르면 설명, 현재 진화 단계, 미래 진화 실루엣, 역할/스킬, 해금 힌트를 보여준다.

먼저 읽을 파일:
- docs/roadmap/phase-2-parallel-ai-plan.md
- docs/contracts/character-catalog-model.md
- mobile/src/domain/catalog.ts
- mobile/src/domain/types.ts
- mobile/src/app/(tabs)/collection.tsx
- mobile/src/components/CharacterCard.tsx

수정 가능한 파일:
- mobile/src/domain/characterDex.ts
- mobile/src/components/characterDex/
- mobile/src/app/character/
- mobile/src/__tests__/characterDex*.test.ts
- mobile/src/__tests__/collection*.test.tsx
- docs/contracts/character-catalog-model.md

수정 금지 파일:
- mobile/src/state/useAppStore.ts
- mobile/src/domain/types.ts
- mobile/src/app/(tabs)/_layout.tsx
- mobile/src/domain/catalog.ts
- mobile/src/theme/
- mobile/src/components/ui/
- Supabase/auth/social 관련 파일

요구사항:
1. 기존 8개 캐릭터 ID는 바꾸지 않는다.
2. 현재 catalog import가 깨지지 않게 별도 dex metadata를 추가한다.
3. 해금된 캐릭터는 상세 설명을 보여준다.
4. 미해금 캐릭터와 미래 진화 단계는 실루엣/잠금 상태로 보여준다.
5. 현재 한글 텍스트가 깨져 있으면, 조용히 추측해서 고치지 말고 교체 문구안을 보고한다.
6. UI 공통 컴포넌트가 있으면 재사용한다.
7. `collection.tsx`를 직접 크게 고치지 말고, 새 상세 화면과 새 컴포넌트 중심으로 작업한다. 탭/라우팅 연결은 통합 담당에게 맡긴다.

작업 후 보고할 것:
- 변경한 파일 목록
- 수정 금지 파일을 건드렸는지 여부
- 추가한 화면/라우트
- 제안하는 공통 타입
- 실행한 테스트 명령과 결과
- 통합 담당자가 라우팅에 연결해야 할 내용
```

### AI C용: 솔로 스테이지/방치형 진행 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 솔로 스테이지/방치형 진행 로직을 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

목표:
공부 세션을 완료하면 스테이지 진행도가 오르고, 조건을 채우면 스테이지를 클리어하고 보상을 받는 구조를 만든다.

먼저 읽을 파일:
- docs/roadmap/phase-2-parallel-ai-plan.md
- docs/contracts/game-progression-model.md
- mobile/src/domain/rewards.ts
- mobile/src/domain/progression.ts
- mobile/src/state/useAppStore.ts
- mobile/src/domain/types.ts

수정 가능한 파일:
- mobile/src/domain/stages.ts
- mobile/src/domain/stageProgression.ts
- mobile/src/components/stage/
- mobile/src/app/stage/
- mobile/src/__tests__/stages*.test.ts
- mobile/src/__tests__/stageProgression*.test.ts
- docs/contracts/game-progression-model.md

수정 금지 파일:
- mobile/src/state/useAppStore.ts
- mobile/src/domain/types.ts
- mobile/src/app/(tabs)/_layout.tsx
- mobile/src/domain/rewards.ts
- mobile/src/domain/progression.ts
- mobile/src/theme/
- mobile/src/components/ui/
- Supabase/auth/social 관련 파일

요구사항:
1. 스테이지 계산은 순수 함수로 만든다.
2. 공부 시간이 스테이지 진행도에 반영되게 한다.
3. 스테이지마다 요구 공부 시간과 보상이 있어야 한다.
4. 복잡한 전투는 아직 만들지 않는다.
5. 결정적이고 테스트 가능한 구조로 만든다.
6. `completeSession`에 어떻게 연결해야 하는지 통합 메모를 남긴다.

작업 후 보고할 것:
- 변경한 파일 목록
- 수정 금지 파일을 건드렸는지 여부
- 스테이지 데이터 모델
- 실행한 테스트 명령과 결과
- 통합 담당자가 `useAppStore.ts`에 연결해야 할 내용
```

### AI D용: 고급 UI 기반 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 고급 UI 기반을 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

목표:
수집형 방치 게임처럼 보이는 고급 UI 토큰과 공통 컴포넌트를 만든다. 단, 모든 화면을 지금 한 번에 갈아엎지는 않는다.

먼저 읽을 파일:
- docs/roadmap/phase-2-parallel-ai-plan.md
- mobile/src/theme/tokens.ts
- mobile/src/components/PrimaryButton.tsx
- mobile/src/components/CharacterCard.tsx
- mobile/src/app/(tabs)/index.tsx
- mobile/src/app/(tabs)/collection.tsx

수정 가능한 파일:
- mobile/src/theme/
- mobile/src/components/ui/
- mobile/src/__tests__/components*.test.tsx
- docs/contracts/ui-system-contract.md

수정 금지 파일:
- mobile/src/state/useAppStore.ts
- mobile/src/domain/types.ts
- mobile/src/domain/catalog.ts
- mobile/src/components/characterDex/
- mobile/src/components/stage/
- mobile/src/app/
- Supabase/auth/social 관련 파일

디자인 방향:
- 공부앱보다는 수집형 방치 게임 느낌
- 마케팅 페이지처럼 큰 hero 화면 만들지 않기
- 작고 밀도 있는 게임 패널, 진행바, 스탯 칩, 캐릭터 프레임
- 베이지/크림 한 가지 톤에 갇히지 않기
- 캐릭터별 포인트 컬러를 살릴 수 있게 하기
- 장식용 동그라미/그라데이션 덩어리 쓰지 않기
- 모바일에서 텍스트가 잘리지 않게 하기

요구사항:
1. 기존 import가 깨지지 않게 tokens를 확장한다.
2. 안정적인 props를 가진 공통 컴포넌트를 만든다.
3. 기존 화면 전체 리디자인은 하지 않는다.
4. 가능한 경우 컴포넌트 테스트를 추가한다.
5. 다른 AI들이 컴포넌트를 어떻게 써야 하는지 문서화한다.

작업 후 보고할 것:
- 변경한 파일 목록
- 수정 금지 파일을 건드렸는지 여부
- 만든 컴포넌트와 props
- 실행한 테스트 명령과 결과
- 도감/스테이지 담당 AI가 재사용해야 할 컴포넌트
```

### 통합 담당용 하네스

```text
너는 Phase 2 통합 담당이다.

목표:
AI A, AI B, AI C, AI D의 결과물을 합치되, 기존 로컬 공부 루프를 절대 깨지 않게 한다.

먼저 읽을 파일:
- docs/roadmap/phase-2-parallel-ai-plan.md
- 각 AI의 작업 요약
- 각 AI의 변경 파일
- mobile/src/state/useAppStore.ts
- mobile/src/domain/types.ts
- mobile/src/app/(tabs)/_layout.tsx

규칙:
1. 기존 XP, 간식, 간식 주기, 로컬 저장 기능을 유지한다.
2. 한 번에 한 AI 결과물만 통합한다.
3. 통합할 때마다 테스트를 실행한다.
4. 공통 타입 변경은 `mobile/src/domain/types.ts`에 정리한다.
5. store 변경은 `mobile/src/state/useAppStore.ts`에 정리한다.
6. Supabase는 선택 기능이어야 한다. 로그인하지 않아도 앱은 작동해야 한다.

검증:
- npm test
- npm run typecheck
- npm run web
- 모바일 크기 화면에서 수동 확인

작업 후 보고할 것:
- 어떤 AI 결과물을 통합했는지
- 충돌이 있었는지
- 충돌을 어떻게 해결했는지
- 남은 QA 체크리스트
```

## UI 업그레이드는 언제 하는 게 좋은가

결론: **지금부터 기반은 만들고, 최종 polish는 나중에 한다.**

이유:

- 지금 UI 규칙을 안 잡으면 AI마다 화면 스타일이 달라진다.
- 반대로 지금 모든 화면을 완성도 높게 꾸미면 기능이 바뀔 때 다시 고쳐야 한다.

따라서 이렇게 나눈다.

1. 지금: 토큰, 공통 컴포넌트, 캐릭터 프레임, 진행바 기반 만들기
2. 기능 개발 중: 도감/스테이지 화면은 공통 컴포넌트를 사용하게 하기
3. 통합 후: 실제 화면 구성, 애니메이션, 캐릭터 아트, 빈 상태, 랭킹 화면 polish

## Supabase 사용 원칙

Supabase는 소셜 기능과 클라우드 저장을 위해 사용한다.

하지만 앱의 기본은 로컬 우선이다.

- 로그인하지 않아도 공부 가능
- 로그인하지 않아도 경험치/간식/캐릭터 성장 가능
- 로그인하면 클라우드 저장과 친구 기능 사용 가능
- 로그인 시 로컬 데이터를 바로 덮어쓰지 않고, 업로드/병합 선택을 둔다
- 동기화 실패가 공부 타이머나 보상 지급을 막으면 안 된다

## 주요 위험과 대응

1. **store 충돌**
   - 대응: `useAppStore.ts`는 통합 담당만 수정

2. **공통 타입 충돌**
   - 대응: 기능 AI는 타입 제안만 하고, `types.ts` 반영은 통합 담당이 한다

3. **UI 톤 불일치**
   - 대응: AI D가 먼저 UI 토큰과 공통 컴포넌트를 만든다

4. **백엔드 때문에 로컬 기능이 깨짐**
   - 대응: Supabase는 선택 기능으로 만들고, 로그인 전에는 로컬 저장 유지

5. **전투/스테이지를 너무 복잡하게 만듦**
   - 대응: 2단계에서는 공부 시간 기반의 결정적 스테이지 진행만 만든다

6. **깨진 한글 텍스트**
   - 대응: 도감 확장 전에 캐릭터 이름/설명 문구를 정리한다

## 바로 다음에 할 일

추천 순서:

1. 통합 담당이 `docs/contracts/*.md` 4개를 만든다.
2. AI D가 고급 UI 기반을 먼저 만든다.
3. AI C가 스테이지 진행 순수 로직을 만든다.
4. AI B가 도감 상세/진화 실루엣을 만든다.
5. AI A가 Supabase schema/service 레이어를 만든다.
6. 내가 하나씩 받아서 통합한다.
