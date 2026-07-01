import { Button } from "@expo/ui";

import { buttonVariant } from "@/native-ui/button-variants";
import type { AppButtonVariant } from "@/native-ui/button-variants";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
}

/**
 * A native @expo/ui button with a heroui-shaped API — cross-platform (iOS
 * SwiftUI + Android Jetpack Compose). Host-less, so compose it inside an
 * <AppCard>/<Host>. The universal Button has no per-instance colour; its
 * fill/tint comes from the enclosing Host's `seedColor` (set one on
 * <AppCard seedColor>). `variant` only picks the shape — filled or outlined.
 */
export const AppButton = ({
  label,
  onPress,
  variant = "primary",
}: AppButtonProps) => (
  <Button label={label} variant={buttonVariant(variant)} onPress={onPress} />
);
