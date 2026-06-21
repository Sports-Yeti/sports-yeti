import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  CheckCircle2,
  ChevronLeft,
  Download,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  Star,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Button,
  Card,
  EmptyState,
  IconBadge,
  Input,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  HIGHLIGHT_PROJECTS,
  type HighlightClip,
} from '../../mocks/highlights';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'HighlightDetail'>;
type Route = RouteProp<RootStackParamList, 'HighlightDetail'>;

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function ClipCard({
  clip,
  selected,
  onToggleSelect,
  onShare,
  onDownload,
  onPreview,
}: {
  clip: HighlightClip;
  selected: boolean;
  onToggleSelect: () => void;
  onShare: () => void;
  onDownload: () => void;
  onPreview: () => void;
}) {
  return (
    <Card style={[styles.clipCard, selected ? styles.clipCardSelected : null]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${selected ? 'Deselect' : 'Select'} clip ${clip.title}`}
        onPress={onToggleSelect}
        hitSlop={8}
        style={styles.checkboxRow}
      >
        <View
          style={[
            styles.checkbox,
            selected ? styles.checkboxSelected : null,
          ]}
        >
          {selected ? (
            <CheckCircle2
              size={20}
              color={colors.text.inverse}
              strokeWidth={2.5}
            />
          ) : null}
        </View>
        <Text variant="caption" color={colors.text.secondary}>
          {selected ? 'Selected' : 'Select for posting'}
        </Text>
      </Pressable>

      <View style={styles.clipBody}>
        <Pressable
          onPress={onPreview}
          accessibilityRole="button"
          accessibilityLabel={`Preview clip: ${clip.title}`}
        >
          <View style={styles.thumbWrap}>
            <Image
              source={{ uri: clip.thumbnail }}
              style={styles.thumb}
              contentFit="cover"
              accessibilityLabel="Clip thumbnail"
            />
            <View style={styles.playOverlay}>
              <Play
                size={20}
                color={colors.text.inverse}
                strokeWidth={2.5}
                fill={colors.text.inverse}
              />
            </View>
          </View>
        </Pressable>

        <View style={styles.clipText}>
          <View style={styles.clipHead}>
            <Text variant="button" color={colors.text.primary}>
              {clip.title}
            </Text>
            <View style={styles.scoreBadge}>
              <Star size={14} color="#B26200" strokeWidth={2.25} />
              <Text variant="caption" color={colors.text.secondary}>
                {clip.excitementScore}/5
              </Text>
            </View>
          </View>
          <Text variant="caption" color={colors.text.secondary}>
            {formatTimecode(clip.startSeconds)} – {formatTimecode(clip.endSeconds)} ·{' '}
            {(clip.endSeconds - clip.startSeconds).toFixed(0)}s
          </Text>
          <Text variant="bodySm" color={colors.text.primary}>
            {clip.description}
          </Text>
        </View>
      </View>

      <View style={styles.clipActions}>
        <Button
          label="Share"
          variant="ghost"
          size="sm"
          leadingIcon={
            <Send size={14} color={colors.brand.primary} strokeWidth={2.5} />
          }
          onPress={onShare}
        />
        <Button
          label="Download"
          variant="ghost"
          size="sm"
          leadingIcon={
            <Download size={14} color={colors.brand.primary} strokeWidth={2.5} />
          }
          onPress={onDownload}
        />
      </View>
    </Card>
  );
}

export function HighlightDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const project = HIGHLIGHT_PROJECTS.find((p) => p.id === route.params.id);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [composerOpen, setComposerOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [audience, setAudience] = useState<'public' | 'team'>('public');
  const [posted, setPosted] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const clips = useMemo(() => project?.clips ?? [], [project]);
  const selectAll = () => setSelected(new Set(clips.map((c) => c.id)));
  const clearAll = () => setSelected(new Set());
  const toggleClip = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!project) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Highlight not found"
          description="It may have been deleted or expired."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const handleShareClip = async (clip: HighlightClip) => {
    Haptics.selectionAsync();
    try {
      await Share.share({
        title: clip.title,
        message: `${clip.title} — ${clip.description}\n${clip.clipUrl}`,
      });
    } catch {
      // user cancelled
    }
  };

  const handleDownload = (clip: HighlightClip) => {
    Haptics.selectionAsync();
    toast.show({
      variant: 'success',
      title: `Saved "${clip.title}" to camera roll`,
    });
  };

  const handlePost = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setComposerOpen(false);
    setPosted(true);
    toast.show({
      variant: 'success',
      title: 'Posted to feed',
      description: `${selected.size} clip${selected.size === 1 ? '' : 's'} live now.`,
      action: {
        label: 'View',
        onPress: () =>
          navigation.navigate('MainTabs', { screen: 'Highlights' }),
      },
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Regenerate AI clips"
            hitSlop={8}
            onPress={() => setConfirmRegen(true)}
            style={styles.iconBtn}
          >
            <RefreshCw size={20} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        </View>

        <View style={styles.heroBlock}>
          <IconBadge size={56} tone="brand">
            <Sparkles size={24} color={colors.brand.deep} strokeWidth={2.25} />
          </IconBadge>
          <Text variant="h1" color={colors.text.primary}>
            {project.title}
          </Text>
          <Text variant="body" color={colors.text.secondary}>
            {clips.length} clip{clips.length === 1 ? '' : 's'} from a{' '}
            {Math.round(project.sourceVideoSeconds / 60)}-minute source
          </Text>
        </View>

        {project.aiSummary ? (
          <Card style={styles.summaryCard}>
            <Text variant="eyebrow" color={colors.brand.primary}>
              AI Summary
            </Text>
            <Text variant="body" color={colors.text.primary}>
              {project.aiSummary}
            </Text>
          </Card>
        ) : null}

        <View style={styles.selectorBar}>
          <Text variant="button" color={colors.text.primary}>
            {selected.size}/{clips.length} selected
          </Text>
          <View style={styles.selectorActions}>
            <Pressable
              onPress={selectAll}
              accessibilityRole="button"
              accessibilityLabel="Select all clips"
              hitSlop={6}
            >
              <Text variant="button" color={colors.brand.primary}>
                Select all
              </Text>
            </Pressable>
            {selected.size > 0 ? (
              <Pressable
                onPress={clearAll}
                accessibilityRole="button"
                accessibilityLabel="Clear selection"
                hitSlop={6}
              >
                <Text variant="button" color={colors.text.secondary}>
                  Clear
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.clipsList}>
          {clips.map((clip) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              selected={selected.has(clip.id)}
              onToggleSelect={() => toggleClip(clip.id)}
              onShare={() => handleShareClip(clip)}
              onDownload={() => handleDownload(clip)}
              onPreview={() =>
                toast.show({
                  variant: 'info',
                  title: 'Preview coming soon',
                })
              }
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {posted ? (
          <View style={styles.postedRow}>
            <Tag tone="success" leadingDot label="Shared to feed" />
            <Button
              label="View on feed"
              variant="ghost"
              size="md"
              onPress={() =>
                navigation.navigate('MainTabs', { screen: 'Highlights' })
              }
            />
          </View>
        ) : (
          <Button
            label={
              selected.size > 0
                ? `Post ${selected.size} clip${selected.size === 1 ? '' : 's'}`
                : 'Select clips to post'
            }
            variant="gradient"
            size="lg"
            fullWidth
            disabled={selected.size === 0}
            onPress={() => {
              setCaption('');
              setComposerOpen(true);
            }}
          />
        )}
      </View>

      <Modal
        visible={composerOpen}
        onRequestClose={() => setComposerOpen(false)}
        variant="info"
        title={`Post ${selected.size} clip${selected.size === 1 ? '' : 's'}`}
        description="Add a caption and choose your audience."
        primaryAction={{ label: 'Post to feed', onPress: handlePost }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setComposerOpen(false),
        }}
      >
        <View style={styles.composerBody}>
          <Input
            placeholder="What's the story behind these moments?"
            value={caption}
            onChangeText={setCaption}
            variant="multiline"
            maxLength={280}
          />
          <View style={styles.audienceRow}>
            <Pressable
              onPress={() => setAudience('public')}
              accessibilityRole="radio"
              accessibilityState={{ selected: audience === 'public' }}
              style={[
                styles.audienceOption,
                audience === 'public' ? styles.audienceSelected : null,
              ]}
            >
              <Text
                variant="button"
                color={
                  audience === 'public' ? colors.brand.deep : colors.text.primary
                }
              >
                Public
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAudience('team')}
              accessibilityRole="radio"
              accessibilityState={{ selected: audience === 'team' }}
              style={[
                styles.audienceOption,
                audience === 'team' ? styles.audienceSelected : null,
              ]}
            >
              <Text
                variant="button"
                color={
                  audience === 'team' ? colors.brand.deep : colors.text.primary
                }
              >
                Team only
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmRegen}
        onRequestClose={() => setConfirmRegen(false)}
        variant="info"
        title="Regenerate AI clips?"
        description="We'll re-analyze the source video. Free if the original generation was within the last 7 days."
        primaryAction={{
          label: 'Regenerate',
          onPress: () => {
            setConfirmRegen(false);
            toast.show({
              variant: 'info',
              title: 'Regeneration started',
              description: "We'll notify you when new clips are ready.",
            });
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmRegen(false),
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
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroBlock: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  summaryCard: {
    gap: spacing.sm,
    backgroundColor: colors.brand.soft,
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  clipsList: {
    gap: spacing.md,
  },
  clipCard: {
    gap: spacing.md,
  },
  clipCardSelected: {
    borderWidth: 2,
    borderColor: colors.brand.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  clipBody: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumbWrap: {
    width: 96,
    height: 96,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface.chip,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  clipText: {
    flex: 1,
    gap: 4,
  },
  clipHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clipActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
    paddingTop: spacing.sm,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  postedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  composerBody: {
    width: '100%',
    gap: spacing.md,
  },
  audienceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  audienceOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
});
