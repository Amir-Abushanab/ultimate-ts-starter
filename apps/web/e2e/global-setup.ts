import { execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

// Bring the isolated e2e database to a known-good, seeded state before the
// full-stack tests run. Everything here is idempotent: createdb is a no-op if
// the DB exists, `drizzle-kit push` is a diff, and the seed uses
// onConflictDoNothing. It targets ONLY ultimate_ts_starter_e2e — never your
// real dev DB.
const E2E_DB =
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

const run = (command: string, env?: Record<string, string>) => {
  execSync(command, { env: { ...process.env, ...env }, stdio: "inherit" });
};

export default function globalSetup() {
  // Self-provision the server's dev vars on a fresh checkout; never clobber an
  // existing file (a dev may point it elsewhere intentionally).
  if (!existsSync(DEV_VARS_PATH)) {
    writeFileSync(DEV_VARS_PATH, DEV_VARS);
  }
  try {
    execSync("createdb ultimate_ts_starter_e2e", { stdio: "ignore" });
  } catch {
    // Already exists — fine.
  }
  run(
    "pnpm --filter @ultimate-ts-starter/db exec drizzle-kit push --config drizzle.e2e.config.ts --force",
    { E2E_DATABASE_URL: E2E_DB }
  );
  run("pnpm --filter @ultimate-ts-starter/db db:seed", {
    DATABASE_URL: E2E_DB,
  });
}
