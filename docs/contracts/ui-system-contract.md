# UI 시스템 계약

## 목표

2단계 UI는 공부앱의 기본 사용성을 유지하면서, 수집형 방치 게임처럼 더 밀도 있고 고급스럽게 보이도록 만든다. 기능 담당 AI는 화면마다 스타일을 새로 만들기보다 `mobile/src/components/ui/`의 공통 컴포넌트와 `mobile/src/theme/tokens.ts`의 토큰을 우선 사용한다.

## 사용 원칙

- 큰 랜딩 페이지나 hero 화면을 만들지 않는다.
- 화면은 홈, 도감, 스테이지, 랭킹을 빠르게 오갈 수 있는 앱 구조를 유지한다.
- 카드 안에 카드를 중첩하지 않는다.
- 장식용 그라데이션 덩어리나 원형 배경 장식은 쓰지 않는다.
- 모바일에서 긴 텍스트가 버튼이나 패널 밖으로 넘치지 않게 한다.
- 캐릭터별 색은 포인트로 쓰고, 화면 전체를 한 캐릭터 색으로 덮지 않는다.

## 토큰

- `colors.panel`: 주요 게임 패널 배경
- `colors.panelMuted`: 진행바 트랙, 보조 칩 배경
- `colors.panelBorder`: 패널 경계선
- `colors.inkStrong`: 중요한 제목/수치
- `colors.study`, `colors.studySoft`: 공부 진행, 스테이지 진행
- `colors.reward`, `colors.rewardSoft`: 보상, 획득 표시
- `shadows.soft`: 기본 패널 그림자
- `shadows.raised`: 강조 패널 그림자

## 공통 컴포넌트

### `GameSurface`

게임 UI의 기본 패널이다. 도감 상세, 스테이지 카드, 랭킹 요약처럼 하나의 정보 묶음을 보여줄 때 사용한다.

### `SectionHeader`

섹션 제목과 짧은 보조 라벨을 보여준다. 화면 설명 문장을 길게 넣지 말고, 제목과 상태 정보 중심으로 사용한다.

### `StatPill`

짧은 수치 정보를 보여준다. 예: `공부 45분`, `간식 3개`, `진행 75%`.

### `ProgressMeter`

스테이지 진행도, 진화 조건 진행도처럼 숫자 기반 진행률을 보여준다.

### `IconButton`

좁은 영역에서 쓰는 아이콘 버튼이다. 반드시 접근성용 `label`을 넣는다.

## 다른 AI 작업자가 지켜야 할 것

- 도감 담당은 `mobile/src/components/characterDex/`에 도감 전용 컴포넌트를 만든다.
- 스테이지 담당은 `mobile/src/components/stage/`에 스테이지 전용 컴포넌트를 만든다.
- 공통 컴포넌트가 부족하면 직접 `mobile/src/components/ui/`를 수정하지 말고 통합 담당 요청사항에 적는다.
- `useAppStore.ts`, `types.ts`, `_layout.tsx`는 직접 수정하지 않는다.
