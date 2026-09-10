<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## UI component conventions

- 모바일 뷰를 기본으로 구현하며, `packages/ui/src/tokens/foundations.ts`와 `packages/ui/src/styles/globals.css`의 원시 토큰을 사용한다.
- Figma의 375px은 디자인 기준값이다. 모바일 화면에서는 앱 컨테이너를 기기 너비(`width: 100%`)로 쓰고, 데스크톱 뷰포트에서만 가운데 정렬된 375px 앱 프레임을 적용한다. 공통 레이아웃에는 `layout-mobile` 유틸리티를 사용한다.
- Figma 구현은 절대 위치와 임의 margin으로 좌표를 맞추지 않는다. 문서 흐름을 유지하고 `flex`/`grid`, `gap`, 컨테이너 `padding`과 토큰 기반 크기를 우선 사용한다. 겹침·배지처럼 구조상 필요한 경우에만 절대 위치를 사용한다.
- 공용 UI 컴포넌트는 `packages/ui/src/components`에 둔다. shadcn 방식의 `class-variance-authority` variant와 `cn` 유틸리티로 상태·크기 변형을 제공한다.
- 새 공용 컴포넌트와 모든 variant는 `apps/storybook`에서 확인 가능하도록 스토리를 작성한다.

## Quality gates and commits

- 사용자가 `main에 푸시`, `main push`, `main 푸시`를 요청하면 `.codex/skills/main-push-verify/SKILL.md`를 따른다. 테스트·빌드·대상 브랜치·최종 diff를 확인하고, 검증 실패 시 푸시하지 않는다.
- 변경은 하나의 의도와 되돌릴 수 있는 단위로 나눈다. 기능, 리팩터링, 테스트·도구 설정, 생성 산출물을 같은 커밋에 섞지 않는다.
- 단위 테스트는 Vitest(`pnpm test:unit`), 브라우저 흐름은 Playwright(`pnpm test:e2e`)로 실행한다. 새 동작에는 해당하는 테스트를 추가한다.

## Frontend integrations

- 라이브러리·프레임워크·SDK·API·CLI·클라우드 서비스의 사용법, 설정 또는 최신 문서가 필요한 경우 Context7 MCP로 공식 문서를 먼저 확인한다.
- Figma 디자인 링크 또는 디자인 구현·동기화 요청이 있으면 Figma MCP를 사용한다.
