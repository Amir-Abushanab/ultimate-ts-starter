/**
 * Shared analytics interface.
 *
 * All platforms (web, native, server) use these types for consistent
 * event tracking. Each platform initializes its own PostHog SDK
 * and passes it to createAnalytics().
 *
 * If PostHog is not configured, all calls are no-ops.
 */

/**
 * A point-in-time evaluation of all feature flags for a user.
 *
 * Branch on `isEnabled(key)` / `getFlag(key)` repeatedly without re-fetching —
 * the snapshot is immutable, so every read sees the same values your code
 * branched on. Pass the same snapshot back to event capture (where supported)
 * so the captured event carries those exact values.
 */
export interface FlagsSnapshot {
  /** True if the flag is enabled; undefined if the flag isn't defined remotely. */
  isEnabled(key: string): boolean | undefined;
  /** Multivariate flag value (string), boolean flag value, or undefined when unset. */
  getFlag(key: string): string | boolean | undefined;
}

export interface CaptureOptions {
  /**
   * Attach a `FlagsSnapshot` (from `getFlagsSnapshot()`) to the captured event.
   * The event will carry exactly the flag values your code branched on — no
   * extra `/flags` request, no drift between branch-time and capture-time.
   *
   * Server-only: posthog-js and posthog-react-native auto-attach the currently
   * loaded flag cache to every event, so this option is silently ignored
   * client-side.
   */
  flags?: FlagsSnapshot;
}

export interface AnalyticsClient {
  track(
    event: string,
    properties?: Record<string, unknown>,
    options?: CaptureOptions
  ): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name?: string, properties?: Record<string, unknown>): void;
  group(type: string, id: string, traits?: Record<string, unknown>): void;
  reset(): void;
  captureException(error: Error, properties?: Record<string, unknown>): void;
  /**
   * Evaluate all feature flags for a user and return a reusable snapshot.
   *
   * On the server, this issues exactly one `/flags` request per call — hold
   * the returned snapshot for the lifetime of an incoming request and branch
   * on it as many times as needed.
   *
   * On the browser / native SDKs, flags are already loaded locally; the
   * snapshot is a thin sync wrapper and `distinctId` is ignored (the SDK
   * tracks it implicitly via `identify`).
   */
  getFlagsSnapshot(distinctId?: string): Promise<FlagsSnapshot>;
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

const emptySnapshot: FlagsSnapshot = {
  getFlag() {
    /* noop — returns undefined for any key */
  },
  isEnabled() {
    /* noop — returns undefined for any key */
  },
};

const noop: AnalyticsClient = {
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
