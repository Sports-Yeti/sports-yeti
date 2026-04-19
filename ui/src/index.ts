// Theme contract + provider
export {
  UIThemeProvider,
  useTheme,
  useTokens,
  useDensityValue,
} from './theme/provider';
export type { UIThemeProviderProps } from './theme/provider';
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeRadii,
  ThemeShadows,
  ThemeTypography,
  ThemeDensity,
  SharedTextVariant,
} from './theme/types';

// Cross-platform primitives
export { ws } from './primitives/pressable';
export type { WebPressableState } from './primitives/pressable';
export { usePrefixedId } from './primitives/id';

// Internal text helper used by form controls
export { UIText } from './text/ui-text';
export type { UITextProps } from './text/ui-text';

// Form controls + hooks
export * from './forms';

// Dev-only — live gallery of every form primitive. Drop into any
// screen to verify the design system end-to-end.
export { FormControlsGallery } from './dev/form-controls-gallery';
