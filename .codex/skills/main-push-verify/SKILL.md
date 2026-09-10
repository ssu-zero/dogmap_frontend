---
name: main-push-verify
description: Verify Dogmap frontend changes before a user-requested push to main, including tests, build, commit scope, and final diff review.
---

# Main push verification

Use this skill only when the user asks to push or merge work to `main` (including “main push” and “main 푸시”). Work only in `dogmap_frontend`.

Before pushing, fetch `origin`, identify the exact commits intended for `main`, and inspect both `git status` and the diff against `origin/main`. Confirm commits are each one coherent intent; split mixed feature, refactor, tooling/test, and generated-output changes before proceeding.

Run these gates from the frontend root:

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
pnpm build
```

Review the final staged and branch diff after the gates. Check that changed UI follows the mobile layout contract: actual phone width is 100%, desktop uses a centered 375px frame, and flow uses flex/grid with gap and padding rather than margin-based coordinates.

Do not push if a required gate fails, uncommitted changes are unrelated, the target is not confirmed as `main`, or the final diff contains unintended changes. Report the failed command and the relevant output, then wait for direction. Push only after every gate passes and the user has requested the push.
