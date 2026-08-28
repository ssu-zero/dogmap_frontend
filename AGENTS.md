<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## UI component conventions

- 모바일 뷰를 기본으로 구현하며, `packages/ui/src/tokens/foundations.ts`와 `packages/ui/src/styles/globals.css`의 원시 토큰을 사용한다.
- 공용 UI 컴포넌트는 `packages/ui/src/components`에 둔다. shadcn 방식의 `class-variance-authority` variant와 `cn` 유틸리티로 상태·크기 변형을 제공한다.
- 새 공용 컴포넌트와 모든 variant는 `apps/storybook`에서 확인 가능하도록 스토리를 작성한다.

## Frontend integrations

- 라이브러리·프레임워크·SDK·API·CLI·클라우드 서비스의 사용법, 설정 또는 최신 문서가 필요한 경우 Context7 MCP로 공식 문서를 먼저 확인한다.
- Figma 디자인 링크 또는 디자인 구현·동기화 요청이 있으면 Figma MCP를 사용한다.
