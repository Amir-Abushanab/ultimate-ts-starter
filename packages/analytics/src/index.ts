/**
 * Shared analytics interface.
 *
 * All platforms (web, native, server) use these types for consistent
 * event tracking. Each platform initializes its own PostHog SDK
 * and passes it to createAnalytics().
 *
 * If PostHog is not configured, all calls are no-ops.
 */

export interface AnalyticsClient {
  track(event: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name?: string, properties?: Record<string, unknown>): void;
  group(type: string, id: string, traits?: Record<string, unknown>): void;
  reset(): void;
  captureException(error: Error, properties?: Record<string, unknown>): void;
  isFeatureEnabled(key: string): Promise<boolean | undefined>;
  getFeatureFlag(key: string): Promise<string | boolean | undefined>;
}

/**
 * Typed analytics events — extend this as your app grows.
 * Using a type keeps event names consistent across platforms.
 */
export interface AnalyticsEvents {
  // Auth
  "auth.signed_in": { method: "otp" | "sso" | "2fa" };
  "auth.signed_out": Record<string, never>;
  "auth.otp_requested": { email: string };
  "auth.2fa_enabled": Record<string, never>;
  "auth.2fa_disabled": Record<string, never>;

  // Billing
  "billing.checkout_started": { plan: string };
  "billing.subscription_upgraded": { plan: string };
  "billing.portal_opened": Record<string, never>;

  // Account
  "account.data_exported": Record<string, never>;
  "account.deleted": Record<string, never>;
  "account.preferences_updated": { category: string };

  // General
  "page.viewed": { path: string };
  "feature.used": { feature: string };
}

export type AnalyticsEvent = keyof AnalyticsEvents;

const noop: AnalyticsClient = {
  captureException() {
    /* noop */
  },
  getFeatureFlag: async () => {
    await Promise.resolve();
  },
  group() {
    /* noop */
  },
  identify() {
    /* noop */
  },
  isFeatureEnabled: async () => {
    await Promise.resolve();
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
};

let client: AnalyticsClient = noop;
let warned = false;

/**
 * Set the global analytics client.
 * Call this once at app startup with a platform-specific PostHog instance.
 * If never called, all analytics calls are silent no-ops.
 */
export const setAnalyticsClient = (c: AnalyticsClient) => {
  client = c;
};

/** Get the current analytics client. */
export const getAnalytics = (): AnalyticsClient => client;

/**
 * Warn once that analytics is not configured.
 * Call this at startup after checking the env var.
 */
export const warnIfNotConfigured = (apiKey: string | undefined) => {
  if (apiKey === undefined && !warned) {
    warned = true;
    console.warn(
      "[analytics] POSTHOG_API_KEY not set — analytics, session replay, and remote feature flags are disabled."
    );
  }
};
