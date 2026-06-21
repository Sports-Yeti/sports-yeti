import type { TextStyle } from 'react-native';

// Admin runs on react-native-web with system fonts.
// We name a brand-leading family with a tight system fallback chain.
const SANS =
  'PlusJakartaSans, "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const BODY =
  'BeVietnamPro, "Be Vietnam Pro", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const fontFamilies = {
  display: SANS,
  body: BODY,
} as const;

export type TypographyVariant =
  | 'displayLg'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLg'
  | 'bodySm'
  | 'caption'
  | 'eyebrow'
  | 'button'
  | 'mono';

export const typography: Record<TypographyVariant, TextStyle> = {
  // "Summit" hero title — only used for top-level page headers
  // (Glacier ethos §3 "Display-LG").
  displayLg: {
    fontFamily: SANS,
    fontWeight: '800',
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.12,
  },
  display: {
    fontFamily: SANS,
    fontWeight: '800',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  h1: {
    fontFamily: SANS,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: SANS,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
  },
  h3: {
    fontFamily: SANS,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  h4: {
    fontFamily: SANS,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  bodyLg: {
    fontFamily: BODY,
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontFamily: BODY,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: BODY,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: BODY,
    fontSize: 12,
    lineHeight: 16,
  },
  eyebrow: {
    fontFamily: SANS,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: SANS,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  mono: {
    fontFamily:
      'SFMono-Regular, ui-monospace, Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 12,
    lineHeight: 18,
  },
};
