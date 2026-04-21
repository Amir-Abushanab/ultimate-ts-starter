import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    VITE_POSTHOG_HOST: z.string().optional(),
    VITE_POSTHOG_KEY: z.string().optional(),
    VITE_SERVER_URL: z.url(),
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  // eslint-disable-next-line typescript/no-unsafe-type-assertion -- import.meta.env type unresolved in lint env
  runtimeEnv: import.meta.env as Record<string, string | undefined>,
});
