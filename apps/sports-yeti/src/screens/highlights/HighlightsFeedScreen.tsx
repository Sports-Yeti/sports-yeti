import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
} from 'lucide-react-native';
import { colors, radii, spacing } from '../../theme';
import {
  Avatar,
  BottomSheet,
  Button,
  ScreenHeader,
  Tag,
  Text,
} from '../../ui';
import {
  HIGHLIGHT_REELS,
  REEL_COMMENTS,
  type HighlightReel,
  type ReelComment,
} from '../../mocks/highlights';
import { formatCount } from '../../lib/format';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

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
  accessibilityLabel: string;
}

function ActionButton({
  Icon,
  count,
  active = false,
  onPress,
  accessibilityLabel,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.actionButton}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      hitSlop={6}
    >
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
  bottomInset: number;
  onComments: (reel: HighlightReel) => void;
  onMore: (reel: HighlightReel) => void;
}

function ReelItem({ reel, height, bottomInset, onComments, onMore }: ReelItemProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const lastTap = React.useRef(0);

  const triggerLike = useCallback(() => {
    setLiked((prev) => {
      if (!prev) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.selectionAsync();
      return !prev;
    });
  }, []);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (!liked) triggerLike();
    }
    lastTap.current = now;
  }, [liked, triggerLike]);

  return (
    <Pressable onPress={handleDoubleTap} style={[styles.slide, { height }]}>
      <Image
        source={{ uri: reel.poster }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
        accessibilityLabel={`Highlight by ${reel.username}`}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.actionStack, { bottom: bottomInset }]}>
        <ActionButton
          Icon={Heart}
          count={liked ? reel.likes + 1 : reel.likes}
          active={liked}
          onPress={triggerLike}
          accessibilityLabel={liked ? 'Unlike' : 'Like'}
        />
        <ActionButton
          Icon={MessageCircle}
          count={reel.comments}
          onPress={() => {
            Haptics.selectionAsync();
            onComments(reel);
          }}
          accessibilityLabel="View comments"
        />
        <ActionButton
          Icon={Send}
          count={reel.shares}
          onPress={() => Haptics.selectionAsync()}
          accessibilityLabel="Share"
        />
        <ActionButton
          Icon={Bookmark}
          active={bookmarked}
          onPress={() => {
            Haptics.selectionAsync();
            setBookmarked((b) => !b);
          }}
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        />
        <ActionButton
          Icon={MoreHorizontal}
          onPress={() => onMore(reel)}
          accessibilityLabel="More options"
        />
      </View>

      <View style={[styles.captionStack, { bottom: bottomInset }]}>
        <Tag tone="info" size="sm" label="PHOTO" leadingDot />
        <View style={styles.userRow}>
          <View style={styles.avatarShell}>
            <Avatar uri={reel.avatar} initials={reel.username.charAt(1)} size={36} bordered />
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
    </Pressable>
  );
}

export function HighlightsFeedScreen() {
  const insets = useSafeAreaInsets();
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = 88;
  }
  const slideHeight = WINDOW_HEIGHT;
  const bottomInset = tabBarHeight + spacing.lg;
  const [activeComments, setActiveComments] = useState<HighlightReel | null>(null);
  const [moreSheet, setMoreSheet] = useState<HighlightReel | null>(null);

  const renderItem: ListRenderItem<HighlightReel> = useCallback(
    ({ item }) => (
      <ReelItem
        reel={item}
        height={slideHeight}
        bottomInset={bottomInset}
        onComments={setActiveComments}
        onMore={setMoreSheet}
      />
    ),
    [slideHeight, bottomInset],
  );

  const comments: ReelComment[] = activeComments
    ? REEL_COMMENTS[activeComments.id] ?? []
    : [];

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
      />
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <ScreenHeader variant="translucent" hasNotifications />
      </View>

      <BottomSheet
        visible={!!activeComments}
        onRequestClose={() => setActiveComments(null)}
        title={`Comments (${activeComments?.comments ?? 0})`}
        snapPoints={['70%']}
      >
        <View style={styles.commentsList}>
          {comments.length === 0 ? (
            <Text variant="body" color={colors.text.secondary} align="center">
              No comments yet. Be the first.
            </Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <Avatar uri={c.avatar} initials={c.username.charAt(1)} size={36} />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text variant="button" color={colors.text.primary}>
                      {c.username}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {c.timestamp}
                    </Text>
                  </View>
                  <Text variant="body" color={colors.text.primary}>
                    {c.body}
                  </Text>
                  <Text variant="caption" color={colors.text.secondary}>
                    {c.likes} likes
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={!!moreSheet}
        onRequestClose={() => setMoreSheet(null)}
        title="Highlight options"
        snapPoints={['40%']}
      >
        <View style={styles.moreActions}>
          <Button
            label="Save to bookmarks"
            variant="ghost"
            fullWidth
            onPress={() => {
              Haptics.selectionAsync();
              setMoreSheet(null);
            }}
          />
          <Button
            label="Hide content like this"
            variant="ghost"
            fullWidth
            onPress={() => {
              Haptics.selectionAsync();
              setMoreSheet(null);
            }}
          />
          <Button
            label="Report"
            variant="solid"
            fullWidth
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setMoreSheet(null);
            }}
          />
        </View>
      </BottomSheet>
    </View>
  );
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
  commentsList: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  moreActions: {
    gap: spacing.md,
  },
});
