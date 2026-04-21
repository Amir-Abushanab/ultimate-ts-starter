/**
 * Shared design tokens as TS values.
 * Useful for native code that needs programmatic color access
 * (e.g. StatusBar, NavigationContainer theme, react-navigation).
 *
 * These mirror the CSS custom properties in tokens.css.
 */

export const primitives = {
  black: "oklch(0% 0 0)",
  eclipse: "oklch(0.2103 0.0059 285.89)",
  snow: "oklch(0.9911 0 0)",
  white: "oklch(100% 0 0)",
} as const;

export const accent = {
  blue: "oklch(0.6204 0.195 253.83)",
} as const;

export const status = {
  green: "oklch(0.7329 0.1935 150.81)",
  red: "oklch(0.6532 0.2328 25.74)",
  redDark: "oklch(0.594 0.1967 24.63)",
  yellow: "oklch(0.7819 0.1585 72.33)",
  yellowDark: "oklch(0.8203 0.1388 76.34)",
} as const;

export const neutral = {
  100: "oklch(0.9524 0.0013 286.37)",
  200: "oklch(0.9373 0.0013 286.37)",
  300: "oklch(0.94 0.001 286.375)",
  400: "oklch(0.90 0.004 286.32)",
  50: "oklch(0.9702 0 0)",
  500: "oklch(0.74 0.004 286.32)",
  600: "oklch(0.5517 0.0138 285.94)",
  700: "oklch(0.40 0.006 286.033)",
  800: "oklch(0.274 0.006 286.033)",
  850: "oklch(0.257 0.0037 286.14)",
  900: "oklch(0.12 0.005 285.823)",
} as const;

export const chart = {
  1: "oklch(0.809 0.105 251.81)",
  2: "oklch(0.623 0.214 259.82)",
  3: "oklch(0.546 0.245 262.88)",
  4: "oklch(0.488 0.243 264.38)",
  5: "oklch(0.424 0.199 265.64)",
} as const;

export const radius = "0.5rem";
