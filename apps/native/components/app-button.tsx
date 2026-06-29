import { Button, Host } from "@expo/ui";
import { useThemeColor } from "heroui-native";

import { buttonVariantProps } from "@/native-ui/button-variants";
import type { AppButtonVariant } from "@/native-ui/button-variants";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
}

/**
 * A native @expo/ui button with a heroui-shaped API — cross-platform from one
 * import (iOS SwiftUI + Android Jetpack Compose under the hood). The variant +
 * theme colors map to the universal Button's `variant` + `style` props (see
 * native-ui/button-variants), so branding stays centralized with no per-platform
 * code. Each instance hosts its own native island; in real screens wrap several
 * components under a single <Host>.
 */
export const AppButton = ({
  label,
  onPress,
  variant = "primary",
}: AppButtonProps) => {
  const accent = useThemeColor("accent");
  const danger = useThemeColor("danger");
  const props = buttonVariantProps(variant, { accent, danger });

  return (
    <Host matchContents>
      <Button
        label={label}
        style={props.style}
        variant={props.variant}
        onPress={onPress}
      />
    </Host>
  );
};
