# App Flow Harness

## Source of truth

1. Figma Harness defines routes, states, ownership branches and user actions.
2. Figma UI defines the visual treatment for each corresponding screen.
3. Existing project tokens and reusable UI components define implementation conventions.

## Runtime boundary

The Harness is not an API specification. The live application uses the sibling
backend's implemented contracts for the following behavior:

| Product behavior               | Backend contract                 | Runtime status              |
| ------------------------------ | -------------------------------- | --------------------------- |
| Kakao sign-in                  | `POST /api/auth/kakao/login`          | Live API |
| New dog registration           | `POST /api/dogs` with `signup_token`  | Live API |
| My dog profile                 | `GET/PATCH /api/dogs/me`              | Live API |
| Nearby facilities              | `GET /api/places`                      | Live API |
| Course generation/finalization | `POST /api/courses`, `PUT .../places` | Live API |
| My-course reload/detail lookup | `GET /api/dogs/me/courses`, `/courses/{id}` | Live API |
| Community ownership/save       | `GET /api/courses`, `POST .../save`   | Live API |
| Archive diary/report           | `GET/PATCH /api/logs`                 | Live API |

`NEXT_PUBLIC_APP_MODE=demo` exists only for deterministic Playwright coverage of
the unsupported Harness branches. Production and ordinary local development use
`live`; they must never silently fall back to generated mock data after an API
failure.

Browser API calls use the same-origin `/backend-api/` rewrite. Its server-side
target is configured with `DOGMAP_API_ORIGIN` and defaults to the backend's
documented `http://localhost:8000` address.

## Continuous completion loop

Creating or updating a PR is a checkpoint, never a completion condition. Continue without waiting for user confirmation until every audited Harness node has a working route, state transition and test coverage.

For each remaining node:

1. Inspect the exact Harness and UI Figma frame.
2. Compare it with the current route, interaction and empty/error/ownership state.
3. Implement the gap with the backend API when a contract exists; use centralized
   demo state only for explicitly unsupported contracts.
4. Add or update Vitest state coverage and Playwright user-flow coverage.
5. Run typecheck and relevant tests. At feature checkpoints also run lint and build.
6. Commit and push the checkpoint, then immediately start the next audit item.

## Harness UI audit checklist

- [x] Entry, terms, onboarding, location prompt and home
- [x] Course empty/list/generation/loading/detail/edge result/map spot interaction
- [x] Course request inputs: date, start/end time, start location and visit themes
- [x] Community ownership and save-to-my-course flow
- [x] Archive footprint list, persisted course diary entry and activity report flow
- [x] My page, edit, reusable terms, error and 404
- [ ] Final Figma UI frame-by-frame visual audit (44-frame pass in progress)
- [x] Backend contract audit and live API boundary correction
- [x] Backend support for own-course detail/reload, community save, archive and diary

## Figma node coverage

| Flow                         | Figma nodes                                                                        | Implemented routes/states                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Entry and onboarding         | `54:235`, `56:260`, `29:131`, `54:167`                                             | `/login`, `/terms`, `/terms/[slug]`, `/onboarding/1`, `/onboarding/2`                                             |
| Home and location permission | `65:541`, `74:565`, `141:93`, `143:213`, `180:207`                                 | `/`, permission prompt, course/community entry actions                                                            |
| Course                       | `74:643`, `74:667`, `74:728`, `288:446`, `305:492`, `74:812`, `74:872`, `241:1180` | `/courses`, `/courses/new`, `/courses/generating`, `/courses/[courseId]`, validation, edge result and spot detail |
| Community                    | `225:457`, `241:774`, `241:1061`, `241:1109`                                       | `/community`, `/community/[courseId]`, size filter, ownership and save states                                     |
| Archive and report           | `205:235`, `205:208`, `214:905`, `205:97`, `205:144`, `241:334`                    | `/archive`, `/archive/[courseId]`, persisted diary and `/report`                                                  |
| My and recovery              | `95:338`, `397:528`, `242:1455`, `78:899`, `78:913`                                | `/mypage`, `/mypage/edit`, reusable terms, 404 and error recovery                                                 |

The table above records Harness route coverage, not backend completeness. Rows
that depend on absent backend endpoints remain demo-only as listed in Runtime
boundary.
