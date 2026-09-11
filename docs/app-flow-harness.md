# App Flow Harness

## Source of truth

1. Figma Harness defines routes, states, ownership branches and user actions.
2. Figma UI defines the visual treatment for each corresponding screen.
3. Existing project tokens and reusable UI components define implementation conventions.

## Continuous completion loop

Creating or updating a PR is a checkpoint, never a completion condition. Continue without waiting for user confirmation until every audited Harness node has a working route, state transition and test coverage.

For each remaining node:

1. Inspect the exact Harness and UI Figma frame.
2. Compare it with the current route, interaction and empty/error/ownership state.
3. Implement the gap with shared components and centralized mock state.
4. Add or update Vitest state coverage and Playwright user-flow coverage.
5. Run typecheck and relevant tests. At feature checkpoints also run lint and build.
6. Commit and push the checkpoint, then immediately start the next audit item.

## Audit checklist

- [x] Entry, terms, onboarding, location prompt and home
- [x] Course empty/list/generation/loading/detail/edge result/map spot interaction
- [x] Course request inputs: date, start/end time, start location and visit themes
- [x] Community ownership and save-to-my-course flow
- [x] Archive footprint list, persisted course diary entry and activity report flow
- [x] My page, edit, reusable terms, error and 404
- [x] Final Figma frame-by-frame visual audit and full verification suite

## Figma node coverage

| Flow | Figma nodes | Implemented routes/states |
| --- | --- | --- |
| Entry and onboarding | `54:235`, `56:260`, `29:131`, `54:167` | `/login`, `/terms`, `/terms/[slug]`, `/onboarding/1`, `/onboarding/2` |
| Home and location permission | `65:541`, `74:565`, `141:93`, `143:213`, `180:207` | `/`, permission prompt, course/community entry actions |
| Course | `74:643`, `74:667`, `74:728`, `288:446`, `305:492`, `74:812`, `74:872`, `241:1180` | `/courses`, `/courses/new`, `/courses/generating`, `/courses/[courseId]`, validation, edge result and spot detail |
| Community | `225:457`, `241:774`, `241:1061`, `241:1109` | `/community`, `/community/[courseId]`, size filter, ownership and save states |
| Archive and report | `205:235`, `205:208`, `214:905`, `205:97`, `205:144`, `241:334` | `/archive`, `/archive/[courseId]`, persisted diary and `/report` |
| My and recovery | `95:338`, `397:528`, `242:1455`, `78:899`, `78:913` | `/mypage`, `/mypage/edit`, reusable terms, 404 and error recovery |
