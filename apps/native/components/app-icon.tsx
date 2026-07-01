import { Icon } from "@expo/ui";
import type { IconName } from "@expo/ui";
import { useThemeColor } from "heroui-native";

interface AppIconProps {
  color?: string;
  name: IconName;
  size?: number;
}

/**
 * A native @expo/ui icon — an SF Symbol on iOS, a Material Symbols XML vector
 * drawable on Android. Host-less; compose inside an <AppCard>/<Host>. `color`
 * defaults to the theme foreground, keeping icons on-brand without a per-call
 * color. Build the cross-platform `name` at the call site with
 * `Icon.select({ ios, android: import('@expo/material-symbols/<n>.xml') })` —
 * that literal call is what the Expo Babel plugin rewrites into a per-platform
 * `require` for Metro to tree-shake, so it can't be hidden behind a re-export.
 */
export const AppIcon = ({ color, name, size = 20 }: AppIconProps) => {
  const foreground = useThemeColor("foreground");

  return <Icon color={color ?? foreground} name={name} size={size} />;
};
