import type { ButtonVariant } from "@expo/ui";

export type AppButtonVariant = "primary" | "secondary" | "destructive";

/**
 * Maps a semantic variant to the *universal* @expo/ui Button's `variant` — its
 * shape (filled vs. outlined). The universal Button has no per-instance colour
 * prop: the fill/tint comes from the enclosing <Host seedColor> (the SwiftUI
 * tint on iOS, a Material 3 palette on Android). So colour is a Host concern
 * (see <AppCard seedColor>) and this only picks the shape.
 */
export const buttonVariant = (variant: AppButtonVariant): ButtonVariant => {
  const byVariant = {
    destructive: "filled",
    primary: "filled",
    secondary: "outlined",
  } satisfies Record<AppButtonVariant, ButtonVariant>;

  return byVariant[variant];
};
