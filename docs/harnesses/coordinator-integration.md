# 통합 담당 하네스

```text
너는 Phase 2 통합 담당이다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

목표:
AI A, AI B, AI C, AI D의 결과물을 합치되, 기존 로컬 공부 루프를 절대 깨지 않게 한다.

먼저 읽을 파일:
- docs/roadmap/phase-2-parallel-ai-plan.md
- 각 AI의 작업 요약
- 각 AI의 변경 파일
- mobile/src/state/useAppStore.ts
- mobile/src/domain/types.ts
- mobile/src/app/(tabs)/_layout.tsx

통합 규칙:
1. 기존 XP, 간식, 간식 주기, 로컬 저장 기능을 유지한다.
2. 한 번에 한 AI 결과물만 통합한다.
3. 통합할 때마다 테스트를 실행한다.
4. 공통 타입 변경은 `mobile/src/domain/types.ts`에 정리한다.
5. store 변경은 `mobile/src/state/useAppStore.ts`에 정리한다.
6. Supabase는 선택 기능이어야 한다. 로그인하지 않아도 앱은 작동해야 한다.
7. AI가 수정 금지 파일을 건드렸다면, 그 변경은 그대로 믿지 말고 필요한 부분만 수동 반영한다.

추천 통합 순서:
1. AI D: UI 토큰/공통 컴포넌트
2. AI C: 스테이지 순수 로직
3. AI B: 도감 상세/실루엣
4. AI A: Supabase 서비스
5. store/라우팅 연결

검증:
- npm test
- npm run typecheck
- npm run web
- 모바일 크기 화면에서 수동 확인

작업 후 보고할 것:
- 어떤 AI 결과물을 통합했는지
- 충돌이 있었는지
- 충돌을 어떻게 해결했는지
- 기존 로컬 루프가 유지되는지
- 남은 QA 체크리스트
```

