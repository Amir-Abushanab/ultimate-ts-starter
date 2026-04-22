import { PostHog } from "posthog-node";

import type { AnalyticsClient } from "./index.js";

const NOOP_UNDEFINED: string | boolean | undefined = undefined;
const NOOP_FLAG_VALUE: Promise<string | boolean | undefined> =
  Promise.resolve(NOOP_UNDEFINED);
const NOOP_FLAG_ENABLED: Promise<boolean | undefined> = Promise.resolve(
  NOOP_UNDEFINED as boolean | undefined
);

/**
 * Creates a server-side analytics client using posthog-node.
 * Returns a no-op client if apiKey is not provided.
 */
export const createServerAnalytics = (options: {
  apiKey?: string;
  host?: string;
}): { client: AnalyticsClient; posthog: PostHog | null } => {
  if (options.apiKey === undefined) {
    return {
      client: {
        captureException() {
          /* noop */
        },
        getFeatureFlag: () => NOOP_FLAG_VALUE,
        group() {
          /* noop */
        },
        identify() {
          /* noop */
        },
        isFeatureEnabled: () => NOOP_FLAG_ENABLED,
        page() {
          /* noop */
        },
        reset() {
          /* noop */
        },
        track() {
          /* noop */
        },
      },
      posthog: null,
    };
  }

  const posthog = new PostHog(options.apiKey, {
    host: options.host ?? "https://us.i.posthog.com",
  });

  const client: AnalyticsClient = {
    captureException(error, properties) {
      posthog.captureException(
        error,
        typeof properties?.userId === "string" ? properties.userId : "server",
        properties
      );
    },
    async getFeatureFlag(key) {
      return (await posthog.getFeatureFlag(key, "server")) ?? undefined;
    },
    group(type, id, traits) {
      posthog.groupIdentify({
        groupKey: id,
        groupType: type,
        properties: traits,
      });
    },
    identify(userId, traits) {
      posthog.identify({ distinctId: userId, properties: traits });
    },
    isFeatureEnabled(key) {
      return posthog.isFeatureEnabled(key, "server");
    },
    page() {
      /* noop */
    },
    reset() {
      /* noop */
    },
    track(event, properties) {
      posthog.capture({
        distinctId:
          typeof properties?.userId === "string" ? properties.userId : "server",
        event,
        properties,
      });
    },
  };

  return { client, posthog };
};
