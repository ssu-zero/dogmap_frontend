# Dogmap Frontend

Dogmap 프론트엔드 pnpm/Turborepo 모노레포입니다.

## 기술 스택

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui (`packages/ui`)
- TanStack Query, ky, Zod
- pnpm workspace, Turborepo

## 시작하기

```bash
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

The web app calls the FastAPI server directly at `https://api.dogmap.store/`.
For local development, configure the backend CORS allowlist with the local web
origin. For Kakao login, set the public REST API key and make the redirect URI
registered in Kakao identical to the callback opened by the web app.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add [component] -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```
