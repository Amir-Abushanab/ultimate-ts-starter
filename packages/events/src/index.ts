/**
 * Shared real-time event types.
 * Used by both server (Durable Object) and client (WebSocket hook).
 *
 * Add new event types here as your app grows.
 * The server publishes these; the client subscribes to them.
 */

export interface RealtimeEvents {
  /** A notification was created for the user */
  notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    url?: string;
  };

  /** An org member came online or performed an action */
  presence: {
    userId: string;
    name: string;
    status: "online" | "offline" | "active";
  };

  /** Data was updated — client should refetch the given query key */
  invalidate: {
    queryKey: string[];
  };

  /** A background job completed */
  "job.completed": {
    jobId: string;
    result: "success" | "error";
    message?: string;
  };

  /** Server heartbeat (keep-alive) */
  heartbeat: {
    ts: number;
  };
}

export type RealtimeEventName = keyof RealtimeEvents;

/**
 * Wire format for messages over the WebSocket.
 */
export interface RealtimeMessage<
  T extends RealtimeEventName = RealtimeEventName,
> {
  event: T;
  data: RealtimeEvents[T];
}

/**
 * Serialize an event to send over WebSocket.
 */
export const encodeEvent = <T extends RealtimeEventName>(
  event: T,
  data: RealtimeEvents[T]
): string => JSON.stringify({ data, event } satisfies RealtimeMessage<T>);

/**
 * Deserialize a WebSocket message.
 */
export const decodeEvent = (raw: string): RealtimeMessage | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("event" in parsed) ||
      !("data" in parsed)
    ) {
      return null;
    }
    const obj: Record<string, unknown> = parsed as Record<string, unknown>;
    if (typeof obj.event !== "string") {
      return null;
    }
    // eslint-disable-next-line typescript/no-unsafe-type-assertion -- validated via runtime checks above
    return { data: obj.data, event: obj.event } as RealtimeMessage;
  } catch {
    return null;
  }
};
