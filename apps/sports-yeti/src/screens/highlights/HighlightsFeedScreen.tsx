import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItem,
  type ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import {
  AtSign,
  Bookmark,
  Camera,
  Check,
  Heart,
  Link as LinkIcon,
  Mail,
  Maximize2,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  BottomSheet,
  Button,
  ScreenHeader,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  HIGHLIGHT_REELS,
  type HighlightReel,
  type ReelComment,
} from '../../mocks/highlights';
import { SARAH_AVATAR } from '../../mocks/avatars';
import { formatCount } from '../../lib/format';
import { useSavedHighlights } from '../../features/saved-highlights-store';
import { useFollowStore } from '../../features/follow-store';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type FeedRoute = RouteProp<MainTabParamList, 'Highlights'>;

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

// Approximate intrinsic height of the BlurView SportsYetiTabBar (icon stack +
// label + paddings). React Navigation's `useBottomTabBarHeight` doesn't
// reliably account for our custom tab bar, so we add headroom over the
// reported value to keep captions/actions clear of the BlurView.
const TAB_BAR_FALLBACK = 88;

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
  topInset: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onComments: (reel: HighlightReel) => void;
  onShare: (reel: HighlightReel) => void;
  onMore: (reel: HighlightReel) => void;
  onBookmarkChanged: (reel: HighlightReel, bookmarked: boolean) => void;
  onOpenProfile: (playerId: string) => void;
}

