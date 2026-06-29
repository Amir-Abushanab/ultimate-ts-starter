import type { ButtonVariant, UniversalStyle } from "@expo/ui";

export type AppButtonVariant = "primary" | "secondary" | "destructive";

/**
 * Maps a semantic variant + the app's theme colors to the *universal* @expo/ui
 * Button's cross-platform props (`variant` + `style`). One place for branding,
 * and it works on iOS and Android from a single import — no per-platform
 * modifiers. (The universal components accept an RN `style` subset, so uniwind
 * could drive this via cssInterop too; here we read straight from the theme.)
 */
export const buttonVariantProps = (
  variant: AppButtonVariant,
  colors: { accent: string; danger: string }
): { style: UniversalStyle; variant: ButtonVariant } => {
  const byVariant = {
    destructive: {
      style: { backgroundColor: colors.danger },
      variant: "filled",
    },
    primary: {
      style: { backgroundColor: colors.accent },
      variant: "filled",
    },
    secondary: {
      style: { borderColor: colors.accent },
      variant: "outlined",
    },
  } satisfies Record<
    AppButtonVariant,
    { style: UniversalStyle; variant: ButtonVariant }
  >;

  return byVariant[variant];
};
