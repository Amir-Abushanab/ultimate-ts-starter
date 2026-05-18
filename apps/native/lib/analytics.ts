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
    captureException: (error, properties) => {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- Record<string, unknown> → PostHogEventProperties (stricter JsonType only); we trust callers to pass JSON-serializable values
      posthogInstance?.capture("$exception", {
        $exception_message: error.message,
        $exception_stack_trace_raw: error.stack ?? "",
        $exception_type: error.name,
        ...properties,
      } as never);
    },
    // posthog-react-native caches all flags locally — thin sync wrapper.
    // distinctId is implicit (the posthog instance tracks it via identify()).
    getFlagsSnapshot: () =>
      Promise.resolve({
        getFlag: (key) => posthogInstance?.getFeatureFlag(key) ?? undefined,
        isEnabled: (key) => posthogInstance?.isFeatureEnabled(key) ?? undefined,
      }),
    group: (type, id, traits) => {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- see captureException above
      posthogInstance?.group(type, id, traits as never);
    },
    identify: (userId, traits) => {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- see captureException above
      posthogInstance?.identify(userId, traits as never);
    },
    page: (name, properties) => {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- see captureException above
      void posthogInstance?.screen(name ?? "unknown", properties as never);
    },
    reset: () => {
      posthogInstance?.reset();
    },
    track: (event, properties) => {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- see captureException above
      posthogInstance?.capture(event, properties as never);
    },
  };

  setAnalyticsClient(client);
};
