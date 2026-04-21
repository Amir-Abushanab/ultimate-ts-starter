/* eslint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-member-access, typescript/no-unsafe-return, typescript/no-unsafe-type-assertion -- React hooks resolve as error-typed in this package's lint environment (missing DOM/React types in tsconfig) */
import type {
  RealtimeEventName,
  RealtimeEvents,
} from "@ultimate-ts-starter/events";
import { decodeEvent } from "@ultimate-ts-starter/events";
import { useEffect, useRef, useState } from "react";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type EventHandlers = {
  [K in RealtimeEventName]?: (data: RealtimeEvents[K]) => void;
};

interface UseRealtimeOptions {
  /** WebSocket URL (e.g. ws://localhost:3000/api/events) */
  url: string;
  /** Reconnect after disconnect (default: true) */
  reconnect?: boolean;
  /** Reconnect delay in ms (default: 3000) */
  reconnectDelay?: number;
  /** Typed event handlers */
  onEvent?: EventHandlers;
}

/**
 * React hook for real-time events via WebSocket (Durable Object).
 *
 * Connects to the user's DO, receives typed events, auto-reconnects.
 *
 * @example
 * ```tsx
 * const { status } = useRealtime({
 *   url: `${env.VITE_SERVER_URL.replace("http", "ws")}/api/events`,
 *   onEvent: {
 *     notification: (data) => toast(data.title),
 *     invalidate: (data) => queryClient.invalidateQueries({ queryKey: data.queryKey }),
 *     presence: (data) => console.log(data.name, data.status),
 *   },
 * });
 * ```
 */
export const useRealtime = ({
  url,
  reconnect = true,
  reconnectDelay = 3000,
  onEvent,
}: UseRealtimeOptions) => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const handlersRef = useRef<EventHandlers | undefined>(onEvent);
  handlersRef.current = onEvent;
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let alive = true;

    const connect = () => {
      if (!alive) {
        return;
      }
      setStatus("connecting");

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        setStatus("connected");
      });

      ws.addEventListener("message", (e: MessageEvent<unknown>) => {
        const raw = String(e.data);
        const msg = decodeEvent(raw);
        if (!msg) {
          return;
        }

        const handler = handlersRef.current?.[msg.event];
        if (handler !== undefined) {
          (handler as (data: unknown) => void)(msg.data);
        }
      });

      ws.addEventListener("close", () => {
        setStatus("disconnected");
        wsRef.current = null;
        if (alive && reconnect) {
          reconnectTimer = setTimeout(connect, reconnectDelay);
        }
      });

      ws.addEventListener("error", () => {
        ws.close();
      });
    };

    connect();

    return () => {
      alive = false;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [url, reconnect, reconnectDelay]);

  return { status };
};

// Keep the old name as an alias for backwards compat
export const useEventStream = useRealtime;
