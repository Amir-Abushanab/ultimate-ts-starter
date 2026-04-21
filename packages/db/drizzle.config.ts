import { resolve } from "node:path";

import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const root = resolve(import.meta.filename, "../../..");

dotenv.config({ path: resolve(root, "apps/server/.env") });
dotenv.config({ path: resolve(root, ".env") });

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  dialect: "postgresql",
  out: "./src/migrations",
  schema: "./src/schema",
});
