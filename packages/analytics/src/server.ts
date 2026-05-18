import type { FeatureFlagEvaluations } from "posthog-node";
import { PostHog } from "posthog-node";

import type { AnalyticsClient, FlagsSnapshot } from "./index.js";

const emptySnapshot: FlagsSnapshot = {
  getFlag() {
    /* noop — returns undefined for any key */
  },
  isEnabled() {
    /* noop — returns undefined for any key */
  },
};

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
        getFlagsSnapshot: () => Promise.resolve(emptySnapshot),
        group() {
          /* noop */
        },
        identify() {
          /* noop */
        },
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
    // posthog-node's FeatureFlagEvaluations already satisfies FlagsSnapshot
    // structurally (sync getFlag/isEnabled). One /flags request per call —
    // hold the returned snapshot for the lifetime of an incoming request.
    getFlagsSnapshot: (distinctId) =>
      posthog.evaluateFlags(distinctId ?? "server"),
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
    page() {
      /* noop */
    },
    reset() {
      /* noop */
    },
    track(event, properties, captureOptions) {
      posthog.capture({
        distinctId:
          typeof properties?.userId === "string" ? properties.userId : "server",
        event,
        // `getFlagsSnapshot` above returns a FeatureFlagEvaluations directly,
        // so a caller who passes it back here is handing us the same object.
        // The interface fence (FlagsSnapshot) is just to keep posthog-node out
        // of platform-neutral callers.
        // eslint-disable-next-line typescript/no-unsafe-type-assertion -- see comment above
        flags: captureOptions?.flags as FeatureFlagEvaluations | undefined,
        properties,
      });
    },
  };

  return { client, posthog };
};
