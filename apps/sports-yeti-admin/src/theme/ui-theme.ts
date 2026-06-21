import type { Theme } from '@sports-yeti/ui';
import { colors } from './colors';
import { spacing as appSpacing } from './spacing';
import { radii as appRadii } from './radii';
import { shadows as appShadows } from './shadows';
import { typography } from './typography';

/**
 * Admin web app's adapter to the @sports-yeti/ui Theme contract.
 *
 * Density is `compact` so form controls render at the tighter web
 * sizing (32-44px tall) and the popover variants of <Select>/<Combobox>
 * are preferred over bottom sheets.
 */
export const uiTheme: Theme = {
  name: 'sports-yeti-admin',
  density: 'compact',
  colors: {
    brand: {
      primary: colors.brand.primary,
      accent: colors.brand.accent,
      soft: colors.brand.soft,
      deep: colors.brand.deep,
      tint: colors.brand.tint,
    },
    surface: {
      bg: colors.surface.bg,
      card: colors.surface.card,
      chip: colors.surface.chip,
      chipMuted: colors.surface.chipMuted,
      overlay: colors.surface.overlay,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      muted: colors.text.muted,
      inverse: colors.text.inverse,
    },
    border: {
      hairline: colors.border.hairline,
      soft: colors.border.soft,
      strong: colors.border.strong,
    },
    status: {
      live: colors.status.live,
      success: colors.status.success,
      warning: colors.status.warning,
      error: colors.status.error,
      info: colors.status.info,
    },
  },
  spacing: {
    '2xs': appSpacing['2xs'],
    xs: appSpacing.xs,
    sm: appSpacing.sm,
    md: appSpacing.md,
    lg: appSpacing.lg,
    xl: appSpacing.xl,
    xxl: appSpacing.xxl,
    xxxl: appSpacing.xxxl,
    huge: appSpacing.huge,
  },
  radii: {
    sm: appRadii.sm,
    md: appRadii.md,
    lg: appRadii.lg,
    card: appRadii.card,
    cardLg: appRadii.cardLg,
    pill: appRadii.pill,
  },
  shadows: {
    card: appShadows.card,
    soft: appShadows.soft,
    popover: appShadows.popover,
  },
  typography: {
    h2: typography.h2,
    h3: typography.h3,
    body: typography.body,
    bodyLg: typography.bodyLg,
    bodySm: typography.bodySm,
    caption: typography.caption,
    eyebrow: typography.eyebrow,
    button: typography.button,
  },
};
