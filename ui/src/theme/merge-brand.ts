import type { Theme } from './types';

export interface OrgBrandLike {
  brandColor: string;
  brandColorAccent?: string;
}

/**
 * Returns a new Theme with the given org's brand color overlaid onto
 * `colors.brand.primary` + `colors.brand.accent`. Used to nest a second
 * <UIThemeProvider> at the org boundary so org-scoped surfaces render
 * with the org's colors automatically — no per-component prop drilling.
 *
 * Soft + deep colors are derived from the brand color via simple
 * lighten/darken — good enough for mock data; per-org explicit overrides
 * can be added later in the Theme contract if needed.
 */
export function mergeThemeWithBrand(theme: Theme, org: OrgBrandLike): Theme {
  const primary = org.brandColor;
  const accent = org.brandColorAccent ?? primary;
  return {
    ...theme,
    colors: {
      ...theme.colors,
      brand: {
        primary,
        accent,
        soft: lighten(primary, 0.85),
        deep: darken(primary, 0.4),
        tint: lighten(primary, 0.7),
      },
    },
  };
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB | null {
  if (!hex.startsWith('#') || hex.length !== 7) return null;
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b]
    .map((c) => clamp(c).toString(16).padStart(2, '0'))
    .join('')}`;
}

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex({
    r: rgb.r + (255 - rgb.r) * amount,
    g: rgb.g + (255 - rgb.g) * amount,
    b: rgb.b + (255 - rgb.b) * amount,
  });
}

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex({
    r: rgb.r * (1 - amount),
    g: rgb.g * (1 - amount),
    b: rgb.b * (1 - amount),
  });
}
