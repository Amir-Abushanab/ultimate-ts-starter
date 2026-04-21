import type { SamplingConfig, WideEvent } from "./types.js";

/**
 * Tail sampling — decides *after* the request completes whether to export.
 * This lets us always capture errors and slow requests while sampling
 * normal traffic at a lower rate to control costs.
 */
export const shouldSample = (
  event: WideEvent,
  config?: SamplingConfig
): boolean => {
  if (!config) {
    return true;
  }

  const {
    alwaysSampleErrors = true,
    slowThresholdMs,
    defaultRate = 1,
    custom,
  } = config;

  if (custom?.(event) === true) {
    return true;
  }
  if (alwaysSampleErrors && (event.status_code >= 500 || event.error)) {
    return true;
  }
  if (slowThresholdMs !== undefined && event.duration_ms > slowThresholdMs) {
    return true;
  }

  return Math.random() < defaultRate;
};
