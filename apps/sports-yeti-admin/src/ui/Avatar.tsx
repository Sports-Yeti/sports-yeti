import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme';
import { Text } from './Text';

export interface AvatarProps {
  uri?: string | null;
  initials?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Avatar({
  uri,
  initials = 'A',
  size = 36,
  style,
  accessibilityLabel,
}: AvatarProps) {
  const radius = size / 2;
  const fontSize = Math.round(size * 0.4);
  const a11y = accessibilityLabel ?? `Avatar for ${initials}`;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        accessibilityLabel={a11y}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: radius },
          style,
        ]}
      />
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={a11y}
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      <Text variant="button" color={colors.brand.deep} style={{ fontSize }}>
        {initials.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

interface AvatarStackProps {
  uris: (string | null | undefined)[];
  initials?: string[];
  max?: number;
  totalCount?: number;
  size?: number;
}

export function AvatarStack({
  uris,
  initials = [],
  max = 4,
  totalCount,
  size = 28,
}: AvatarStackProps) {
  const visible = uris.slice(0, max);
  const remaining =
    typeof totalCount === 'number' ? totalCount - visible.length : uris.length - visible.length;

  return (
    <View style={styles.stack}>
      {visible.map((uri, idx) => (
        <View
          key={`${uri ?? 'a'}-${idx}`}
          style={[
            styles.stackItem,
            { marginLeft: idx === 0 ? 0 : -size / 4 },
          ]}
        >
          <Avatar uri={uri ?? null} initials={initials[idx] ?? 'A'} size={size} />
        </View>
      ))}
      {remaining > 0 ? (
        <View
          style={[
            styles.more,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -size / 4,
            },
          ]}
        >
          <Text variant="caption" color={colors.text.secondary}>
            +{remaining}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface.chip,
  },
  fallback: {
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackItem: {
    borderWidth: 2,
    borderColor: colors.surface.card,
    borderRadius: 9999,
  },
  more: {
    backgroundColor: colors.surface.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
});
