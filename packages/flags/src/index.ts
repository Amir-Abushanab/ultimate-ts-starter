/**
 * Typed feature flags with PostHog remote support + local fallback.
 *
 * When PostHog is configured, flags are evaluated remotely (A/B tests,
 * gradual rollouts, user targeting). When it's not configured, flags
 * fall back to the local defaults defined here.
 *
 * Usage stays the same regardless:
 *   const enabled = await getFlag("newCheckoutFlow");
 */

import type { AnalyticsClient } from "@ultimate-ts-starter/analytics";

export interface Flags {
  /** Enable the new checkout flow */
  newCheckoutFlow: boolean;
  /** Show the organization switcher in the header */
  organizationSwitcher: boolean;
  /** Enable 2FA setup in settings */
  twoFactorSetup: boolean;
}

const defaults: Flags = {
  newCheckoutFlow: false,
  organizationSwitcher: false,
  twoFactorSetup: true,
};

let overrides: Partial<Flags> = {};
let analyticsClient: AnalyticsClient | null = null;

/**
 * Connect feature flags to PostHog (or any analytics client).
 * When connected, getFlag() checks remote flags first, falling
 * back to local defaults if the remote flag doesn't exist.
 */
export const connectFlagsToAnalytics = (client: AnalyticsClient) => {
  analyticsClient = client;
};

/**
 * Get a flag value.
 * Checks: overrides → PostHog remote → local defaults.
 */
export const getFlag = async <K extends keyof Flags>(
  key: K
): Promise<Flags[K]> => {
  // 1. Local overrides take highest priority
  if (key in overrides) {
    // eslint-disable-next-line typescript/no-unsafe-type-assertion -- generic K indexing requires assertion
    return overrides[key] as unknown as Flags[K];
  }

  // 2. Try PostHog remote flags
  if (analyticsClient) {
    const remote = await analyticsClient.isFeatureEnabled(key);
    if (remote !== undefined) {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- generic K indexing requires assertion
      return remote as unknown as Flags[K];
    }
  }

  // 3. Fall back to local defaults
  return defaults[key];
};

/**
 * Get a flag value synchronously (local only, no remote check).
 * Use this in render paths where async isn't possible.
 */
export const getFlagSync = <K extends keyof Flags>(key: K): Flags[K] =>
  // eslint-disable-next-line typescript/no-unsafe-type-assertion -- generic K indexing requires assertion
  (overrides[key] ?? defaults[key]) as unknown as Flags[K];

/** Get all local flags as a snapshot (does not check remote). */
export const getAllFlags = (): Flags => ({ ...defaults, ...overrides });

/** Override flags at runtime (e.g. from env, KV, or tests). */
export const setFlags = (flags: Partial<Flags>) => {
  overrides = { ...overrides, ...flags };
};

/** Reset all overrides back to defaults. */
export const resetFlags = () => {
  overrides = {};
};
