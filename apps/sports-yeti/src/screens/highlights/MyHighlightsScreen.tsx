import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  Bookmark,
  BookmarkX,
  ChevronLeft,
  Film,
  Play,
  Plus,
  Sparkles,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  EmptyState,
  IconBadge,
  SectionHeader,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  HIGHLIGHT_REELS,
  type HighlightProject,
  type HighlightProjectStatus,
  type HighlightReel,
} from '../../mocks/highlights';
import { formatRelativeFromIso } from '../../lib/format';
import { useSavedHighlights } from '../../features/saved-highlights-store';
import { useHighlightProjects } from '../../features/highlight-projects-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const STATUS_TONE: Record<HighlightProjectStatus, 'success' | 'warning' | 'live' | 'info'> = {
  completed: 'success',
  processing: 'info',
  pending_payment: 'warning',
  failed: 'live',
};

const STATUS_LABEL: Record<HighlightProjectStatus, string> = {
  completed: 'Ready',
  processing: 'Processing',
  pending_payment: 'Pending payment',
  failed: 'Failed',
};

function SavedHighlightCard({
  reel,
  onOpen,
  onRemove,
}: {
  reel: HighlightReel;
  onOpen: () => void;
  onRemove: () => void;
}) {
  // Remove button is a SIBLING of the open pressable (not nested) so screen
  // readers get two distinct focus stops: open, then unsave.
  return (
    <View style={styles.savedCard}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open saved highlight by ${reel.username}`}
      >
        <Image
          source={{ uri: reel.poster }}
          style={styles.savedThumb}
          contentFit="cover"
          accessibilityLabel="Highlight thumbnail"
        />
        <View style={styles.savedPlayOverlay} pointerEvents="none">
          <View style={styles.savedPlayBubble}>
            <Play
              size={16}
              color={colors.text.inverse}
              strokeWidth={2.5}
              fill={colors.text.inverse}
            />
          </View>
        </View>
        <View style={styles.savedBody}>
          <Text variant="button" color={colors.text.primary} numberOfLines={1}>
            {reel.username}
          </Text>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {reel.team}
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="Remove from saved"
        hitSlop={8}
        style={styles.savedRemove}
      >
        <BookmarkX size={16} color={colors.text.muted} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

function ProjectCard({
  project,
  onPress,
}: {
  project: HighlightProject;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={project.title}>
      <Card style={styles.card}>
        <View style={styles.cardHead}>
          <Image
            source={{ uri: project.thumbnail }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel="Thumbnail"
          />
          <View style={styles.cardBody}>
            <View style={styles.cardHeadRow}>
              <Tag tone={STATUS_TONE[project.status]} size="sm" leadingDot label={STATUS_LABEL[project.status]} />
              <Text variant="caption" color={colors.text.secondary}>
                {formatRelativeFromIso(project.createdAt)}
              </Text>
            </View>
            <Text variant="h3" color={colors.text.primary} numberOfLines={2}>
              {project.title}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {project.status === 'completed'
                ? `${project.clipsCount} clip${project.clipsCount === 1 ? '' : 's'} · source ${Math.round(project.sourceVideoSeconds / 60)} min`
                : project.status === 'processing'
                ? `Analyzing source · ${Math.round(project.sourceVideoSeconds / 60)} min`
                : project.status === 'failed'
                ? project.errorMessage ?? 'Generation failed'
                : 'Awaiting payment'}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export function MyHighlightsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const bookmarkedIds = useSavedHighlights((s) => s.bookmarkedIds);
  const toggleBookmark = useSavedHighlights((s) => s.toggleBookmark);
  // Seeded + session-generated projects (new wizard runs land on top).
  const projects = useHighlightProjects();
  const savedReels = useMemo(
    () => HIGHLIGHT_REELS.filter((r) => bookmarkedIds.has(r.id)),
    [bookmarkedIds],
  );

  const handleOpenSaved = (reel?: HighlightReel) => {
    // Deep-link the feed to the tapped reel; "Watch all" starts at the top.
    navigation.navigate('MainTabs', {
      screen: 'Highlights',
      params: reel ? { focusReelId: reel.id } : undefined,
    });
  };

  const handleRemoveSaved = (reel: HighlightReel) => {
    toggleBookmark(reel.id);
    toast.show({
      variant: 'info',
      title: 'Removed from saved',
      description: `${reel.username} won't appear here anymore.`,
    });
  };

  const handleProjectPress = (project: HighlightProject) => {
    if (project.status === 'completed') {
      navigation.navigate('HighlightDetail', { id: project.id });
      return;
    }
    if (project.status === 'processing') {
      toast.show({
        variant: 'info',
        title: 'Still analyzing',
        description: "We'll push you a notification when this is ready (~2 min).",
      });
      return;
    }
    if (project.status === 'failed') {
      toast.show({
        variant: 'error',
        title: 'Highlight failed',
        description: project.errorMessage ?? 'Try uploading a higher quality clip.',
        action: { label: 'New upload', onPress: () => navigation.navigate('HighlightUpload') },
      });
      return;
    }
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
          Highlights Studio
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {projects.length === 0 ? (
          <EmptyState
            icon={
              <Sparkles size={28} color={colors.brand.primary} strokeWidth={2.25} />
            }
            title="No highlights yet"
            description="Upload a game video and AI will pull the best moments."
            primaryAction={{
              label: 'Upload your first',
              onPress: () => navigation.navigate('HighlightUpload'),
            }}
          />
        ) : (
          <>
            <Card style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <IconBadge size={48} tone="brand">
                  <Film size={22} color={colors.brand.deep} strokeWidth={2.25} />
                </IconBadge>
              </View>
              <View style={styles.heroBody}>
                <Text variant="h3" color={colors.text.primary}>
                  Turn games into clips
                </Text>
                <Text variant="bodySm" color={colors.text.secondary}>
                  Upload up to 60 minutes. AI scores moments and you decide what to post.
                </Text>
              </View>
              <Button
                label="New"
                variant="gradient"
                size="sm"
                leadingIcon={
                  <Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />
                }
                onPress={() => navigation.navigate('HighlightUpload')}
              />
            </Card>

            <View>
              <SectionHeader
                title="Saved highlights"
                actionLabel={savedReels.length > 0 ? 'Watch all' : undefined}
                onActionPress={
                  savedReels.length > 0 ? () => handleOpenSaved() : undefined
                }
              />
              {savedReels.length === 0 ? (
                <Card style={styles.savedEmpty}>
                  <View style={styles.savedEmptyIcon}>
                    <Bookmark
                      size={20}
                      color={colors.brand.deep}
                      strokeWidth={2.25}
                    />
                  </View>
                  <View style={styles.savedEmptyBody}>
                    <Text variant="button" color={colors.text.primary}>
                      No saved highlights yet
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>
                      Tap the bookmark icon on any reel to save it here.
                    </Text>
                  </View>
                </Card>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.savedRow}
                >
                  {savedReels.map((reel) => (
                    <SavedHighlightCard
                      key={reel.id}
                      reel={reel}
                      onOpen={() => handleOpenSaved(reel)}
                      onRemove={() => handleRemoveSaved(reel)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.list}>
              <SectionHeader title="Your highlight reels" />
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onPress={() => handleProjectPress(p)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  heroIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    flex: 1,
    gap: 2,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: radii.md,
    backgroundColor: colors.surface.chip,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  savedEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedEmptyBody: {
    flex: 1,
    gap: 2,
  },
  savedRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  savedCard: {
    width: 160,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.card,
    overflow: 'hidden',
    ...shadows.soft,
  },
  savedThumb: {
    width: '100%',
    height: 96,
    backgroundColor: colors.surface.chip,
  },
  savedPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedPlayBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBody: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 2,
  },
  savedRemove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
