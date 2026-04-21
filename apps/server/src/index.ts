// Re-export Durable Object class for wrangler
export { UserEvents } from "./durable-objects/user-events";

import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createServerAnalytics } from "@ultimate-ts-starter/analytics/server";
import { createContext } from "@ultimate-ts-starter/api/context";
import { appRouter } from "@ultimate-ts-starter/api/routers/index";
import { createAuth } from "@ultimate-ts-starter/auth";
import { env } from "@ultimate-ts-starter/env/server";
import { wideEvent } from "@ultimate-ts-starter/logging/middleware";
import type { WideEventVariables } from "@ultimate-ts-starter/logging/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

const posthogConfig = (() => {
  try {
    return { apiKey: env.POSTHOG_API_KEY, host: env.POSTHOG_HOST };
  } catch {
    return { apiKey: undefined, host: undefined };
  }
})();

const { client: serverAnalytics } = createServerAnalytics(posthogConfig);

const app = new Hono<{ Variables: WideEventVariables }>();

app.use(
  wideEvent({
    onError: (error, event) => {
      // Always log to console
      console.error(`[${event.method} ${event.path}]`, error);
      // Also send to PostHog if configured
      serverAnalytics.captureException(error, {
        method: event.method,
        path: event.path,
        request_id: event.request_id,
        userId: typeof event.user_id === "string" ? event.user_id : undefined,
      });
    },
    service: "server",
  })
);
app.use(secureHeaders());
app.use(
  "/*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    origin: env.CORS_ORIGIN,
  })
);

// ── Rate limiting (sliding window, in-memory) ──────────────
// Defense in depth — Cloudflare handles volumetric attacks,
// this catches per-IP abuse on auth and API endpoints.
// NOTE: This map is per-isolate on Workers. At scale, replace
// with Durable Objects, KV, or Cloudflare's Rate Limiting product.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
// requests per minute
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

app.use("/api/auth/*", async (c, next) => {
  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for") ??
    "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > RATE_LIMIT) {
      c.res = new Response("Too Many Requests", { status: 429 });
      c.res.headers.set(
        "Retry-After",
        String(Math.ceil((entry.resetAt - now) / 1000))
      );
      return;
    }
  }

  await next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => createAuth().handler(c.req.raw));

// ── API documentation ───────────────────────────
app.get("/api-docs", (c) =>
  c.html(`<!doctype html>
<html>
  <head>
    <title>API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>body { margin: 0; }</style>
  </head>
  <body>
    <script id="api-reference" data-url="/api-reference/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`)
);

export const apiHandler = new OpenAPIHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error("[oRPC]", error);
      if (error instanceof Error) {
        serverAnalytics.captureException(error);
      }
    }),
  ],
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error("[oRPC]", error);
      if (error instanceof Error) {
        serverAnalytics.captureException(error);
      }
    }),
  ],
});

app.use("/*", async (c, next) => {
  const event = c.get("wideEvent");
  // eslint-disable-next-line typescript/no-unsafe-assignment -- Hono context type includes `any` in its generics
  const context = await createContext({ context: c });

  if (context.session) {
    event.user_id = context.session.user.id;
  }

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    context,
    prefix: "/rpc",
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    context,
    prefix: "/api-reference",
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
  return c.res;
});

// ── File uploads (R2, auth required) ────────────
app.post("/api/upload", async (c) => {
  const session = await createAuth().api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const bucket = env.R2_BUCKET as R2Bucket | undefined;
  if (bucket === undefined) {
    return c.json({ error: "R2 not configured" }, 503);
  }

  const formData = await c.req.formData();
  // eslint-disable-next-line typescript/no-unsafe-type-assertion -- Cloudflare Workers FormData returns File-like objects
  const file = formData.get("file") as unknown as {
    name: string;
    type: string;
    stream(): ReadableStream;
  } | null;
  if (file?.name === undefined) {
    return c.json({ error: "No file provided" }, 400);
  }

  const key = `${crypto.randomUUID()}/${file.name}`;
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return c.json({ key, url: `/api/files/${key}` });
});

app.get("/api/files/:key{.+}", async (c) => {
  const bucket = env.R2_BUCKET as R2Bucket | undefined;
  if (bucket === undefined) {
    return c.json({ error: "R2 not configured" }, 503);
  }

  const object = await bucket.get(c.req.param("key"));
  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
});

// ── Real-time WebSocket (via Durable Object) ────
app.get("/api/events", async (c) => {
  const session = await createAuth().api.getSession({
    headers: c.req.raw.headers,
  });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const ns = env.USER_EVENTS as DurableObjectNamespace | undefined;
  if (ns === undefined) {
    return c.json({ error: "Real-time not configured" }, 503);
  }

  // Route to the user's Durable Object
  const id = ns.idFromName(session.user.id);
  const stub = ns.get(id);
  return stub.fetch(
    new Request("http://do/ws", {
      headers: c.req.raw.headers,
    })
  );
});

// ── Webhooks ────────────────────────────────────
app.post("/api/webhooks/:provider", async (c) => {
  const provider = c.req.param("provider");
  const event = c.get("wideEvent");
  event.webhook_provider = provider;

  const body = await c.req.text();
  const signature =
    c.req.header("webhook-signature") ??
    c.req.header("x-webhook-signature") ??
    c.req.header("stripe-signature") ??
    "";

  event.webhook_has_signature = signature.length > 0;

  // TODO: verify signature per provider using their SDK/secret
  // Example for Polar:
  //   import { validateEvent } from "@polar-sh/sdk/webhooks";
  //   const event = validateEvent(body, headers, env.POLAR_WEBHOOK_SECRET);

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  event.webhook_event_type =
    typeof payload === "object" &&
    payload !== null &&
    "type" in payload &&
    typeof payload.type === "string"
      ? payload.type
      : "unknown";

  // Dispatch by provider
  switch (provider) {
    case "polar": {
      // Handle Polar payment events (checkout.completed, subscription.updated, etc.)
      console.log(`[webhook:polar] ${String(event.webhook_event_type)}`);
      break;
    }
    default: {
      return c.json({ error: "Unknown provider" }, 404);
    }
  }

  return c.json({ received: true });
});

// ── Health check ────────────────────────────────
app.get("/", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.get("/health", async (c) => {
  const checks: Record<string, { status: string; latency_ms?: number }> = {};

  try {
    const start = performance.now();
    const { createDb } = await import("@ultimate-ts-starter/db");
    const db = createDb();
    await db.execute("SELECT 1");
    checks.database = {
      latency_ms: Math.round(performance.now() - start),
      status: "ok",
    };
  } catch {
    checks.database = { status: "error" };
  }

  const allOk = Object.values(checks).every((ch) => ch.status === "ok");

  return c.json(
    {
      checks,
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
    },
    allOk ? 200 : 503
  );
});

// ── Cron handler (Cloudflare Scheduled Events) ──
export default {
  fetch: app.fetch,
  scheduled(event: ScheduledEvent, _env: Env, _ctx: ExecutionContext) {
    console.log(
      `[cron] trigger: ${event.cron} at ${new Date(event.scheduledTime).toISOString()}`
    );
    // Add your scheduled tasks here:
    // - Clean up expired sessions
    // - Send digest emails
    // - Sync external data
  },
};
