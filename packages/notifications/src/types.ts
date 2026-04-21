import { z } from "zod";

/**
 * Notification channels.
 * Each notification type can be sent via one or more channels.
 */
export const channels = ["in_app", "email", "push"] as const;
export type Channel = (typeof channels)[number];

/**
 * Notification categories.
 * Group related notification types for user preference management.
 */
export const categories = [
  "account",
  "billing",
  "marketing",
  "security",
  "social",
  "system",
] as const;
export type Category = (typeof categories)[number];

/**
 * Notification types — extend this as your app grows.
 * Each type belongs to a category and has default channel settings.
 */
export const notificationTypes = {
  // Billing — email is always sent (mandatory), not shown in preferences UI
  "billing.payment_failed": {
    category: "billing" as const,
    defaults: { email: true, in_app: true, push: true },
    description: "Payment failed",
    mandatory: { email: true },
  },
  "billing.payment_succeeded": {
    category: "billing" as const,
    defaults: { email: true, in_app: true, push: false },
    description: "Payment processed successfully",
    mandatory: { email: true },
  },
  "billing.subscription_renewed": {
    category: "billing" as const,
    defaults: { email: true, in_app: true, push: false },
    description: "Subscription renewed",
    mandatory: { email: true },
  },

  // Security
  "security.2fa_enabled": {
    category: "security" as const,
    defaults: { email: true, in_app: true, push: false },
    description: "Two-factor authentication enabled",
    mandatory: {},
  },
  "security.login": {
    category: "security" as const,
    defaults: { email: true, in_app: true, push: true },
    description: "New sign-in to your account",
    mandatory: {},
  },

  // Social / organization
  "social.member_joined": {
    category: "social" as const,
    defaults: { email: false, in_app: true, push: false },
    description: "New member joined your organization",
    mandatory: {},
  },
  "social.org_invite": {
    category: "social" as const,
    defaults: { email: true, in_app: true, push: true },
    description: "Invited to an organization",
    mandatory: {},
  },

  // System — maintenance email is always sent (mandatory)
  "system.maintenance": {
    category: "system" as const,
    defaults: { email: true, in_app: true, push: false },
    description: "Scheduled maintenance",
    mandatory: { email: true },
  },
} as const;

export type NotificationType = keyof typeof notificationTypes;

/**
 * User notification preference — per notification type, per channel.
 */
export const preferencesSchema = z.record(
  // notification type
  z.string(),
  z.object({
    email: z.boolean(),
    in_app: z.boolean(),
    push: z.boolean(),
  })
);

export type Preferences = z.infer<typeof preferencesSchema>;

/**
 * A notification payload to be dispatched.
 */
export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  url?: string;
}

/**
 * A stored in-app notification.
 */
export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  url?: string;
  read: boolean;
  createdAt: string;
}
