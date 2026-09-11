# App Flow Harness

백엔드 연결 전 화면·이동·상태를 실제 앱처럼 탐색하기 위한 프런트엔드 하네스다.

- 런타임 코드: `apps/web/features/app-flow/`
- mock state: `app-flow-provider.tsx`, `mock-data.ts`
- 화면 조합: `flow-screen.tsx`
- 페이지 계약: `pages/`

기획안이나 Figma가 전달되면 먼저 해당 화면 계약을 갱신하고, 공통 UI는 `packages/ui`에 추출한다. 이 폴더는 API 명세나 실제 서버 상태를 대체하지 않는다.
