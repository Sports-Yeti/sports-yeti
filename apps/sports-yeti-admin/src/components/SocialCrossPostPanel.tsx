import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Calendar, Send } from 'lucide-react-native';
import { SocialChannelChip, type SocialChannel } from '@sports-yeti/ui';
import { type Organization } from '@sports-yeti/mocks';
import { Card, Input, Text, useToast } from '../ui';
import { colors, radii, spacing } from '../theme';
import { SocialPreviewCard } from './SocialPreviewCard';

const ALL_CHANNELS: SocialChannel[] = ['x', 'facebook', 'instagram', 'linkedin'];

const CHAR_HINTS: Record<SocialChannel, string> = {
  x: 'Keep it under 280. Add a link.',
  facebook: 'Long-form OK. End with a CTA.',
  instagram: 'Hashtag-friendly. Match your visual brand.',
  linkedin: 'Professional voice. Tag staff.',
};

export interface SocialCrossPostPanelProps {
  org: Organization;
  /** The article body — used to seed each channel's copy on first render. */
  initialCopy: string;
  imageUrl?: string;
  onPostNow?: (drafts: Record<SocialChannel, string>, channels: SocialChannel[]) => void;
  onSchedule?: (
    drafts: Record<SocialChannel, string>,
    channels: SocialChannel[],
    scheduledIso: string,
  ) => void;
}

export function SocialCrossPostPanel({
  org,
  initialCopy,
  imageUrl,
  onPostNow,
  onSchedule,
}: SocialCrossPostPanelProps) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<SocialChannel>>(
    new Set(['instagram', 'facebook']),
  );
  const [copyByChannel, setCopyByChannel] = useState<
    Record<SocialChannel, string>
  >({
    x: initialCopy.slice(0, 240),
    facebook: initialCopy,
    instagram: initialCopy.slice(0, 200),
    linkedin: initialCopy,
  });
  const [scheduledIso, setScheduledIso] = useState('');

  function toggleChannel(c: SocialChannel) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function setCopyFor(c: SocialChannel, v: string) {
    setCopyByChannel((prev) => ({ ...prev, [c]: v }));
  }

  function postNow() {
    const arr = Array.from(selected);
    if (arr.length === 0) {
      toast.show({ variant: 'warning', title: 'Pick at least one channel' });
      return;
    }
    onPostNow?.(copyByChannel, arr);
    toast.show({
      variant: 'success',
      title: 'Posted (mock)',
      description: `Cross-posted to ${arr.length} channel${arr.length === 1 ? '' : 's'}.`,
    });
  }

  function schedule() {
    const arr = Array.from(selected);
    if (arr.length === 0) {
      toast.show({ variant: 'warning', title: 'Pick at least one channel' });
      return;
    }
    if (!scheduledIso) {
      toast.show({ variant: 'warning', title: 'Set a date + time first' });
      return;
    }
    onSchedule?.(copyByChannel, arr, scheduledIso);
    toast.show({
      variant: 'success',
      title: 'Scheduled (mock)',
      description: `Will post to ${arr.length} channel${arr.length === 1 ? '' : 's'} at ${scheduledIso}.`,
    });
  }

  return (
    <Card padded>
      <Text variant="h3">Cross-post</Text>
      <Text variant="body" color={colors.text.secondary}>
        Pick the channels and tweak the copy per platform. Live previews
        update as you type.
      </Text>

      <View style={[styles.row, { gap: spacing.sm, marginTop: 12 }]}>
        {ALL_CHANNELS.map((c) => (
          <SocialChannelChip
            key={c}
            channel={c}
            selected={selected.has(c)}
            onPress={() => toggleChannel(c)}
            status={org.socialIntegrationStatus[c] ?? 'disconnected'}
          />
        ))}
      </View>

      {Array.from(selected).map((c) => (
        <View key={c} style={[styles.editor, { gap: 6 }]}>
          <Text variant="eyebrow" color={colors.text.muted}>
            {c.toUpperCase()} COPY
          </Text>
          <Input
            value={copyByChannel[c]}
            onChangeText={(v) => setCopyFor(c, v)}
            placeholder={CHAR_HINTS[c]}
          />
        </View>
      ))}

      <View style={[styles.row, { gap: spacing.md, marginTop: spacing.md }]}>
        <View style={{ flex: 1 }}>
          <Text variant="eyebrow" color={colors.text.secondary}>
            Schedule (ISO date-time)
          </Text>
          <Input
            value={scheduledIso}
            onChangeText={setScheduledIso}
            placeholder="2026-04-25T17:00:00Z"
          />
        </View>
      </View>

      <View style={[styles.actionRow, { gap: spacing.sm, marginTop: 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Schedule"
          onPress={schedule}
          style={({ pressed }) => [
            styles.scheduleBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Calendar size={14} color={colors.text.primary} strokeWidth={2.4} />
          <Text variant="bodySm" color={colors.text.primary} weight="600">
            Schedule
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Post now"
          onPress={postNow}
          style={({ pressed }) => [
            styles.postBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Send size={14} color={colors.text.inverse} strokeWidth={2.4} />
          <Text variant="bodySm" color={colors.text.inverse} weight="600">
            Post now
          </Text>
        </Pressable>
      </View>

      <Text variant="h3" style={{ marginTop: spacing.lg }}>
        Live previews
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.md, paddingTop: 12 }}
      >
        {Array.from(selected).map((c) => (
          <View key={c} style={styles.previewSlot}>
            <SocialPreviewCard
              channel={c}
              org={org}
              copy={copyByChannel[c]}
              imageUrl={imageUrl}
            />
          </View>
        ))}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  editor: {
    width: '100%',
    marginTop: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primary,
  },
  previewSlot: {
    width: 320,
  },
});
