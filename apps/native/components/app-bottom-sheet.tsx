import { BottomSheet } from "@expo/ui";
import type { ReactNode } from "react";

interface AppBottomSheetProps {
  children: ReactNode;
  isPresented: boolean;
  onDismiss: () => void;
  snapPoints?: ("full" | "half")[];
}

/**
 * A native @expo/ui modal sheet that slides up from the bottom. Host-less, so
 * mount it inside an <AppCard>/<Host>; its children are @expo/ui islands. Fully
 * controlled: the parent owns `isPresented` and clears it in `onDismiss` (fired
 * on swipe-down / overlay tap). Omit `snapPoints` to auto-size to content.
 */
export const AppBottomSheet = ({
  children,
  isPresented,
  onDismiss,
  snapPoints,
}: AppBottomSheetProps) => (
  <BottomSheet
    isPresented={isPresented}
    snapPoints={snapPoints}
    onDismiss={onDismiss}
  >
    {children}
  </BottomSheet>
);
