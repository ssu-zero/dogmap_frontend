---
name: figma-mobile-ui
description: Implement a Dogmap frontend screen from a Figma link as a responsive mobile-first layout, preserving the project's 375px desktop frame convention.
---

# Figma mobile UI

Use this skill when a Figma link or Figma design implementation is requested for `dogmap_frontend`.

Inspect the supplied design with Figma MCP before writing UI. Use existing tokens and components first; add a shared component in `packages/ui` only when it is genuinely reusable, with matching Storybook coverage.

## Layout contract

- Treat 375px as the design reference only. At phone widths, the app is `width: 100%`; on desktop only, use the centered 375px `layout-mobile` app frame.
- Preserve normal document flow. Build spacing through `flex` or `grid`, `gap`, and parent `padding`; do not tune a layout with arbitrary margins or coordinates.
- Use absolute positioning solely for intentional overlap, overlays, or badges.
- Use the token definitions in `packages/ui/src/tokens/foundations.ts` and the shared styles rather than inventing near-duplicate values.

Validate the result at a 375px viewport and a wider phone viewport, then at a desktop viewport to confirm the 375px frame. If Figma MCP is unavailable, state that limitation and ask for screenshots or exported measurements rather than guessing hidden design details.
