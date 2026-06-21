import type { TextStyle } from 'react-native';

export const fontFamilies = {
  displaySemiBold: 'PlusJakartaSans_600SemiBold',
  displayBold: 'PlusJakartaSans_700Bold',
  displayExtraBold: 'PlusJakartaSans_800ExtraBold',
  bodyRegular: 'BeVietnamPro_400Regular',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
} as const;

export type TypographyVariant =
  | 'display'
  | 'displaySm'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyLg'
  | 'bodySm'
  | 'caption'
  | 'eyebrow'
  | 'button';

export const typography: Record<TypographyVariant, TextStyle> = {
  display: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: -1.12,
  },
  displaySm: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  h1: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -1.2,
  },
  h2: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 25,
  },
  h3: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 18,
    lineHeight: 28.8,
  },
  body: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  eyebrow: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.35,
  },
};
