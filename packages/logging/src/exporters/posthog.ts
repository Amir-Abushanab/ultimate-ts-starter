import type { Exporter, WideEvent } from "@ultimate-ts-starter/logging/types";

/**
 * PostHog exporter for wide events.
 * Sends each wide event as a server-side PostHog event.
 * Falls back gracefully if PostHog is not configured.
 *
 * Usage:
 *   import { createServerAnalytics } from "@ultimate-ts-starter/analytics/server";
 *   import { postHogExporter } from "@ultimate-ts-starter/logging/exporters/posthog";
 *
 *   const { posthog } = createServerAnalytics({ apiKey: env.POSTHOG_API_KEY });
 *   const exporter = postHogExporter(posthog);
 */
export const postHogExporter = (
  posthog: {
    capture: (args: {
      distinctId: string;
      event: string;
      properties?: Record<string, unknown>;
    }) => void;
  } | null
): Exporter => {
  if (!posthog) {
    return {
      emit() {
        /* noop */
      },
    };
  }

  return {
    emit(event: WideEvent) {
      const {
        request_id,
        method,
        path,
        status_code,
        duration_ms,
        outcome,
        error,
        ...properties
      } = event;
      posthog.capture({
        distinctId:
          typeof event.user_id === "string" ? event.user_id : "anonymous",
        event: "$request",
        properties: {
          duration_ms,
          method,
          outcome,
          path,
          request_id,
          status_code,
          ...(error
            ? { error_message: error.message, error_type: error.type }
            : {}),
          ...properties,
        },
      });
    },
  };
};
