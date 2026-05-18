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

import type {
  AnalyticsClient,
  FlagsSnapshot,
} from "@ultimate-ts-starter/analytics";

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
 *
 * Pass `null` to disconnect (useful in tests).
 */
export const connectFlagsToAnalytics = (client: AnalyticsClient | null) => {
  analyticsClient = client;
};

// Mirror of `keyof Flags`. TypeScript enforces every entry is a real flag
// key (via `satisfies`) — if you add a flag, you must add it here too.
// Missing entries aren't caught by the type system, but `defaults` will
// already have flagged the omission, so this list stays in sync naturally.
const flagKeys = [
  "newCheckoutFlow",
  "organizationSwitcher",
  "twoFactorSetup",
] as const satisfies readonly (keyof Flags)[];

/**
 * Result of `getFlagsSnapshot()`: the fully-resolved typed Flags, plus
 * `$snapshot` — the underlying raw FlagsSnapshot from analytics (or `null`
 * when analytics isn't connected).
 *
 * Pass `$snapshot` back to `analytics.track(event, props, { flags: $snapshot })`
 * so the captured event carries the exact remote flag values your code
 * branched on. (`$`-prefix avoids any collision with future flag names.)
 */
export type FlagsResult = Flags & {
  readonly $snapshot: FlagsSnapshot | null;
};

/**
 * Resolve every flag in one shot.
 *
 * Issues exactly one `/flags` request to PostHog (server-side) and returns
 * the fully-resolved typed Flags object, with overrides and defaults
 * filled in. Prefer this over repeated `getFlag()` calls in any path
 * that checks more than one flag.
 *
 * Resolution per key: local override → PostHog remote → local default.
 *
 * Pass `distinctId` on the server when the caller knows the user. On
 * web/native it's ignored (the PostHog SDK tracks it implicitly).
 */
export const getFlagsSnapshot = async (
  distinctId?: string
): Promise<FlagsResult> => {
  const remote = analyticsClient
    ? await analyticsClient.getFlagsSnapshot(distinctId)
    : null;

  const resolved = { ...defaults, ...overrides };
  if (remote) {
    for (const key of flagKeys) {
      if (key in overrides) {
        continue;
      }
      const remoteValue = remote.isEnabled(key);
      if (remoteValue !== undefined) {
        resolved[key] = remoteValue;
      }
    }
  }
  return { ...resolved, $snapshot: remote };
};

/**
 * Get a single flag value.
 *
 * Convenience wrapper over `getFlagsSnapshot()` — if you're checking more
 * than one flag in the same request, call the snapshot once instead.
 *
 * Checks: overrides → PostHog remote → local defaults.
 */
export const getFlag = async <K extends keyof Flags>(
  key: K
): Promise<Flags[K]> => {
  const snapshot = await getFlagsSnapshot();
  return snapshot[key];
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
