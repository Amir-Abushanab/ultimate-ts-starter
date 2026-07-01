import { Switch } from "@expo/ui";

interface AppSwitchProps {
  disabled?: boolean;
  label?: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

/**
 * A native @expo/ui toggle — cross-platform (iOS UISwitch + Android Material
 * Switch). Host-less, so compose it inside an <AppCard>/<Host>. Fully
 * controlled: the parent owns `value` (unlike <AppTextField>, which holds its
 * own native state). The universal Switch exposes no style/color prop — the
 * track tints with the OS accent — so there's nothing theme-driven to map here.
 */
export const AppSwitch = ({
  disabled,
  label,
  onValueChange,
  value,
}: AppSwitchProps) => (
  <Switch
    disabled={disabled}
    label={label}
    value={value}
    onValueChange={onValueChange}
  />
);
