import { defineConfig } from "drizzle-kit";

// Drizzle config for the ISOLATED e2e database only. Never reads DATABASE_URL,
// so it can't touch your real dev DB. Override the host via E2E_DATABASE_URL in
// CI. Uses paths relative to packages/db (drizzle-kit's cwd) — no
// import.meta.filename, which the committed drizzle.config.ts trips on under
// drizzle-kit's bundler.
export default defineConfig({
  dbCredentials: {
    url:
      process.env.E2E_DATABASE_URL ??
      "postgresql://amir@localhost:5432/ultimate_ts_starter_e2e",
  },
  dialect: "postgresql",
  out: "./src/migrations",
  schema: "./src/schema",
});