function ReelItem({
  reel,
  height,
  bottomInset,
  topInset,
  isActive,
  isMuted,
  onToggleMute,
  onComments,
  onShare,
  onMore,
  onBookmarkChanged,
  onOpenProfile,
}: ReelItemProps) {
  const [liked, setLiked] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const lastTap = useRef(0);
  const videoViewRef = useRef<VideoView>(null);

  const bookmarked = useSavedHighlights((s) => s.bookmarkedIds.has(reel.id));
  const toggleBookmark = useSavedHighlights((s) => s.toggleBookmark);
  const liveCommentCount = useSavedHighlights((s) =>
    s.getCommentCount(reel),
  );
  const isFollowingPoster = useFollowStore((s) =>
    reel.playerId ? s.followingIds.includes(reel.playerId) : false,
  );
  const toggleFollow = useFollowStore((s) => s.toggleFollow);

  const player = useVideoPlayer(reel.videoUrl, (p) => {
    p.loop = true;
    p.muted = isMuted;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  // Autoplay current slide; pause others. Honor user's manual pause.
  useEffect(() => {
    if (!isActive) {
      player.pause();
      return;
    }
    if (userPaused) {
      player.pause();
      return;
    }
    player.play();
  }, [isActive, userPaused, player]);

  // Mute follows the global mute state.
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  const triggerLike = useCallback(() => {
    setLiked((prev) => {
      if (!prev) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.selectionAsync();
      return !prev;
    });
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      // Double-tap to like
      if (!liked) triggerLike();
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    setTimeout(() => {
      if (Date.now() - lastTap.current >= 280 && lastTap.current !== 0) {
        setUserPaused((p) => !p);
        lastTap.current = 0;
      }
    }, 290);
  }, [liked, triggerLike]);

  const handleBookmark = useCallback(() => {
    Haptics.selectionAsync();
    const isNowBookmarked = toggleBookmark(reel.id);
    onBookmarkChanged(reel, isNowBookmarked);
  }, [reel, toggleBookmark, onBookmarkChanged]);

  const handleEnterFullscreen = useCallback(async () => {
    Haptics.selectionAsync();
    try {
      await videoViewRef.current?.enterFullscreen();
    } catch {
      // Native fullscreen may not be available in some environments (e.g. web preview);
      // failure is non-blocking — user simply stays in feed.
    }
  }, []);

  // Caption truncation: clamp to 3 lines until user taps "more".
  const captionLines = captionExpanded ? undefined : 3;

  return (
    // `accessible={false}` keeps this tap-to-pause surface from swallowing
    // the nested controls (like/share/follow) in screen readers.
    <Pressable
      onPress={handleTap}
      style={[styles.slide, { height }]}
      accessible={false}
    >
      {/* Poster shows first; VideoView fades in on top once playing. */}
      <Image
        source={{ uri: reel.poster }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
        accessibilityLabel={`Highlight by ${reel.username}`}
      />
      <VideoView
        ref={videoViewRef}
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen
        allowsPictureInPicture={false}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {!isPlaying && isActive ? (
        <View style={styles.playOverlay} pointerEvents="none">
          <View style={styles.playBubble}>
            <Play
              size={36}
              color={colors.text.inverse}
              strokeWidth={2.5}
              fill={colors.text.inverse}
            />
          </View>
        </View>
      ) : null}

      {/* Top fullscreen affordance — sits clear of the translucent ScreenHeader.
          Header content = topInset + 12 (paddingTop) + 40 (avatar/title row) +
          16 (paddingBottom) = topInset + 68. We add 12px breathing room. */}
      <View
        style={[styles.topActions, { top: topInset + 80 }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleEnterFullscreen}
          style={styles.topIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Open in fullscreen"
          hitSlop={8}
        >
          <Maximize2 size={18} color={colors.text.inverse} strokeWidth={2.25} />
        </Pressable>
      </View>

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
          count={liveCommentCount}
          onPress={() => {
            Haptics.selectionAsync();
            onComments(reel);
          }}
          accessibilityLabel="View comments"
        />
        <ActionButton
          Icon={Send}
          count={reel.shares}
          onPress={() => {
            Haptics.selectionAsync();
            onShare(reel);
          }}
          accessibilityLabel="Share"
        />
        <ActionButton
          Icon={Bookmark}
          active={bookmarked}
          onPress={handleBookmark}
          accessibilityLabel={
            bookmarked ? 'Remove from saved highlights' : 'Save highlight'
          }
        />
        <ActionButton
          Icon={isMuted ? VolumeX : Volume2}
          onPress={() => {
            Haptics.selectionAsync();
            onToggleMute();
          }}
          accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
        />
        <ActionButton
          Icon={MoreHorizontal}
          onPress={() => onMore(reel)}
          accessibilityLabel="More options"
        />
      </View>

      <View style={[styles.captionStack, { bottom: bottomInset }]}>
        <View style={styles.tagRow}>
          <Tag tone="live" size="sm" leadingDot label={`${reel.durationSeconds}s`} />
          {userPaused ? (
            <Tag tone="warning" size="sm" leadingDot label="Paused" />
          ) : null}
          {bookmarked ? (
            <Tag tone="info" size="sm" leadingDot label="Saved" />
          ) : null}
        </View>
        <View style={styles.userRow}>
          {/* One focus stop for the identity; the follow badge is a SIBLING
              (not a nested pressable) so screen readers can reach it. */}
          <Pressable
            style={styles.userIdentity}
            disabled={!reel.playerId}
            onPress={() => reel.playerId && onOpenProfile(reel.playerId)}
            accessibilityRole="button"
            accessibilityLabel={`View ${reel.username}'s profile`}
          >
            <View style={styles.avatarShell}>
              <Avatar uri={reel.avatar} initials={reel.username.charAt(1)} size={36} bordered />
            </View>
            <View style={styles.userText}>
              <Text variant="button" color={colors.text.inverse}>
                {reel.username}
              </Text>
              <Text variant="eyebrow" color={colors.brand.accent}>
                {reel.team}
              </Text>
            </View>
          </Pressable>
          {reel.playerId ? (
            <Pressable
              style={[
                styles.followBadge,
                isFollowingPoster ? styles.followBadgeOn : null,
              ]}
              hitSlop={12}
              onPress={() => {
                Haptics.selectionAsync();
                toggleFollow(reel.playerId!);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: isFollowingPoster }}
              accessibilityLabel={
                isFollowingPoster
                  ? `Unfollow ${reel.username}`
                  : `Follow ${reel.username}`
              }
            >
              {isFollowingPoster ? (
                <Check size={10} color={colors.text.inverse} strokeWidth={3} />
              ) : (
                <Plus size={10} color={colors.text.inverse} strokeWidth={3} />
              )}
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => setCaptionExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={captionExpanded ? 'Collapse caption' : 'Expand caption'}
        >
          <Text
            variant="bodySm"
            color={colors.text.inverse}
            numberOfLines={captionLines}
            style={styles.caption}
          >
            {reel.caption}
          </Text>
          {!captionExpanded && reel.caption.length > 110 ? (
            <Text variant="caption" color={colors.brand.accent}>
              more
            </Text>
          ) : null}
        </Pressable>
      </View>
    </Pressable>
  );
}

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 60,
};

// Stable empty reference. Returning a fresh `[]` from a Zustand v5 selector
// makes `useSyncExternalStore` see a new snapshot on every render, which
// throws "getSnapshot should be cached" and loops to "Maximum update depth
// exceeded". Sharing one frozen array keeps the snapshot referentially stable.
const EMPTY_COMMENTS: ReelComment[] = [];

interface ShareTargetProps {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  background: string;
  onPress: () => void;
}

function ShareTarget({ Icon, label, background, onPress }: ShareTargetProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.shareTarget}
      accessibilityRole="button"
      accessibilityLabel={`Share to ${label}`}
    >
      <View style={[styles.shareTargetIcon, { backgroundColor: background }]}>
        <Icon size={22} color={colors.text.inverse} strokeWidth={2.25} />
      </View>
      <Text variant="caption" color={colors.text.primary} align="center">
        {label}
      </Text>
    </Pressable>
  );
}

function shareUrlFor(reel: HighlightReel): string {
  return `https://sportsyeti.app/h/${reel.id}`;
}

export function HighlightsFeedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<FeedRoute>();
  const toast = useToast();
  const listRef = useRef<FlatList<HighlightReel>>(null);

  const slideHeight = WINDOW_HEIGHT;

  // Custom BlurView tab bar can extend past what `useBottomTabBarHeight`
  // reports. Use a generous fallback that includes safe-area + bar height
  // so caption/action stacks stay clear of the bar (fixes the bottom cutoff).
  const bottomInset = TAB_BAR_FALLBACK + insets.bottom + spacing.md;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [activeComments, setActiveComments] = useState<HighlightReel | null>(null);
  const [shareSheet, setShareSheet] = useState<HighlightReel | null>(null);
  const [moreSheet, setMoreSheet] = useState<HighlightReel | null>(null);
  const [draftComment, setDraftComment] = useState('');
  const composerRef = useRef<TextInput>(null);

  const addComment = useSavedHighlights((s) => s.addComment);
  const toggleBookmark = useSavedHighlights((s) => s.toggleBookmark);
  const liveComments = useSavedHighlights((s) =>
    activeComments
      ? s.commentsByReel[activeComments.id] ?? EMPTY_COMMENTS
      : EMPTY_COMMENTS,
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const top = viewableItems.find((v) => v.isViewable);
      if (top && typeof top.index === 'number') {
        setActiveIndex(top.index);
      }
    },
  ).current;

  // Deep-link support: saved-highlight cards pass `focusReelId` so the feed
  // opens on that exact reel instead of the top of the list.
  const focusReelId = route.params?.focusReelId;
  useEffect(() => {
    if (!focusReelId) return;
    const index = HIGHLIGHT_REELS.findIndex((r) => r.id === focusReelId);
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: false });
      setActiveIndex(index);
    }
    // Clear the param so re-tapping the same card still triggers the effect.
    navigation.setParams({ focusReelId: undefined } as never);
  }, [focusReelId, navigation]);

  const handleOpenProfile = useCallback(
    (playerId: string) => {
      Haptics.selectionAsync();
      navigation.navigate('PlayerProfile', { playerId });
    },
    [navigation],
  );

  const handleBookmarkChanged = useCallback(
    (reel: HighlightReel, nowBookmarked: boolean) => {
      if (nowBookmarked) {
        toast.show({
          variant: 'success',
          title: 'Saved highlight',
          description: `Added "${reel.username}" to your saved highlights.`,
          action: {
            label: 'View',
            onPress: () => navigation.navigate('MyHighlights'),
          },
        });
      } else {
        toast.show({
          variant: 'info',
          title: 'Removed from saved',
        });
      }
    },
    [navigation, toast],
  );

  const handlePostComment = useCallback(() => {
    if (!activeComments) return;
    const created = addComment(activeComments.id, draftComment);
    if (!created) return;
    setDraftComment('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [activeComments, addComment, draftComment]);

  const handleCopyLink = useCallback(async (reel: HighlightReel) => {
    await Clipboard.setStringAsync(shareUrlFor(reel));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShareSheet(null);
    toast.show({
      variant: 'success',
      title: 'Link copied',
      description: 'Paste it anywhere to share this highlight.',
    });
  }, [toast]);

  const handleShareToPlatform = useCallback(
    async (reel: HighlightReel, platform: string) => {
      Haptics.selectionAsync();
      try {
        await Share.share({
          title: `${reel.username} on SportsYeti`,
          message: `${reel.caption} — ${shareUrlFor(reel)}`,
        });
      } catch {
        // user cancelled — no-op
      }
      setShareSheet(null);
      toast.show({
        variant: 'info',
        title: `Shared to ${platform}`,
      });
    },
    [toast],
  );

  const handleSystemShare = useCallback(async (reel: HighlightReel) => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        title: `${reel.username} on SportsYeti`,
        message: `${reel.caption} — ${shareUrlFor(reel)}`,
      });
    } catch {
      // user cancelled — no-op
    }
    setShareSheet(null);
  }, []);

  const renderItem: ListRenderItem<HighlightReel> = useCallback(
    ({ item, index }) => (
      <ReelItem
        reel={item}
        height={slideHeight}
        bottomInset={bottomInset}
        topInset={insets.top}
        isActive={index === activeIndex}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((m) => !m)}
        onComments={(reel) => {
          setDraftComment('');
          setActiveComments(reel);
        }}
        onShare={setShareSheet}
        onMore={setMoreSheet}
        onBookmarkChanged={handleBookmarkChanged}
        onOpenProfile={handleOpenProfile}
      />
    ),
    [
      slideHeight,
      bottomInset,
      insets.top,
      activeIndex,
      isMuted,
      handleBookmarkChanged,
      handleOpenProfile,
    ],
  );

  const activeCommentCount = useMemo(
    () => (activeComments ? liveComments.length : 0),
    [activeComments, liveComments.length],
  );

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
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
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={onViewableItemsChanged}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        removeClippedSubviews
      />
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <ScreenHeader
          variant="translucent"
          hasNotifications
          onAvatarPress={() => navigation.navigate('Profile' as never)}
          onBellPress={() => navigation.navigate('Notifications' as never)}
        />
      </View>

      <BottomSheet
        visible={!!activeComments}
        onRequestClose={() => setActiveComments(null)}
        title={`Comments (${activeCommentCount})`}
        snapPoints={['75%']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.commentsKav}
          keyboardVerticalOffset={spacing.lg}
        >
          <ScrollView
            style={styles.commentsScroll}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {liveComments.length === 0 ? (
              <View style={styles.commentsEmpty}>
                <Text variant="body" color={colors.text.secondary} align="center">
                  No comments yet. Be the first.
                </Text>
              </View>
            ) : (
              liveComments.map((c) => (
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
          </ScrollView>

          <View style={styles.composer}>
            <Avatar uri={SARAH_AVATAR} initials="S" size={32} />
            <TextInput
              ref={composerRef}
              value={draftComment}
              onChangeText={setDraftComment}
              placeholder="Add a comment…"
              placeholderTextColor={colors.text.muted}
              style={styles.composerInput}
              multiline
              maxLength={300}
              returnKeyType="send"
              blurOnSubmit
              onSubmitEditing={handlePostComment}
              accessibilityLabel="Add a comment"
            />
            <Pressable
              onPress={handlePostComment}
              disabled={draftComment.trim().length === 0}
              style={[
                styles.composerSend,
                draftComment.trim().length === 0 ? styles.composerSendDisabled : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Post comment"
              accessibilityState={{ disabled: draftComment.trim().length === 0 }}
              hitSlop={8}
            >
              <Send
                size={18}
                color={
                  draftComment.trim().length === 0
                    ? colors.text.muted
                    : colors.text.inverse
                }
                strokeWidth={2.25}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>

      <BottomSheet
        visible={!!shareSheet}
        onRequestClose={() => setShareSheet(null)}
        title="Share highlight"
        snapPoints={['52%']}
      >
        {shareSheet ? (
          <View style={styles.shareBody}>
            <View style={styles.shareGrid}>
              <ShareTarget
                Icon={Camera}
                label="Instagram"
                background="#E1306C"
                onPress={() => handleShareToPlatform(shareSheet, 'Instagram')}
              />
              <ShareTarget
                Icon={AtSign}
                label="X"
                background="#0F1419"
                onPress={() => handleShareToPlatform(shareSheet, 'X')}
              />
              <ShareTarget
                Icon={MessageSquare}
                label="WhatsApp"
                background="#25D366"
                onPress={() => handleShareToPlatform(shareSheet, 'WhatsApp')}
              />
              <ShareTarget
                Icon={MessageCircle}
                label="Messages"
                background={colors.brand.primary}
                onPress={() => handleShareToPlatform(shareSheet, 'Messages')}
              />
              <ShareTarget
                Icon={Mail}
                label="Email"
                background={colors.brand.deep}
                onPress={() => handleShareToPlatform(shareSheet, 'Email')}
              />
              <ShareTarget
                Icon={MoreHorizontal}
                label="More"
                background={colors.text.muted}
                onPress={() => handleSystemShare(shareSheet)}
              />
            </View>

            <View style={styles.shareDivider} />

            <Pressable
              onPress={() => handleCopyLink(shareSheet)}
              style={styles.copyLinkRow}
              accessibilityRole="button"
              accessibilityLabel="Copy link to highlight"
            >
              <View style={styles.copyLinkIcon}>
                <LinkIcon size={18} color={colors.brand.deep} strokeWidth={2.25} />
              </View>
              <View style={styles.copyLinkText}>
                <Text variant="button" color={colors.text.primary}>
                  Copy link
                </Text>
                <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                  {shareUrlFor(shareSheet)}
                </Text>
              </View>
              <Text variant="button" color={colors.brand.primary}>
                Copy
              </Text>
            </Pressable>
          </View>
        ) : null}
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
              if (!moreSheet) return;
              Haptics.selectionAsync();
              const nowBookmarked = toggleBookmark(moreSheet.id);
              handleBookmarkChanged(moreSheet, nowBookmarked);
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
  topActions: {
    position: 'absolute',
    right: spacing.lg,
    alignItems: 'center',
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  userIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatarShell: {
    position: 'relative',
  },
  followBadge: {
    // Anchored over the avatar's bottom-right corner (avatar is 36pt at the
    // start of the row) — a sibling of the identity pressable, not a child.
    position: 'absolute',
    bottom: -4,
    left: 22,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  followBadgeOn: {
    backgroundColor: colors.brand.primary,
  },
  userText: {
    gap: 2,
  },
  caption: {
    lineHeight: 20,
  },
  commentsKav: {
    flex: 1,
  },
  commentsScroll: {
    flex: 1,
  },
  commentsList: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  commentsEmpty: {
    paddingVertical: spacing.xxl,
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
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.chipMuted,
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 20,
  },
  composerSend: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  composerSendDisabled: {
    backgroundColor: colors.surface.chip,
  },
  shareBody: {
    gap: spacing.lg,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    rowGap: spacing.lg,
    justifyContent: 'space-between',
  },
  shareTarget: {
    width: '18%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  shareTargetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  shareDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  copyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.brand.soft,
  },
  copyLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyLinkText: {
    flex: 1,
    gap: 2,
  },
  moreActions: {
    gap: spacing.md,
  },
});
