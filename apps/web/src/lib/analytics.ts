import {
  setAnalyticsClient,
  warnIfNotConfigured,
} from "@ultimate-ts-starter/analytics";
import type { AnalyticsClient } from "@ultimate-ts-starter/analytics";
import { env } from "@ultimate-ts-starter/env/web";
import { posthog } from "posthog-js";

let initialized = false;

/**
 * Initialize PostHog for the web app.
 * Call once at app startup. No-ops if VITE_POSTHOG_KEY is not set.
 */
export const initAnalytics = () => {
  if (initialized) {
    return;
  }
  initialized = true;

  const apiKey = env.VITE_POSTHOG_KEY;
  warnIfNotConfigured(apiKey);

  if (apiKey === undefined) {
    return;
  }

  posthog.init(apiKey, {
    api_host: env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
    autocapture: true,
    capture_pageleave: true,
    capture_pageview: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: ".sensitive",
    },
  });

  const client: AnalyticsClient = {
    captureException: (error, properties) => {
      posthog.captureException(error, { ...properties });
    },
    getFeatureFlag: (key) =>
      Promise.resolve(posthog.getFeatureFlag(key) ?? undefined),
    group: (type, id, traits) => {
      posthog.group(type, id, traits);
    },
    identify: (userId, traits) => {
      posthog.identify(userId, traits);
    },
    isFeatureEnabled: (key) =>
      Promise.resolve(posthog.isFeatureEnabled(key) ?? undefined),
    page: (name, properties) => {
      posthog.capture("$pageview", { ...properties, name });
    },
    reset: () => {
      posthog.reset();
    },
    track: (event, properties) => {
      posthog.capture(event, properties);
    },
  };

  setAnalyticsClient(client);
};

/** Get the raw posthog-js instance (for PostHogProvider). */
export const getPostHogClient = () =>
  env.VITE_POSTHOG_KEY === undefined ? null : posthog;
