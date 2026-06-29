import { buttonStyle, controlSize, tint } from "@expo/ui/swift-ui/modifiers";

export type ButtonVariant = "primary" | "secondary" | "destructive";

/**
 * The @expo/ui equivalent of a `cn()` / tailwind-variants map: the single place
 * branding lives. A variant + the app's theme colors map to native SwiftUI
 * modifiers, so call-sites stay declarative (`<AppButton variant="primary" />`)
 * even though there's no className styling on the native widgets.
 */
export const buttonModifiers = (
  variant: ButtonVariant,
  colors: { accent: string; danger: string }
) => {
  const byVariant = {
    destructive: [
      buttonStyle("borderedProminent"),
      tint(colors.danger),
      controlSize("large"),
    ],
    primary: [
      buttonStyle("borderedProminent"),
      tint(colors.accent),
      controlSize("large"),
    ],
    secondary: [
      buttonStyle("bordered"),
      tint(colors.accent),
      controlSize("large"),
    ],
  } satisfies Record<ButtonVariant, unknown[]>;

  return byVariant[variant];
};
