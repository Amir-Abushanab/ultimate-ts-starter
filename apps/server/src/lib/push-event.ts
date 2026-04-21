import { env } from "@ultimate-ts-starter/env/server";
import type {
  RealtimeEventName,
  RealtimeEvents,
} from "@ultimate-ts-starter/events";

/**
 * Push a real-time event to a specific user's Durable Object.
 * The DO broadcasts it to all of that user's connected WebSockets.
 *
 * @example
 * ```ts
 * await pushEvent("user-123", "notification", {
 *   id: "n1", type: "billing.payment_succeeded",
 *   title: "Payment received", body: "$49.00"
 * });
 * ```
 */
export const pushEvent = async <T extends RealtimeEventName>(
  userId: string,
  event: T,
  data: RealtimeEvents[T]
) => {
  const ns = env.USER_EVENTS as DurableObjectNamespace | undefined;
  if (ns === undefined) {
    return;
  }

  const id = ns.idFromName(userId);
  const stub = ns.get(id);

  await stub.fetch(
    new Request("http://do/push", {
      body: JSON.stringify({ data, event }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
  );
};
