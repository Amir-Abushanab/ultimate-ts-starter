import { ssoClient } from "@better-auth/sso/client";
import { polarClient } from "@polar-sh/better-auth";
import { env } from "@ultimate-ts-starter/env/web";
import {
  adminClient,
  emailOTPClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    emailOTPClient(),
    adminClient(),
    organizationClient(),
    twoFactorClient(),
    ssoClient(),
    polarClient(),
  ],
});
