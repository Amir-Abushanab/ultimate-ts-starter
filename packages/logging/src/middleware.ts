import { createMiddleware } from "hono/factory";

import { consoleExporter } from "./exporters/console.js";
import { shouldSample } from "./sampling.js";
import type {
  WideEvent,
  WideEventConfig,
  WideEventVariables,
} from "./types.js";

const parseTraceParent = (header: string) => {
  const parts = header.split("-");
  return parts.length < 4
    ? undefined
    : { parentId: parts[2] ?? "", traceId: parts[1] ?? "" };
};

/**
 * Hono middleware implementing the wide event / canonical log line pattern.
 *
 * Creates one structured event per request, enriched by handlers throughout
 * the request lifecycle, emitted once at completion with tail sampling.
 *
 * @example
 * ```ts
 * const app = new Hono<{ Variables: WideEventVariables }>();
 *
 * app.use(wideEvent({ service: "api" }));
 *
 * app.get("/users/:id", (c) => {
 *   const event = c.get("wideEvent");
 *   event.user_id = user.id;
 *   event.user_tier = user.tier;
 *   return c.json(user);
 * });
 * ```
 */
export const wideEvent = (config: WideEventConfig) => {
  const exporter = config.exporter ?? consoleExporter();

  return createMiddleware<{ Variables: WideEventVariables }>(
    async (c, next) => {
      const startTime = performance.now();

      const traceParent = c.req.header("traceparent");
      const traceCtx =
        traceParent === undefined ? undefined : parseTraceParent(traceParent);

      const event: WideEvent = {
        duration_ms: 0,
        method: c.req.method,
        outcome: "success",
        parent_id: traceCtx?.parentId,
        path: c.req.path,
        request_id: c.req.header("x-request-id") ?? crypto.randomUUID(),
        service: config.service,
        status_code: 200,
        timestamp: new Date().toISOString(),
        trace_id: traceCtx?.traceId,
        version: config.version,
      };

      c.set("wideEvent", event);

      try {
        await next();
        event.status_code = c.res.status;
        event.outcome = c.res.status >= 500 ? "error" : "success";
      } catch (error) {
        event.status_code = 500;
        event.outcome = "error";
        if (error instanceof Error) {
          event.error = {
            message: error.message,
            stack: error.stack,
            type: error.name,
          };
          config.onError?.(error, event);
        }
        throw error;
      } finally {
        event.duration_ms = Math.round(performance.now() - startTime);

        if (shouldSample(event, config.sampling)) {
          void exporter.emit(event);
        }
      }
    }
  );
};
