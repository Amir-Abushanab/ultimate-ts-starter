import { List } from "@expo/ui";
import type { ReactNode } from "react";

interface AppListProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
}

/**
 * A native @expo/ui virtualized list. Host-less; compose inside an
 * <AppCard>/<Host> and populate it with <AppListItem> children. Pass
 * `onRefresh` to enable the platform-native pull-to-refresh affordance — its
 * returned promise drives the indicator's visibility.
 */
export const AppList = ({ children, onRefresh }: AppListProps) => (
  <List onRefresh={onRefresh}>{children}</List>
);
