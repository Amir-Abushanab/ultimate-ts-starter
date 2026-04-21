/**
 * Auth config for the Better Auth CLI (npx auth generate).
 * Mirrors the real config's plugins but without runtime dependencies
 * (no Cloudflare env, no DB connection, no Polar client).
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  bearer,
  emailOTP,
  organization,
  twoFactor,
} from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(
    // eslint-disable-next-line typescript/no-unsafe-type-assertion -- CLI stub passes empty object as DB placeholder
    {} as unknown as Parameters<typeof drizzleAdapter>[0],
    { provider: "pg" }
  ),
  plugins: [
    bearer(),
    emailOTP({
      sendVerificationOTP() {
        /* noop */
      },
    }),
    admin(),
    organization(),
    twoFactor(),
  ],
  socialProviders: {
    google: { clientId: "cli", clientSecret: "cli" },
  },
});
