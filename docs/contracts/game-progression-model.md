# 스테이지 진행 계약

## 목표

공부 시간이 개인 레이드 보스에게 주는 피해로 변환되는 순수 로직을 만든다. 2단계에서는 복잡한 전투, 속성 상성, 자동 전투를 만들지 않는다. 사용자가 공부를 끝내면 보스 HP가 깎이고, 요구 HP를 모두 깎으면 보스가 클리어되며 보상을 받는 구조만 고정한다.

## 파일 경계

- 레이드 보스 정의: `mobile/src/domain/stages.ts`
- 진행 계산: `mobile/src/domain/stageProgression.ts`
- 스테이지 UI: `mobile/src/components/stage/`
- 독립 화면: `mobile/src/app/stage/`

`useAppStore.ts`, `types.ts`, `rewards.ts`, `progression.ts`는 C 작업에서 수정하지 않는다. 통합 단계에서 필요한 변경만 반영한다.

## 데이터 모델

```ts
interface StageDefinition {
  id: string;
  chapterId: string;
  title: string;
  description: string;
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

## 계산 규칙

1. 완료한 공부 시간이 현재 보스에게 주는 피해로 환산된다.
2. `accumulatedMinutes >= requiredStudyMinutes`가 되면 현재 보스가 클리어된다.
3. 초과 피해는 다음 보스에게 이월된다.
4. 긴 공부 세션은 여러 보스를 한 번에 클리어할 수 있다.
5. 잘못된 시간 값은 무시한다.
6. 마지막 스테이지 이후의 추가 시간은 마지막 스테이지 요구치까지만 유지한다.

## 통합 요청사항

통합 단계에서 `AppData`에 아래 상태를 추가하는 것을 권장한다.

```ts
stageProgress: StageProgress;
```

`completeSession`에서 보상 계산이 끝난 뒤 아래 흐름을 추가한다.

```ts
const stageResult = applyStudyMinutesToStageProgress(data.stageProgress, session.durationMinutes);
```

그 뒤 `stageResult.progress`를 저장하고, `stageResult.reward`를 기존 보상에 더할지 별도 스테이지 보상으로 보여줄지 결정한다.

초기 상태에는 아래 값을 넣는다.

```ts
stageProgress: createInitialStageProgress()
```
