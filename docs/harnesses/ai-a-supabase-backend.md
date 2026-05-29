# AI A 하네스: Supabase 백엔드/소셜 담당

```text
너는 Expo React Native 공부 캐릭터 앱의 Supabase 백엔드/소셜 레이어를 담당한다.

프로젝트 경로:
C:\Users\PC\Documents\공부시간어플

중요한 충돌 방지 규칙:
1. 이 작업에서 허용된 파일/폴더 밖은 수정하지 마라.
2. 아래 파일은 절대 수정하지 마라.
   - mobile/src/state/useAppStore.ts
   - mobile/src/domain/types.ts
   - mobile/src/app/(tabs)/_layout.tsx
   - mobile/package.json
   - mobile/package-lock.json
   - mobile/src/app/ 화면 파일 전체
3. 위 금지 파일을 수정해야 할 것 같으면, 직접 수정하지 말고 "통합 담당 요청사항"에 필요한 변경 내용을 적어라.
4. 기존 기능인 XP 지급, 간식 획득, 간식 주기, 로컬 저장을 깨지 마라.
5. 작업 마지막에는 변경한 파일 목록을 반드시 보고하라.
6. 가능하면 마지막에 `npm test`와 `npm run typecheck`를 실행하라.
7. 테스트를 실행하지 못하면 이유를 적어라.

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

요구사항:
1. profiles, cloud_saves, friend_requests, friendships, weekly_ranking_snapshots 테이블을 설계한다.
2. typed service 함수를 만든다.
3. Supabase 환경변수가 없어도 앱이 깨지지 않게 한다.
4. 실제 Supabase 키는 절대 커밋하지 않는다.
5. 서비스 함수는 테스트 가능하게 만든다.
6. 화면 UI는 만들지 않는다. 서비스 레이어와 문서가 먼저다.
7. 새 패키지가 필요하면 직접 설치하지 말고 통합 담당 요청사항에 적어라.

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

