import { Collapsible } from "@expo/ui";
import { useThemeColor } from "heroui-native";
import type { ReactNode } from "react";

interface AppCollapsibleProps {
  children: ReactNode;
  isOpen: boolean;
  label: string;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * A native @expo/ui disclosure — a tappable header that shows/hides its content.
 * Host-less; compose inside an <AppCard>/<Host> with @expo/ui children. Fully
 * controlled: the parent owns `isOpen`. The header label is theme-driven via
 * `labelStyle`, the one styled surface this primitive exposes.
 */
export const AppCollapsible = ({
  children,
  isOpen,
  label,
  onOpenChange,
}: AppCollapsibleProps) => {
  const foreground = useThemeColor("foreground");

  return (
    <Collapsible
      isOpen={isOpen}
      label={label}
      labelStyle={{ color: foreground, fontSize: 15, fontWeight: "600" }}
      onOpenChange={onOpenChange}
    >
      {children}
    </Collapsible>
  );
};
