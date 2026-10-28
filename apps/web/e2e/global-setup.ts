import { execSync } from "node:child_process";

import { E2E_DB } from "./dev-vars";

// Bring the isolated e2e database to a known-good, seeded state before the
// full-stack tests run. Everything here is idempotent: createdb is a no-op if
// the DB exists, `drizzle-kit push` is a diff, and the seed uses
// onConflictDoNothing. It targets ONLY ultimate_ts_starter_e2e — never your
// real dev DB. The server's .dev.vars are provisioned earlier, in
// playwright.e2e.config.ts (see ensureServerDevVars).

const run = (command: string, env?: Record<string, string>) => {
  execSync(command, { env: { ...process.env, ...env }, stdio: "inherit" });
};

export default function globalSetup() {
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
