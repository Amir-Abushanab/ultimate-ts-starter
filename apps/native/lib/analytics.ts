import {
  setAnalyticsClient,
  warnIfNotConfigured,
} from "@ultimate-ts-starter/analytics";
import type { AnalyticsClient } from "@ultimate-ts-starter/analytics";
import { env } from "@ultimate-ts-starter/env/native";
import PostHog from "posthog-react-native";

let posthogInstance: PostHog | null = null;
let initialized = false;

/**
 * Initialize PostHog for the native app.
 * Call once in the root layout. No-ops if EXPO_PUBLIC_POSTHOG_KEY is not set.
 */
export const initAnalytics = () => {
  if (initialized) {
    return;
  }
  initialized = true;

  const apiKey = env.EXPO_PUBLIC_POSTHOG_KEY;
  warnIfNotConfigured(apiKey);

  if (apiKey === undefined) {
    return;
  }

  posthogInstance = new PostHog(apiKey, {
    host: env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  });

  const client: AnalyticsClient = {
    captureException: (error, properties) =>
      posthogInstance?.capture("$exception", {
        $exception_message: error.message,
        $exception_stack_trace_raw: error.stack,
        $exception_type: error.name,
        ...properties,
      }),
    getFeatureFlag: (key) => posthogInstance?.getFeatureFlag(key) ?? undefined,
    group: (type, id, traits) => posthogInstance?.group(type, id, traits),
    identify: (userId, traits) => posthogInstance?.identify(userId, traits),
    isFeatureEnabled: (key) =>
      posthogInstance?.isFeatureEnabled(key) ?? undefined,
    page: (name, properties) => {
      void posthogInstance?.screen(name ?? "unknown", properties);
    },
    reset: () => posthogInstance?.reset(),
    track: (event, properties) => posthogInstance?.capture(event, properties),
  };

  setAnalyticsClient(client);
};
