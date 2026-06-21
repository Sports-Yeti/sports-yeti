import {
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/provider';
import { ws } from '../primitives/pressable';
import { UIText } from '../text/ui-text';

export type SocialChannel = 'x' | 'facebook' | 'instagram' | 'linkedin';

const LABEL: Record<SocialChannel, string> = {
  x: 'X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

const COLOR: Record<SocialChannel, string> = {
  x: '#0F1419',
  facebook: '#1877F2',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
};

export interface SocialChannelChipProps {
  channel: SocialChannel;
  selected?: boolean;
  onPress?: () => void;
  /** When set, renders a small status dot in the corner (connected/expired). */
  status?: 'connected' | 'expired' | 'disconnected';
  style?: StyleProp<ViewStyle>;
}

/**
 * Toggleable channel chip used by the news cross-post composer and the
 * social integrations screen. Color-coded per channel for instant scan.
 */
export function SocialChannelChip({
  channel,
  selected = false,
  onPress,
  status,
  style,
}: SocialChannelChipProps) {
  const { colors, spacing, radii } = useTheme();
  const accent = COLOR[channel];
  const interactive = !!onPress;

  const dotColor =
    status === 'connected'
      ? colors.status.success
      : status === 'expired'
      ? colors.status.warning
      : status === 'disconnected'
      ? colors.text.muted
      : null;

  const Container: typeof Pressable | typeof View = interactive
    ? Pressable
    : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={interactive ? 'button' : undefined}
      accessibilityLabel={`${LABEL[channel]}${selected ? ', selected' : ''}`}
      accessibilityState={interactive ? { selected } : undefined}
      style={(s: PressableStateCallbackType) => [
        styles.chip,
        {
          backgroundColor: selected ? accent : colors.surface.chip,
          borderColor: selected ? accent : colors.border.strong,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs + 2,
          gap: spacing.xs,
          opacity: interactive && ws(s).pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: selected ? '#fff' : accent,
        }}
      />
      <UIText
        variant="bodySm"
        weight="600"
        color={selected ? '#fff' : colors.text.primary}
      >
        {LABEL[channel]}
      </UIText>
      {dotColor ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: dotColor,
          }}
        />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
});
