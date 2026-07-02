import { Picker } from "@expo/ui";
import type { PickerItemValue } from "@expo/ui";

interface AppPickerOption<T extends PickerItemValue> {
  label: string;
  value: T;
}

interface AppPickerProps<T extends PickerItemValue> {
  appearance?: "menu" | "wheel";
  onValueChange: (value: T) => void;
  options: readonly AppPickerOption<T>[];
  selectedValue: T;
}

/**
 * A native @expo/ui single-select — cross-platform (iOS menu/wheel + Android
 * dropdown). Host-less, so compose it inside an <AppCard>/<Host>. Takes a
 * heroui-shaped `options` array and expands it to the <Picker.Item> children
 * that @expo/ui expects, so consumers declare data, not markup. Generic over
 * the option value (string | number) so `selectedValue`/`onValueChange` is typed.
 */
export const AppPicker = <T extends PickerItemValue>({
  appearance,
  onValueChange,
  options,
  selectedValue,
}: AppPickerProps<T>) => (
  <Picker
    appearance={appearance}
    selectedValue={selectedValue}
    onValueChange={onValueChange}
  >
    {options.map((option) => (
      <Picker.Item
        key={String(option.value)}
        label={option.label}
        value={option.value}
      />
    ))}
  </Picker>
);
