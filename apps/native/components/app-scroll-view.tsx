import { ScrollView } from "@expo/ui";
import type { ReactNode } from "react";

interface AppScrollViewProps {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
}

/**
 * A native @expo/ui scroll container. Host-less, so compose it inside an
 * <AppCard>/<Host>; its children must be @expo/ui islands. Defaults to vertical
 * scrolling; pass direction="horizontal" for a horizontal rail.
 */
export const AppScrollView = ({ children, direction }: AppScrollViewProps) => (
  <ScrollView direction={direction}>{children}</ScrollView>
);
