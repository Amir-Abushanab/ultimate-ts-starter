import { expoClient } from "@better-auth/expo/client";
import { env } from "@ultimate-ts-starter/env/native";
import {
  emailOTPClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    emailOTPClient(),
    organizationClient(),
    twoFactorClient(),
    expoClient({
      scheme: String(Constants.expoConfig?.scheme ?? ""),
      storage: SecureStore,
      storagePrefix: String(Constants.expoConfig?.scheme ?? ""),
    }),
  ],
});
