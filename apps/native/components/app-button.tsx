import { Button, Host } from "@expo/ui/swift-ui";
import { useThemeColor } from "heroui-native";

import { buttonModifiers } from "@/native-ui/modifiers";
import type { ButtonVariant } from "@/native-ui/modifiers";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}

/**
 * A native @expo/ui button with a heroui-shaped API. The variant maps to native
 * SwiftUI modifiers (see native-ui/modifiers), driven by the same theme tokens
 * the rest of the app uses — so branding stays centralized without className.
 * Each instance hosts its own native island; group several under one <Host> in
 * real screens to avoid per-button hosts.
 */
export const AppButton = ({
  label,
  onPress,
  variant = "primary",
}: AppButtonProps) => {
  const accent = useThemeColor("accent");
  const danger = useThemeColor("danger");

  return (
    <Host matchContents>
      <Button
        label={label}
        modifiers={buttonModifiers(variant, { accent, danger })}
        role={variant === "destructive" ? "destructive" : "default"}
        onPress={onPress}
      />
    </Host>
  );
};
