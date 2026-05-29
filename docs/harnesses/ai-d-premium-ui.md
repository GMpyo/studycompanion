# AI D 하네스: 고급 UI 기반 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 고급 UI 기반을 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

중요한 충돌 방지 규칙:
1. 이 작업에서 허용된 파일/폴더 밖은 수정하지 마라.
2. 아래 파일은 절대 수정하지 마라.
   - mobile/src/state/useAppStore.ts
   - mobile/src/domain/types.ts
   - mobile/src/domain/catalog.ts
   - mobile/src/app/
   - mobile/src/components/characterDex/
   - mobile/src/components/stage/
   - mobile/package.json
   - mobile/package-lock.json
3. 위 금지 파일을 수정해야 할 것 같으면, 직접 수정하지 말고 "통합 담당 요청사항"에 필요한 변경 내용을 적어라.
4. 기존 기능인 XP 지급, 간식 획득, 간식 주기, 로컬 저장을 깨지 마라.
5. 작업 마지막에는 변경한 파일 목록을 반드시 보고하라.
6. 가능하면 마지막에 `npm test`와 `npm run typecheck`를 실행하라.
7. 테스트를 실행하지 못하면 이유를 적어라.

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
6. `CharacterFrame`도 만들려면 `mobile/src/components/ui/CharacterFrame.tsx`에 만든다.

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

