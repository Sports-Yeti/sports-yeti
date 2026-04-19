import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import type { SharedTextVariant } from '../theme/types';

export interface UITextProps extends Omit<RNTextProps, 'style'> {
  variant?: SharedTextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
  style?: TextStyle | TextStyle[];
}

/**
 * Internal Text component used by every form control. Resolves typography
 * variants from the active theme so the same form control reads correctly
 * on mobile (Plus Jakarta + Be Vietnam Pro named families) and admin (web
 * font-family + numeric weight).
 *
 * App screens should keep using their existing top-level <Text> from
 * apps/<app>/src/ui/Text.tsx — this is intentionally a smaller surface
 * just for what FormField + form controls need.
 */
export function UIText({
  variant = 'body',
  color,
  align,
  weight,
  style,
  ...rest
}: UITextProps) {
  const { typography, colors } = useTheme();

  return (
    <RNText
      {...rest}
      style={[
        typography[variant],
        { color: color ?? colors.text.primary },
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style as TextStyle,
      ]}
    />
  );
}
