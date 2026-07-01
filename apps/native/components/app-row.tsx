import { Row } from "@expo/ui";
import type { UniversalAlignment } from "@expo/ui";
import type { ReactNode } from "react";

interface AppRowProps {
  alignment?: UniversalAlignment;
  children: ReactNode;
  spacing?: number;
}

/**
 * A native @expo/ui horizontal layout — the Row counterpart to <AppCard>'s
 * Column. Host-less, so compose it inside an <AppCard>/<Host>; its children must
 * be other @expo/ui islands (AppText, AppButton…), not RN/heroui nodes. Pair
 * with <AppSpacer flexible /> to push children to opposite ends. Spacing
 * defaults to the 12dp the Column uses, so rows and stacks line up.
 */
export const AppRow = ({ alignment, children, spacing = 12 }: AppRowProps) => (
  <Row alignment={alignment} spacing={spacing}>
    {children}
  </Row>
);
