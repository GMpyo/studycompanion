# AI C 하네스: 솔로 스테이지/방치형 진행 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 솔로 스테이지/방치형 진행 로직을 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

중요한 충돌 방지 규칙:
1. 이 작업에서 허용된 파일/폴더 밖은 수정하지 마라.
2. 아래 파일은 절대 수정하지 마라.
   - mobile/src/state/useAppStore.ts
   - mobile/src/domain/types.ts
   - mobile/src/app/(tabs)/_layout.tsx
   - mobile/src/domain/rewards.ts
   - mobile/src/domain/progression.ts
   - mobile/src/theme/
   - mobile/src/components/ui/
   - mobile/package.json
   - mobile/package-lock.json
3. 위 금지 파일을 수정해야 할 것 같으면, 직접 수정하지 말고 "통합 담당 요청사항"에 필요한 변경 내용을 적어라.
4. 기존 기능인 XP 지급, 간식 획득, 간식 주기, 로컬 저장을 깨지 마라.
5. 작업 마지막에는 변경한 파일 목록을 반드시 보고하라.
6. 가능하면 마지막에 `npm test`와 `npm run typecheck`를 실행하라.
7. 테스트를 실행하지 못하면 이유를 적어라.

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

요구사항:
1. 스테이지 계산은 순수 함수로 만든다.
2. 공부 시간이 스테이지 진행도에 반영되게 한다.
3. 스테이지마다 요구 공부 시간과 보상이 있어야 한다.
4. 복잡한 전투는 아직 만들지 않는다.
5. 결정적이고 테스트 가능한 구조로 만든다.
6. `completeSession`에 어떻게 연결해야 하는지 통합 메모를 남긴다.

작업 후 아래 형식으로 보고하라.

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

