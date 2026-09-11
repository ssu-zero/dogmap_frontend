import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./apps/web/e2e",
  use: {
    baseURL: "http://127.0.0.1:3001",
  },
  projects: [
    {
      name: "mobile",
      use: {
        hasTouch: true,
        isMobile: true,
        viewport: { width: 393, height: 852 },
      },
    },
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: "E2E=1 pnpm --filter web exec next dev --port 3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:3001",
  },
})
