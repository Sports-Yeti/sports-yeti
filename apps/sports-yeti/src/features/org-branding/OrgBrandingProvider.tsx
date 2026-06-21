import React, { useMemo } from 'react';
import {
  mergeThemeWithBrand,
  UIThemeProvider,
  useTheme,
  type OrgBrandLike,
} from '@sports-yeti/ui';

export interface OrgBrandingProviderProps {
  /** Pass any object that has `brandColor` (and optional accent). */
  org: OrgBrandLike;
  children: React.ReactNode;
}

/**
 * Nests a second <UIThemeProvider> with the org's brand color overlaid
 * onto the active theme. Any child subtree picks up the new brand color
 * automatically — no per-component prop drilling.
 *
 * Use at the *boundary* of org-scoped surfaces (e.g., navigators that
 * only render org-owned content) so the rest of the app keeps the
 * default Yeti palette.
 *
 * Mobile + admin both use the same shape; the file is duplicated per
 * app per the plan's hybrid principle.
 */
export function OrgBrandingProvider({
  org,
  children,
}: OrgBrandingProviderProps) {
  const baseTheme = useTheme();
  const branded = useMemo(
    () => mergeThemeWithBrand(baseTheme, org),
    [baseTheme, org],
  );
  return <UIThemeProvider value={branded}>{children}</UIThemeProvider>;
}
