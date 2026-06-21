import React, { useMemo } from 'react';
import {
  mergeThemeWithBrand,
  UIThemeProvider,
  useTheme,
  type OrgBrandLike,
} from '@sports-yeti/ui';

export interface OrgBrandingProviderProps {
  org: OrgBrandLike;
  children: React.ReactNode;
}

/**
 * Admin-app variant of OrgBrandingProvider. Identical to the mobile
 * variant. Used as the root of every org-scoped admin route — the
 * Phase 8 OrgSwitcher updates the org passed in here, and every
 * downstream surface reflects the new brand color.
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
