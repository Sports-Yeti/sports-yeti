import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';

export type OrgAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface OrgAvatarProps {
  name: string;
  logoUrl?: string;
  /** Brand color used for the ring + initials fallback. */
  brandColor?: string;
  size?: OrgAvatarSize;
  /** Whether to render the colored ring around the avatar (org branding). */
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Org-scoped avatar. Renders the org logo with an optional brand-color
 * ring — the ring is the consistent visual signal that you're inside
 * org-scoped content (Org Pulse, league/division detail, news).
 */
export function OrgAvatar({
  name,
  logoUrl,
  brandColor,
  size = 'md',
  ring = true,
  style,
}: OrgAvatarProps) {
  const { colors } = useTheme();
  const ringColor = brandColor ?? colors.brand.primary;
  const dim = sizeToDim(size);
  const innerDim = dim - (ring ? 6 : 0);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.outer,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          padding: ring ? 3 : 0,
          backgroundColor: ring ? ringColor : 'transparent',
        },
        style,
      ]}
    >
      <View
        style={{
          width: innerDim,
          height: innerDim,
          borderRadius: innerDim / 2,
          overflow: 'hidden',
          backgroundColor: ringColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {logoUrl ? (
          <Image
            accessibilityLabel={`${name} logo`}
            source={{ uri: logoUrl }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <UIText
            variant="button"
            color={colors.text.inverse}
            style={{ fontSize: Math.round(innerDim * 0.42), fontWeight: '700' }}
          >
            {initials || '?'}
          </UIText>
        )}
      </View>
    </View>
  );
}

function sizeToDim(size: OrgAvatarSize): number {
  switch (size) {
    case 'sm':
      return 28;
    case 'md':
      return 40;
    case 'lg':
      return 56;
    case 'xl':
      return 80;
  }
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
