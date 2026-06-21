import type { Theme } from '@sports-yeti/ui';
import { colors } from './colors';
import { spacing as appSpacing } from './spacing';
import { radii as appRadii } from './radii';
import { shadows as appShadows } from './shadows';
import { typography } from './typography';

/**
 * Mobile app's adapter to the @sports-yeti/ui Theme contract.
 *
 * The shared package's <UIThemeProvider> is fed this object so every
 * form control resolves the right brand color, spacing scale, and font
 * family for the iOS/Android Expo bundle.
 *
 * Local theme files in this app stay the source of truth for tokens —
 * this adapter just rebrands them into the shape the shared package
 * needs (which uses subset of variants common to mobile + admin).
 */
export const uiTheme: Theme = {
  name: 'sports-yeti-mobile',
  density: 'comfortable',
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
      // Mobile theme still has the legacy non-AA status colors. We map
      // to the AA-compliant darker variants used in the admin theme so
      // form-control errors/successes stay readable on light surfaces.
      // (Tracked: design-system.md Backlog P0 #4 — the underlying tokens
      //  will be migrated app-wide in a follow-up pass.)
      success: '#2E7D32',
      warning: '#B26200',
      error: '#C62828',
      info: '#075985',
    },
  },
  spacing: {
    // Mobile spacing.ts doesn't export `'2xs'` yet — define it locally
    // here so the shared contract is satisfied without modifying the
    // legacy file (which other screens import directly).
    '2xs': 2,
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
    // Mobile only has card/soft/nav. Reuse `card` for popover surfaces
    // (selects, datepickers, comboboxes) — visually heavier than
    // `soft`, lighter than `nav`. Acceptable for sheet/popover use.
    popover: appShadows.card,
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
