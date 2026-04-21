import type { Exporter, WideEvent } from "@ultimate-ts-starter/logging/types";

const BASE_KEYS = new Set([
  "request_id",
  "trace_id",
  "parent_id",
  "timestamp",
  "service",
  "version",
  "method",
  "path",
  "status_code",
  "duration_ms",
  "outcome",
  "error",
]);

const flatten = (
  obj: Record<string, unknown>,
  prefix = ""
): [string, unknown][] => {
  const entries: [string, unknown][] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      entries.push(
        // eslint-disable-next-line typescript/no-unsafe-type-assertion -- narrowed above: non-null, non-array object
        ...flatten(value as unknown as Record<string, unknown>, path)
      );
    } else {
      entries.push([path, value]);
    }
  }
  return entries;
};

/**
 * Human-readable exporter for development.
 * Prints a summary line with enriched fields in logfmt-style key=value pairs.
 *
 * Example output:
 *   POST /rpc/checkout 200 45ms | user.id="usr_1" user.tier="pro" cart.items=3
 *   POST /rpc/checkout 500 120ms | PaymentError: Card declined
 */
export const consoleExporter = (): Exporter => ({
  emit(event: WideEvent) {
    const { method, path, status_code, duration_ms, outcome, error } = event;

    const parts = [`${method} ${path} ${status_code} ${duration_ms}ms`];

    if (error) {
      parts.push(`| ${error.type}: ${error.message}`);
    }

    const extras: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(event)) {
      if (!BASE_KEYS.has(key) && value !== undefined) {
        extras[key] = value;
      }
    }

    const flat = flatten(extras);
    if (flat.length > 0) {
      const pairs = flat
        .map(
          ([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`
        )
        .join(" ");
      parts.push(`| ${pairs}`);
    }

    const logFn = outcome === "error" ? console.error : console.log;
    logFn(parts.join(" "));
  },
});
