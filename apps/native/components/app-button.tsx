import { Button } from "@expo/ui";
import { useThemeColor } from "heroui-native";

import { buttonVariantProps } from "@/native-ui/button-variants";
import type { AppButtonVariant } from "@/native-ui/button-variants";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
}

/**
 * A native @expo/ui button with a heroui-shaped API — cross-platform (iOS
 * SwiftUI + Android Jetpack Compose). Host-less, so compose it inside an
 * <AppCard> or a <Host>; @expo/ui renders native islands and can't hold RN
 * children. The variant + theme colors map to the universal Button's `variant`
 * + `style` props (see native-ui/button-variants).
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
    <Button
      label={label}
      style={props.style}
      variant={props.variant}
      onPress={onPress}
    />
  );
};
