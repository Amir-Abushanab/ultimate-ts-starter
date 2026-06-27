import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: process.env.CI ? "github" : "html",
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  // Full-stack flows (need the API + DB) live in *.e2e.spec.ts and run via
  // playwright.e2e.config.ts. This web-only config stays CI-safe without a DB.
  testIgnore: "**/*.e2e.spec.ts",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: {
    // Just the web app — smoke tests exercise navigation, not APIs.
    // Starting server would also require a real DB which isn't available in CI.
    command: "pnpm --filter web dev",
    port: 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  workers: process.env.CI ? 1 : undefined,
});
