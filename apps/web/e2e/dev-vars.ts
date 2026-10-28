import { existsSync, writeFileSync } from "node:fs";

// The isolated e2e database. Never your real dev DB; override the host via
// E2E_DATABASE_URL (e.g. in CI).
export const E2E_DB =
  process.env.E2E_DATABASE_URL ??
  "postgresql://amir@localhost:5432/ultimate_ts_starter_e2e";

// The server reads these via cloudflare:workers env (.dev.vars). They point at
// the isolated DB and omit EMAIL, so OTPs log to the console (the test's sink).
const DEV_VARS_PATH = new URL("../../server/.dev.vars", import.meta.url);
const DEV_VARS = `DATABASE_URL=${E2E_DB}
BETTER_AUTH_SECRET=dev-secret-change-me-in-production-please
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
`;

// Self-provision the server's dev vars on a fresh checkout; never clobber an
// existing file (a dev may point it elsewhere intentionally). This has to run
// when the config loads: Playwright starts `webServer` BEFORE `globalSetup`,
// and wrangler only reads .dev.vars at startup.
export const ensureServerDevVars = () => {
  if (!existsSync(DEV_VARS_PATH)) {
    writeFileSync(DEV_VARS_PATH, DEV_VARS);
  }
};
