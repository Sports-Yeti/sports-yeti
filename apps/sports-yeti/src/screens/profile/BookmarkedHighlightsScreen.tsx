import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Bookmark,
  ChevronLeft,
  Film,
  Play,
  Trash2,
  X,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  EmptyState,
  IconBadge,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { useSavedHighlights } from '../../features/saved-highlights-store';
import type { HighlightReel } from '../../mocks/highlights';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface BookmarkCardProps {
  reel: HighlightReel;
  width: number;
  onPlay: () => void;
  onRemove: () => void;
}

function BookmarkCard({ reel, width, onPlay, onRemove }: BookmarkCardProps) {
  return (
    <Pressable
      onPress={onPlay}
      accessibilityRole="button"
      accessibilityLabel={`Play ${reel.team} highlight by ${reel.username}`}
      style={[styles.card, { width }]}
    >
      <Image
        source={{ uri: reel.poster }}
        style={styles.cardImage}
        contentFit="cover"
        accessibilityLabel="Highlight thumbnail"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.78)']}
        locations={[0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.cardTopRow}>
        <Tag tone="live" size="sm" leadingDot label={`${reel.durationSeconds}s`} />
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove from bookmarks"
          hitSlop={6}
          style={styles.removeBtn}
        >
          <X size={14} color={colors.text.inverse} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View style={styles.cardPlayWrap} pointerEvents="none">
        <View style={styles.cardPlayBubble}>
          <Play
            size={18}
            color={colors.text.inverse}
            strokeWidth={2.5}
            fill={colors.text.inverse}
          />
        </View>
      </View>

      <View style={styles.cardCaptionStack}>
        <Text variant="eyebrow" color={colors.brand.accent}>
          {reel.team}
        </Text>
        <Text
          variant="button"
          color={colors.text.inverse}
          numberOfLines={2}
        >
          {reel.username}
        </Text>
      </View>
    </Pressable>
  );
}

export function BookmarkedHighlightsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { width } = useWindowDimensions();
  // Subscribe to the bookmark Set so this screen re-renders on toggle. Then
  // derive the ordered reel list lazily from the store getter.
  const bookmarkedIds = useSavedHighlights((s) => s.bookmarkedIds);
  const getBookmarkedReels = useSavedHighlights((s) => s.getBookmarkedReels);
  const toggleBookmark = useSavedHighlights((s) => s.toggleBookmark);
  const clearAll = useSavedHighlights((s) => s.clearAllBookmarks);
  const bookmarkedReels = React.useMemo(
    () => getBookmarkedReels(),
    // bookmarkedIds is the dependency that drives the list shape.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookmarkedIds, getBookmarkedReels],
  );
  const [confirmClear, setConfirmClear] = React.useState(false);

  // 2-column grid sized to screen width minus horizontal page padding + the
  // single inter-card gap so two cards line up evenly.
  const cardWidth = (width - spacing.lg * 2 - spacing.md) / 2;

  const goToFeed = () => {
    Haptics.selectionAsync();
    navigation.navigate('MainTabs', { screen: 'Highlights' });
  };

  const handleRemove = (reel: HighlightReel) => {
    Haptics.selectionAsync();
    toggleBookmark(reel.id);
    toast.show({
      variant: 'info',
      title: 'Removed from bookmarks',
      action: {
        label: 'Undo',
        onPress: () => toggleBookmark(reel.id),
      },
    });
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Bookmarks
        </Text>
        {bookmarkedReels.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove all bookmarks"
            hitSlop={8}
            onPress={() => setConfirmClear(true)}
            style={styles.backBtn}
          >
            <Trash2 size={20} color={colors.status.live} strokeWidth={2.25} />
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {bookmarkedReels.length === 0 ? (
          <EmptyState
            icon={
              <Bookmark
                size={28}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
            }
            title="No bookmarks yet"
            description="Tap the bookmark icon on any reel to save it here for later."
            primaryAction={{
              label: 'Browse highlights',
              onPress: goToFeed,
            }}
          />
        ) : (
          <>
            <Card style={styles.heroCard}>
              <IconBadge size={48} tone="brand">
                <Film
                  size={22}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              </IconBadge>
              <View style={styles.heroBody}>
                <Text variant="h3" color={colors.text.primary}>
                  Saved for later
                </Text>
                <Text variant="bodySm" color={colors.text.secondary}>
                  {bookmarkedReels.length} reel
                  {bookmarkedReels.length === 1 ? '' : 's'} from your feed.
                </Text>
              </View>
              <Button
                label="Open feed"
                variant="soft"
                size="sm"
                onPress={goToFeed}
              />
            </Card>

            <View style={styles.grid}>
              {bookmarkedReels.map((reel) => (
                <BookmarkCard
                  key={reel.id}
                  reel={reel}
                  width={cardWidth}
                  onPlay={goToFeed}
                  onRemove={() => handleRemove(reel)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={confirmClear}
        onRequestClose={() => setConfirmClear(false)}
        variant="destructive"
        title="Remove all bookmarks?"
        description="This won't delete the highlights themselves — only your saved list."
        primaryAction={{
          label: 'Remove all',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearAll();
            setConfirmClear(false);
            toast.show({
              variant: 'info',
              title: 'Bookmarks cleared',
            });
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmClear(false),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroBody: {
    flex: 1,
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    aspectRatio: 9 / 14,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface.chip,
    ...shadows.soft,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTopRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlayWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlayBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCaptionStack: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    gap: 2,
  },
});
