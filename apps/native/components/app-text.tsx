import { Text } from "@expo/ui";
import type { UniversalTextStyle } from "@expo/ui";
import { useThemeColor } from "heroui-native";

type AppTextVariant = "title" | "body" | "muted";

interface AppTextProps {
  children: string;
  variant?: AppTextVariant;
}

/**
 * Native @expo/ui text with theme-driven variants. Host-less — use inside an
 * <AppCard>/<Host>. Aliased away from RN's `Text` so screens can import both.
 */
export const AppText = ({ children, variant = "body" }: AppTextProps) => {
  const foreground = useThemeColor("foreground");
  const muted = useThemeColor("muted");

  const styles: Record<AppTextVariant, UniversalTextStyle> = {
    body: { color: foreground, fontSize: 15 },
    muted: { color: muted, fontSize: 13 },
    title: { color: foreground, fontSize: 18, fontWeight: "600" },
  };

  return <Text textStyle={styles[variant]}>{children}</Text>;
};
