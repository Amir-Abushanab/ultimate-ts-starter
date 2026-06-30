import { Column, Host } from "@expo/ui";
import { useThemeColor } from "heroui-native";
import type { ReactNode } from "react";

interface AppCardProps {
  children: ReactNode;
}

/**
 * An @expo/ui native island: one <Host> wrapping a theme-styled <Column>.
 * Children must be other @expo/ui components (AppText, AppButton, AppTextField)
 * — a native island can't hold RN/heroui children. This is the composition the
 * design components (Card/Surface) collapse to, since @expo/ui has no universal
 * Card. matchContents sizes the island to its content.
 */
export const AppCard = ({ children }: AppCardProps) => {
  const surface = useThemeColor("surface");

  return (
    <Host matchContents>
      <Column
        spacing={12}
        style={{ backgroundColor: surface, borderRadius: 16, padding: 16 }}
      >
        {children}
      </Column>
    </Host>
  );
};
