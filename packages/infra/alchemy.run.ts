import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("ultimate-ts-starter");

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    POLAR_ACCESS_TOKEN: alchemy.secret.env.POLAR_ACCESS_TOKEN!,
    POLAR_SUCCESS_URL: alchemy.env.POLAR_SUCCESS_URL!,
  },
  dev: {
    port: 3000,
  },
});

console.log(`Server -> ${server.url}`);

await app.finalize();
