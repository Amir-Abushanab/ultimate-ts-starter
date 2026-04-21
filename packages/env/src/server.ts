// eslint-disable-next-line typescript/triple-slash-reference -- ambient type augmentation for cloudflare:workers module
/// <reference path="../env.d.ts" />
import { env as rawEnv } from "cloudflare:workers";
import { z } from "zod";

/**
 * Server environment schema.
 * Required vars crash on missing. Optional vars warn once.
 */
const requiredSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(1, "Set via `wrangler secret put BETTER_AUTH_SECRET`"),
  BETTER_AUTH_URL: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
  DATABASE_URL: z.string().min(1, "Set via `wrangler secret put DATABASE_URL`"),
  NODE_ENV: z.string(),
});

const optionalKeys = [
  "POLAR_ACCESS_TOKEN",
  "POLAR_PRODUCT_ID",
  "POLAR_SUCCESS_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "POSTHOG_API_KEY",
  "POSTHOG_HOST",
] as const;

let validated = false;

/**
 * Validated server environment.
 * On first access, validates required vars (throws if missing)
 * and warns about missing optional vars.
 */
export const env: Env = new Proxy(rawEnv as Env, {
  get(target, prop, receiver) {
    if (!validated) {
      validated = true;

      // Required vars — crash if missing
      const result = requiredSchema.safeParse(target);
      if (!result.success) {
        const issues = result.error.issues
          .map((i) => `  ${String(i.path[0])}: ${i.message}`)
          .join("\n");
        throw new Error(
          `Missing required environment variables:\n${issues}\n\nSee .env.example for reference.`
        );
      }

      // Optional vars — warn if missing
      const targetRecord: Record<string, unknown> = target;
      const missing = optionalKeys.filter(
        (key) => targetRecord[key] === undefined
      );
      if (missing.length > 0) {
        console.warn(
          `[env] Optional vars not set (features disabled): ${missing.join(", ")}`
        );
      }
    }
    return Reflect.get(target, prop, receiver) as unknown;
  },
});
