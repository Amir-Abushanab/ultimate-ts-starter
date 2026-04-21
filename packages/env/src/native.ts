import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    EXPO_PUBLIC_POSTHOG_HOST: z.string().optional(),
    EXPO_PUBLIC_POSTHOG_KEY: z.string().optional(),
    EXPO_PUBLIC_SERVER_URL: z.url(),
  },
  clientPrefix: "EXPO_PUBLIC_",
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
});
