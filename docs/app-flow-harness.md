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
- [ ] Final Figma frame-by-frame visual audit and full verification suite
