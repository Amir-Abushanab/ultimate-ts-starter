import { expo } from "@better-auth/expo";
import { sso } from "@better-auth/sso";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import { createDb } from "@ultimate-ts-starter/db";
import * as schema from "@ultimate-ts-starter/db/schema/auth";
import { sendOtpEmail } from "@ultimate-ts-starter/email";
import { env } from "@ultimate-ts-starter/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  bearer,
  emailOTP,
  organization,
  twoFactor,
} from "better-auth/plugins";

import { polarClient } from "./lib/payments";

export const createAuth = () => {
  const db = createDb();

  return betterAuth({
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
      // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
      // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
      // crossSubDomainCookies: {
      //   enabled: true,
      //   domain: "<your-workers-subdomain>",
      // },
    },
    appName: "ultimate-ts-starter",
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    plugins: [
      bearer(),
      emailOTP({
        expiresIn: 600,
        otpLength: 6,
        async sendVerificationOTP({ email, otp, type }) {
          if (!env.RESEND_API_KEY) {
            if (env.NODE_ENV === "production") {
              throw new Error("RESEND_API_KEY is required in production");
            }
            console.log(`\n[auth] OTP for ${email}: ${otp}\n`);
            return;
          }
          await sendOtpEmail({
            apiKey: env.RESEND_API_KEY,
            from: env.RESEND_FROM_EMAIL,
            otp,
            to: email,
            type,
          });
        },
      }),
      admin(),
      organization(),
      // TODO: add `allowPasswordless: true` when upgrading Better Auth
      // to a version that supports it (lets OTP-only users manage 2FA)
      twoFactor(),
      sso(),
      ...(env.POLAR_ACCESS_TOKEN
        ? [
            polar({
              client: polarClient,
              createCustomerOnSignUp: true,
              enableCustomerPortal: true,
              use: [
                checkout({
                  authenticatedUsersOnly: true,
                  products: [
                    {
                      productId: env.POLAR_PRODUCT_ID ?? "",
                      slug: "pro",
                    },
                  ],
                  successUrl: env.POLAR_SUCCESS_URL ?? "",
                }),
                portal(),
              ],
            }),
          ]
        : []),
      expo(),
    ],
    secret: env.BETTER_AUTH_SECRET,
    // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
    // session: {
    //   cookieCache: {
    //     enabled: true,
    //     maxAge: 60,
    //   },
    // },
    trustedOrigins: [
      env.CORS_ORIGIN,
      "ultimate-ts-starter://",
      ...(env.NODE_ENV === "development"
        ? [
            "exp://",
            "exp://**",
            "exp://192.168.*.*:*/**",
            "http://localhost:8081",
          ]
        : []),
    ],
    ...(env.GOOGLE_CLIENT_ID !== undefined &&
    env.GOOGLE_CLIENT_SECRET !== undefined
      ? {
          socialProviders: {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
          },
        }
      : {}),
  });
};
