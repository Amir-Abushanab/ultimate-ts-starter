import { Checkbox } from "@expo/ui";

interface AppCheckboxProps {
  disabled?: boolean;
  label?: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

/**
 * A native @expo/ui checkbox — cross-platform (iOS + Android Material). Host-less,
 * so compose it inside an <AppCard>/<Host>. Fully controlled: the parent owns
 * `value`. Like <AppSwitch> it has no style/color surface — the box uses the OS
 * accent — so this is a thin, app-namespaced, island-documented wrapper.
 */
export const AppCheckbox = ({
  disabled,
  label,
  onValueChange,
  value,
}: AppCheckboxProps) => (
  <Checkbox
    disabled={disabled}
    label={label}
    value={value}
    onValueChange={onValueChange}
  />
);
