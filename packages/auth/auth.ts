/**
 * Auth config for the Better Auth CLI (npx auth generate).
 * Mirrors the real config's plugins but without runtime dependencies
 * (no Cloudflare env, no DB connection, no Polar client).
 */
import { sso } from "@better-auth/sso";
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
    // CLI stub: an empty object stands in for the DB connection
    {},
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
    sso(),
  ],
  socialProviders: {
    google: { clientId: "cli", clientSecret: "cli" },
  },
});
