import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Heart,
  MessageCircle,
  Plus,
  Send,
} from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import { Avatar, ScreenHeader, Text } from '../../ui';
import { HIGHLIGHT_REELS, type HighlightReel } from '../../mocks/highlights';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

function formatCount(value: number): string {
  if (value >= 1000) {
    const v = value / 1000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1)}K`;
  }
  return `${value}`;
}

interface ActionButtonProps {
  Icon: React.ComponentType<{
    size: number;
    color: string;
    strokeWidth?: number;
    fill?: string;
  }>;
  count?: number;
  active?: boolean;
  onPress?: () => void;
}

function ActionButton({ Icon, count, active = false, onPress }: ActionButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.actionButton} accessibilityRole="button">
      <View style={styles.actionIconWrap}>
        <Icon
          size={24}
          color={colors.text.inverse}
          strokeWidth={2}
          fill={active ? colors.status.live : 'transparent'}
        />
      </View>
      {typeof count === 'number' ? (
        <Text variant="caption" color={colors.text.inverse} align="center">
          {formatCount(count)}
        </Text>
      ) : null}
    </Pressable>
  );
}

interface ReelItemProps {
  reel: HighlightReel;
  height: number;
  topInset: number;
  bottomInset: number;
}

function ReelItem({ reel, height, topInset, bottomInset }: ReelItemProps) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={[styles.slide, { height }]}>
      <Image
        source={{ uri: reel.poster }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        style={[
          styles.actionStack,
          { bottom: bottomInset + 32 },
        ]}
      >
        <ActionButton
          Icon={Heart}
          count={liked ? reel.likes + 1 : reel.likes}
          active={liked}
          onPress={() => setLiked((prev) => !prev)}
        />
        <ActionButton Icon={MessageCircle} count={reel.comments} />
        <ActionButton Icon={Send} count={reel.shares} />
      </View>

      <View
        style={[
          styles.captionStack,
          { bottom: bottomInset + 32, paddingTop: topInset },
        ]}
      >
        <View style={styles.userRow}>
          <View style={styles.avatarShell}>
            <Avatar uri={reel.avatar} size={36} bordered />
            <View style={styles.followBadge}>
              <Plus size={10} color={colors.text.inverse} strokeWidth={3} />
            </View>
          </View>
          <View style={styles.userText}>
            <Text variant="button" color={colors.text.inverse}>
              {reel.username}
            </Text>
            <Text variant="eyebrow" color={colors.brand.accent}>
              {reel.team}
            </Text>
          </View>
        </View>
        <Text
          variant="bodySm"
          color={colors.text.inverse}
          style={styles.caption}
        >
          {reel.caption}
        </Text>
      </View>
    </View>
  );
}

export function HighlightsFeedScreen() {
  const insets = useSafeAreaInsets();
  const slideHeight = WINDOW_HEIGHT;

  const renderItem: ListRenderItem<HighlightReel> = useCallback(
    ({ item }) => (
      <ReelItem
        reel={item}
        height={slideHeight}
        topInset={insets.top + 80}
        bottomInset={insets.bottom + 96}
      />
    ),
    [insets.bottom, insets.top, slideHeight],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={HIGHLIGHT_REELS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={slideHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: slideHeight,
          offset: slideHeight * index,
          index,
        })}
        onScroll={onPagingScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <ScreenHeader variant="translucent" hasNotifications />
      </View>
    </View>
  );
}

function onPagingScroll(_event: NativeSyntheticEvent<NativeScrollEvent>) {
  /* future: track current reel for analytics or autoplay */
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: '100%',
    backgroundColor: '#0B1220',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  actionStack: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionStack: {
    position: 'absolute',
    left: spacing.lg,
    right: 80,
    gap: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarShell: {
    position: 'relative',
  },
  followBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  userText: {
    gap: 2,
  },
  caption: {
    lineHeight: 20,
  },
});
