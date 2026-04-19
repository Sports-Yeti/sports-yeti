import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Shared theme contract consumed by every component in @sports-yeti/ui.
 *
 * Each app (mobile, admin) provides its own `Theme` instance via
 * `<UIThemeProvider value={appTheme}>`. The contract is intentionally
 * narrower than each app's full token set — it only includes the tokens
 * a portable form-control needs. Apps remain free to add their own
 * extensions in their local theme files.
 */
export interface ThemeColors {
  brand: {
    primary: string;
    accent: string;
    soft: string;
    deep: string;
    tint: string;
  };
  surface: {
    bg: string;
    card: string;
    chip: string;
    chipMuted: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    hairline: string;
    soft: string;
    strong: string;
  };
  status: {
    live: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface ThemeSpacing {
  '2xs': number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  huge: number;
}

export interface ThemeRadii {
  sm: number;
  md: number;
  lg: number;
  card: number;
  cardLg: number;
  pill: number;
}

export interface ThemeShadows {
  card: ViewStyle;
  soft: ViewStyle;
  popover: ViewStyle;
}

/**
 * The minimal text variants every app must provide. Each app's local
 * typography map can have many more variants for screens; these are
 * the ones the shared form components rely on.
 */
export type SharedTextVariant =
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyLg'
  | 'bodySm'
  | 'caption'
  | 'eyebrow'
  | 'button';

export type ThemeTypography = Record<SharedTextVariant, TextStyle>;

/**
 * Density hint. Mobile uses `comfortable` (44pt min-touch),
 * admin uses `compact` (32-38px controls).
 */
export type ThemeDensity = 'compact' | 'comfortable';

export interface Theme {
  name: string;
  density: ThemeDensity;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  typography: ThemeTypography;
}
