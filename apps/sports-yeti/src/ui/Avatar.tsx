import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii } from '../theme';
import { Text } from './Text';

interface AvatarProps {
  source?: ImageSourcePropType;
  uri?: string;
  size?: number;
  initials?: string;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({
  source,
  uri,
  size = 40,
  initials,
  bordered = false,
  style,
}: AvatarProps) {
  const imageSource = source ?? (uri ? { uri } : null);
  const dim = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={[
        styles.base,
        dim,
        bordered ? styles.bordered : null,
        style,
      ]}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={dim}
          resizeMode="cover"
          accessible
          accessibilityRole="image"
          accessibilityLabel={initials ? `${initials} profile photo` : 'Profile photo'}
        />
      ) : (
        <Text
          variant="button"
          color={colors.brand.deep}
          align="center"
        >
          {initials ?? '?'}
        </Text>
      )}
    </View>
  );
}

interface AvatarStackProps {
  uris: string[];
  size?: number;
  max?: number;
  totalCount?: number;
  style?: StyleProp<ViewStyle>;
}

export function AvatarStack({
  uris,
  size = 32,
  max = 3,
  totalCount,
  style,
}: AvatarStackProps) {
  const visible = uris.slice(0, max);
  const remaining =
    typeof totalCount === 'number'
      ? totalCount - visible.length
      : Math.max(uris.length - visible.length, 0);

  return (
    <View style={[styles.row, style]}>
      {visible.map((uri, idx) => (
        <View
          key={`${uri}-${idx}`}
          style={[
            styles.stackItem,
            idx > 0 ? { marginLeft: -size / 4 } : null,
          ]}
        >
          <Avatar uri={uri} size={size} bordered />
        </View>
      ))}
      {remaining > 0 ? (
        <View
          style={[
            styles.stackItem,
            styles.moreBubble,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -size / 4,
            },
          ]}
        >
          <Text
            variant="eyebrow"
            color={colors.text.primary}
            style={styles.moreText}
          >{`+${remaining}`}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#DFE3E7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackItem: {
    borderRadius: radii.pill,
  },
  moreBubble: {
    backgroundColor: colors.surface.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  moreText: {
    letterSpacing: 0,
    textTransform: 'none',
  },
});
