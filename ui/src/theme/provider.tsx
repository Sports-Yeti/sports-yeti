import React, { createContext, useContext, useMemo } from 'react';
import type { Theme, ThemeDensity } from './types';

const ThemeContext = createContext<Theme | null>(null);

export interface UIThemeProviderProps {
  value: Theme;
  children: React.ReactNode;
}

export function UIThemeProvider({ value, children }: UIThemeProviderProps) {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      '@sports-yeti/ui: useTheme() called outside of <UIThemeProvider>. ' +
        'Wrap your app root with <UIThemeProvider value={theme}> using a theme that conforms to the Theme interface.',
    );
  }
  return ctx;
}

/**
 * Convenience hook for pulling token slices in components.
 * Avoids repetitive `useTheme().colors.text.primary` chains.
 */
export function useTokens() {
  const t = useTheme();
  return useMemo(
    () => ({
      colors: t.colors,
      spacing: t.spacing,
      radii: t.radii,
      shadows: t.shadows,
      typography: t.typography,
      density: t.density,
    }),
    [t],
  );
}

/**
 * Density-aware sizing helper. Components call this with both values
 * and get the right one for the current theme.
 */
export function useDensityValue<T>(
  values: Record<ThemeDensity, T>,
): T {
  const { density } = useTheme();
  return values[density];
}
