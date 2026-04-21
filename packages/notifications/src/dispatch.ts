import { sendEmail } from "@ultimate-ts-starter/email";

import type { Channel, NotificationPayload, Preferences } from "./types.js";
import { notificationTypes } from "./types.js";

export interface DispatchContext {
  /** User's email address */
  email: string;
  /** User's notification preferences (null = use defaults) */
  preferences: Preferences | null;
  /** Resend API key */
  resendApiKey: string;
  /** From email address */
  resendFromEmail: string;
  /** Optional: store in-app notification callback */
  storeInApp?: (notification: NotificationPayload) => Promise<void>;
  /** Optional: send push notification callback */
  sendPush?: (notification: NotificationPayload) => Promise<void>;
  /** Optional: send SSE event callback */
  sendSSE?: (notification: NotificationPayload) => void;
}

/**
 * Determine which channels are enabled for a notification type.
 */
const getEnabledChannels = (
  type: NotificationPayload["type"],
  preferences: Preferences | null
): Record<Channel, boolean> => {
  const typeDef = notificationTypes[type];
  const userPref = preferences?.[type] ?? typeDef.defaults;
  // Enforce mandatory channels — user can't disable these
  const mandatory: Partial<Record<Channel, boolean>> = typeDef.mandatory ?? {};
  return {
    email: mandatory.email ?? userPref.email,
    in_app: mandatory.in_app ?? userPref.in_app,
    push: mandatory.push ?? userPref.push,
  };
};

/**
 * Dispatch a notification to all enabled channels.
 * Respects the user's notification preferences.
 */
export const dispatch = async (
  payload: NotificationPayload,
  ctx: DispatchContext
) => {
  const channels = getEnabledChannels(payload.type, ctx.preferences);

  const tasks: Promise<void>[] = [];

  if (channels.in_app && ctx.storeInApp) {
    tasks.push(ctx.storeInApp(payload));
  }

  if (channels.in_app && ctx.sendSSE) {
    ctx.sendSSE(payload);
  }

  if (channels.email) {
    tasks.push(
      (async () => {
        await sendEmail({
          apiKey: ctx.resendApiKey,
          from: ctx.resendFromEmail,
          html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="margin: 0 0 12px;">${payload.title}</h2>
            <p style="color: #666; margin: 0 0 24px;">${payload.body}</p>
            ${payload.url === undefined ? "" : `<a href="${payload.url}" style="color: #2563eb;">View details</a>`}
          </div>
        `,
          subject: payload.title,
          to: ctx.email,
        });
      })()
    );
  }

  if (channels.push && ctx.sendPush) {
    tasks.push(ctx.sendPush(payload));
  }

  await Promise.allSettled(tasks);
};
