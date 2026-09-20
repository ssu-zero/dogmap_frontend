# App Flow Harness

화면·이동·상태를 실제 앱처럼 탐색하고, 서버 미지원 분기를 명시적으로
데모하는 프런트엔드 하네스다. 서버 계약이 존재하는 로그인, 반려견,
코스 기능은 하네스 mock보다 실제 API를 우선한다.

- 런타임 코드: `apps/web/features/app-flow/`
- live API adapter: `api-mappers.ts`, `apps/web/api/`, `apps/web/query/`
- demo-only state: `app-flow-provider.tsx`, `mock-data.ts`
- 화면 조합: `flow-screen.tsx`
- 페이지 계약: `pages/`

주요 화면 계약:

- `pages/auth.md`
- `pages/home.md`
- `pages/courses.md`
- `pages/community.md`
- `pages/profile-and-errors.md`

기획안이나 Figma가 전달되면 먼저 해당 화면 계약을 갱신하고, 공통 UI는
`packages/ui`에 추출한다. 이 폴더는 API 명세나 실제 서버 상태를 대체하지
않으며, API가 있는 기능을 mock으로 우회해서는 안 된다.
