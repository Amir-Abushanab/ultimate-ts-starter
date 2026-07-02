import { Slider } from "@expo/ui";

interface AppSliderProps {
  disabled?: boolean;
  max?: number;
  min?: number;
  onValueChange: (value: number) => void;
  step?: number;
  value: number;
}

/**
 * A native @expo/ui slider — cross-platform (iOS UISlider + Android Material
 * Slider). Host-less, so compose it inside an <AppCard>/<Host>. Fully
 * controlled: the parent owns `value`. `min`/`max` default to 0/1 in @expo/ui;
 * pass `step` for a stepped range. The minimum-track tints with the OS accent,
 * so there's no theme/style prop to drive.
 */
export const AppSlider = ({
  disabled,
  max,
  min,
  onValueChange,
  step,
  value,
}: AppSliderProps) => (
  <Slider
    disabled={disabled}
    max={max}
    min={min}
    step={step}
    value={value}
    onValueChange={onValueChange}
  />
);
