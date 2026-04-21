import { z } from "zod";

export const updatePreferencesSchema = z.object({
  email: z.boolean(),
  in_app: z.boolean(),
  push: z.boolean(),
  type: z.string(),
});

export const markReadSchema = z.object({
  notificationId: z.string(),
});

export const markAllReadSchema = z.object({});

export type UpdatePreferences = z.infer<typeof updatePreferencesSchema>;
export type MarkRead = z.infer<typeof markReadSchema>;
