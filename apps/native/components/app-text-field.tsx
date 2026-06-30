import { TextInput, useNativeState } from "@expo/ui";

interface AppTextFieldProps {
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}

/**
 * A native @expo/ui text field. Host-less — compose inside an <AppCard>/<Host>.
 * Its value flows through @expo/ui's reactive primitive (`useNativeState` →
 * `ObservableState`) rather than RN's `useState`; `onChangeText` still reports
 * the string. Note: transformed/controlled inputs (e.g. cleaning an OTP and
 * reflecting it back) don't map cleanly to this model — that stays on heroui.
 */
export const AppTextField = ({
  onChangeText,
  placeholder,
  secureTextEntry,
}: AppTextFieldProps) => {
  const value = useNativeState("");

  return (
    <TextInput
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
    />
  );
};
