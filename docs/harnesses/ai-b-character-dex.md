# AI B 하네스: 캐릭터 도감/진화 실루엣 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 캐릭터 도감과 진화 실루엣 UI를 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

중요한 충돌 방지 규칙:
1. 이 작업에서 허용된 파일/폴더 밖은 수정하지 마라.
2. 아래 파일은 절대 수정하지 마라.
   - mobile/src/state/useAppStore.ts
   - mobile/src/domain/types.ts
   - mobile/src/app/(tabs)/_layout.tsx
   - mobile/src/domain/catalog.ts
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

요구사항:
1. 기존 8개 캐릭터 ID는 바꾸지 않는다.
2. 현재 catalog import가 깨지지 않게 별도 dex metadata를 추가한다.
3. 해금된 캐릭터는 상세 설명을 보여준다.
4. 미해금 캐릭터와 미래 진화 단계는 실루엣/잠금 상태로 보여준다.
5. 현재 한글 텍스트가 깨져 있으면, 조용히 추측해서 고치지 말고 교체 문구안을 보고한다.
6. UI 공통 컴포넌트가 있으면 재사용하되, `mobile/src/components/ui/`는 수정하지 않는다.
7. `collection.tsx`는 직접 크게 고치지 말고, 새 상세 화면과 새 컴포넌트 중심으로 작업한다. 탭/라우팅 연결은 통합 담당에게 맡긴다.

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

