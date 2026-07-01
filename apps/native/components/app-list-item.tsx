import { ListItem } from "@expo/ui";
import type { ReactNode } from "react";

interface AppListItemProps {
  children: ReactNode;
  leading?: ReactNode;
  onPress?: () => void;
  supportingText?: string;
  trailing?: ReactNode;
}

/**
 * A native @expo/ui list row for use inside <AppList>. Host-less. The headline
 * is the children; `leading`/`trailing` take @expo/ui islands (e.g. <AppIcon>)
 * for the start/end slots, and `supportingText` adds a secondary line. Provide
 * `onPress` to make the whole row tappable.
 */
export const AppListItem = ({
  children,
  leading,
  onPress,
  supportingText,
  trailing,
}: AppListItemProps) => (
  <ListItem
    leading={leading}
    supportingText={supportingText}
    trailing={trailing}
    onPress={onPress}
  >
    {children}
  </ListItem>
);
