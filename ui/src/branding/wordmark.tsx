import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';

export type WordmarkSize = 'sm' | 'md' | 'lg';

export interface WordmarkProps {
  /** Override the brand color (e.g., on a dark surface). */
  color?: string;
  size?: WordmarkSize;
  style?: StyleProp<ViewStyle>;
  /** Hide the slash separator + sub-label (use for compact headers). */
  compact?: boolean;
  /** Sub-label rendered after the slash — defaults to "Sports Yeti". */
  subLabel?: string;
}

/**
 * Single canonical wordmark for the brand. Replaces every ad-hoc
 * <Text>SportsYeti</Text> / <Text>Sports Yeti</Text> across the codebase.
 */
export function Wordmark({
  color,
  size = 'md',
  style,
  compact = false,
  subLabel = 'Sports Yeti',
}: WordmarkProps) {
  const { colors } = useTheme();
  const fg = color ?? colors.brand.primary;
  const sizes: Record<WordmarkSize, { primary: number; sub: number; gap: number }> = {
    sm: { primary: 18, sub: 12, gap: 6 },
    md: { primary: 24, sub: 14, gap: 8 },
    lg: { primary: 36, sub: 18, gap: 12 },
  };
  const dims = sizes[size];

  return (
    <View style={[styles.row, { gap: dims.gap }, style]}>
      <UIText variant="h2" color={fg} style={{ fontSize: dims.primary, fontWeight: '800' }}>
        SY
      </UIText>
      {compact ? null : (
        <>
          <UIText
            variant="bodySm"
            color={colors.text.muted}
            style={{ fontSize: dims.sub }}
          >
            /
          </UIText>
          <UIText
            variant="bodySm"
            color={colors.text.secondary}
            style={{ fontSize: dims.sub, fontWeight: '600' }}
          >
            {subLabel}
          </UIText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
