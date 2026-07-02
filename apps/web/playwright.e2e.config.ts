import { defineConfig, devices } from "@playwright/test";

// Full-stack E2E config: boots BOTH the web app (:3001) and the oRPC server
// (:3000, with the console-OTP dev config), seeds an isolated Postgres in
// globalSetup, and runs only the `*.e2e.spec.ts` suites. Kept separate from
// playwright.config.ts (web-only smoke tests) so CI without a DB is unaffected.
//
// Run with: pnpm --filter web test:e2e:full
export default defineConfig({
  forbidOnly: !!process.env.CI,
  // CRUD mutates shared in-memory server state, so keep the suite serial.
  fullyParallel: false,
  globalSetup: "./e2e/global-setup.ts",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: process.env.CI ? "github" : "list",
  retries: 0,
  testDir: "./e2e",
  testMatch: "**/*.e2e.spec.ts",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "pnpm --filter web dev",
      port: 3001,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // Tee the server's stdout to a log the test reads OTPs from — workerd has
      // no filesystem, so the console-logged OTP is the only dev sink.
      command:
        "sh -c 'pnpm --filter server exec wrangler dev --config wrangler.dev.jsonc 2>&1 | tee e2e/.server.log'",
      port: 3000,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  workers: 1,
});
