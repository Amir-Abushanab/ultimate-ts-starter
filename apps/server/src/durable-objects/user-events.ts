import { encodeEvent } from "@ultimate-ts-starter/events";
import type {
  RealtimeEventName,
  RealtimeEvents,
} from "@ultimate-ts-starter/events";
import { DurableObject } from "cloudflare:workers";

/**
 * Per-user Durable Object that manages WebSocket connections.
 *
 * Each user gets one DO instance (keyed by userId).
 * Multiple tabs/devices connect via WebSocket to the same DO.
 * The server pushes events to the DO, which broadcasts to all connections.
 *
 * Uses the Hibernation API to avoid billing during idle periods.
 */
export class UserEvents extends DurableObject {
  /** Accept a new WebSocket connection */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }

      const pair = new WebSocketPair();
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- WebSocketPair returns untyped array
      const [client, server] = pair as unknown as [WebSocket, WebSocket];

      // Accept with hibernation — DO sleeps when no messages are flowing
      this.ctx.acceptWebSocket(server);

      // Send a connected event immediately
      server.send(encodeEvent("heartbeat", { ts: Date.now() }));

      return new Response(null, { status: 101, webSocket: client });
    }

    // POST /push — server-side push endpoint
    if (url.pathname === "/push" && request.method === "POST") {
      // eslint-disable-next-line typescript/no-unsafe-type-assertion -- request.json() returns any; shape validated by server push endpoint
      const body = (await request.json()) as {
        event: RealtimeEventName;
        data: RealtimeEvents[RealtimeEventName];
      };
      this.broadcast(body.event, body.data);
      return new Response("ok");
    }

    return new Response("Not found", { status: 404 });
  }

  /** Hibernation callback — handle incoming WebSocket messages */
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (message === "ping") {
      ws.send(encodeEvent("heartbeat", { ts: Date.now() }));
    }
  }

  /** Hibernation callback — clean up on disconnect */
  webSocketClose(_ws: WebSocket) {
    // Nothing to clean up — hibernation API handles connection tracking
  }

  /** Broadcast an event to all connected WebSockets */
  broadcast<T extends RealtimeEventName>(event: T, data: RealtimeEvents[T]) {
    const message = encodeEvent(event, data);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(message);
      } catch {
        // Connection already closed — hibernation will clean it up
      }
    }
  }
}
