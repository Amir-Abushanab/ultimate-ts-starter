import { Host, TextInput, useNativeState } from "@expo/ui";

interface AppTextFieldProps {
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

/**
 * A native @expo/ui text field, cross-platform from one import. Note the value
 * flows through @expo/ui's own reactive primitive (`useNativeState` →
 * `ObservableState`) rather than RN's `useState` — that's a real difference from
 * heroui/RN inputs. `onChangeText` still reports the string for app-side use.
 */
export const AppTextField = ({
  onChangeText,
  placeholder,
  secureTextEntry,
}: AppTextFieldProps) => {
  const value = useNativeState("");

  return (
    <Host matchContents>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </Host>
  );
};
