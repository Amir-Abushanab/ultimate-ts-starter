import { Column, Host } from "@expo/ui";
import { useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import type { ColorValue } from "react-native";

interface AppCardProps {
  children: ReactNode;
  seedColor?: ColorValue;
}

/**
 * An @expo/ui native island: one <Host> wrapping a theme-styled <Column>.
 * Children must be other @expo/ui components (AppText, AppButton, AppTextField)
 * — a native island can't hold RN/heroui children. This is the composition the
 * design components (Card/Surface) collapse to, since @expo/ui has no universal
 * Card. matchContents sizes the island to its content.
 *
 * Pass `seedColor` to theme the card's interactive controls (buttons, switches,
 * sliders): on iOS it becomes the SwiftUI tint, on Android a Material 3 palette.
 * It's a per-Host setting — every control in the card shares it, since the
 * universal controls expose no per-instance colour prop.
 */
export const AppCard = ({ children, seedColor }: AppCardProps) => {
  const surface = useThemeColor("surface");

  return (
    <Host matchContents seedColor={seedColor}>
      <Column
        spacing={12}
        style={{ backgroundColor: surface, borderRadius: 16, padding: 16 }}
      >
        {children}
      </Column>
    </Host>
  );
};
