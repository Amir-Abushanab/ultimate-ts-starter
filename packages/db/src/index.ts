import { env } from "@ultimate-ts-starter/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema/auth";

export const createDb = () => {
  // Use Hyperdrive connection pooling in production, fall back to direct DATABASE_URL in dev
  const connectionString =
    env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL ?? "";

  const pool = new Pool({
    connectionString,
    // Hyperdrive manages pooling — use one connection per request
    maxUses: 1,
  });

  return drizzle({ client: pool, schema });
};
