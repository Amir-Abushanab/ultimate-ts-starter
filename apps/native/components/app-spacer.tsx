import { Spacer } from "@expo/ui";

interface AppSpacerProps {
  flexible?: boolean;
  size?: number;
}

/**
 * A native @expo/ui spacer — empty space between siblings in an <AppRow> or an
 * <AppCard> Column. Host-less. Give it a fixed `size`, or `flexible` to expand
 * along the main axis and push neighbours apart (e.g. a label at the start and
 * a value at the end of an <AppRow>).
 */
export const AppSpacer = ({ flexible, size }: AppSpacerProps) => (
  <Spacer flexible={flexible} size={size} />
);
