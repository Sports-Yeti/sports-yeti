import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/provider';
import { UIText } from '../text/ui-text';
import { Tag } from '../display/tag';
import { Skeleton } from '../display/skeleton';
import { EmptyState } from '../display/empty-state';
import { Tabs } from '../layout/tabs';
import { UIModal } from '../layout/modal';
import { BottomSheet } from '../layout/bottom-sheet';
import { Wordmark } from '../branding/wordmark';
import { OrgAvatar } from '../branding/org-avatar';
import { RoleBadge } from '../branding/role-badge';
import { SeasonPill } from '../branding/season-pill';
import { SkillLevelPill } from '../branding/skill-level-pill';
import { SocialChannelChip } from '../branding/social-channel-chip';

/**
 * Live story for every non-form primitive in @sports-yeti/ui.
 *
 * Drop into any screen to verify the design system end-to-end on
 * mobile (`comfortable` density) and admin (`compact` density).
 *
 * Sister story for the form controls is `<FormControlsGallery>`.
 */
export function UIGallery() {
  const { colors, spacing } = useTheme();
  const [tab, setTab] = useState('overview');
  const [pillTab, setPillTab] = useState('open');
  const [segTab, setSegTab] = useState('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [destructiveOpen, setDestructiveOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    'instagram',
  ]);

  function toggleChannel(channel: string) {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.bg }}
      contentContainerStyle={[
        styles.container,
        { padding: spacing.lg, gap: spacing.xl },
      ]}
    >
      <Section title="Branding">
        <Wordmark size="sm" />
        <Wordmark size="md" />
        <Wordmark size="lg" subLabel="Marketplace" />
        <View style={[styles.row, { gap: spacing.md }]}>
          <OrgAvatar name="Yeti Collective" brandColor="#006495" size="sm" />
          <OrgAvatar name="Yeti Collective" brandColor="#006495" size="md" />
          <OrgAvatar name="Yeti Collective" brandColor="#006495" size="lg" />
          <OrgAvatar
            name="Front Range Sports"
            brandColor="#A14A1B"
            size="lg"
          />
        </View>
      </Section>

      <Section title="Tags">
        <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
          <Tag label="Neutral" tone="neutral" />
          <Tag label="Brand" tone="brand" />
          <Tag label="Live" tone="live" leadingDot />
          <Tag label="Approved" tone="success" />
          <Tag label="Pending" tone="warning" />
          <Tag label="Failed" tone="error" />
          <Tag label="Info" tone="info" />
        </View>
      </Section>

      <Section title="Marketplace pills">
        <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
          <SeasonPill cycle="spring_summer" year={2026} />
          <SeasonPill cycle="fall_winter" year={2025} />
          <SkillLevelPill level="recreational" />
          <SkillLevelPill level="intermediate" />
          <SkillLevelPill level="competitive" />
          <SkillLevelPill level="elite" />
        </View>
        <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
          <RoleBadge role="player" />
          <RoleBadge role="team_captain" />
          <RoleBadge role="referee" />
          <RoleBadge role="facility_manager" />
          <RoleBadge role="league_admin" />
          <RoleBadge role="org_admin" />
        </View>
      </Section>

      <Section title="Social channel chips">
        <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
          <SocialChannelChip
            channel="x"
            selected={selectedChannels.includes('x')}
            onPress={() => toggleChannel('x')}
            status="connected"
          />
          <SocialChannelChip
            channel="facebook"
            selected={selectedChannels.includes('facebook')}
            onPress={() => toggleChannel('facebook')}
            status="connected"
          />
          <SocialChannelChip
            channel="instagram"
            selected={selectedChannels.includes('instagram')}
            onPress={() => toggleChannel('instagram')}
            status="connected"
          />
          <SocialChannelChip
            channel="linkedin"
            selected={selectedChannels.includes('linkedin')}
            onPress={() => toggleChannel('linkedin')}
            status="expired"
          />
        </View>
      </Section>

      <Section title="Tabs — underline">
        <Tabs
          items={[
            { key: 'overview', label: 'Overview' },
            { key: 'roster', label: 'Roster', badge: '12' },
            { key: 'schedule', label: 'Schedule' },
            { key: 'standings', label: 'Standings' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </Section>

      <Section title="Tabs — segmented">
        <Tabs
          variant="segmented"
          items={[
            { key: 'list', label: 'List' },
            { key: 'calendar', label: 'Calendar' },
            { key: 'map', label: 'Map' },
          ]}
          value={segTab}
          onChange={setSegTab}
        />
      </Section>

      <Section title="Tabs — pill">
        <Tabs
          variant="pill"
          items={[
            { key: 'open', label: 'Open' },
            { key: 'pending', label: 'Pending', badge: '3' },
            { key: 'closed', label: 'Closed' },
          ]}
          value={pillTab}
          onChange={setPillTab}
        />
      </Section>

      <Section title="Skeletons (loading mirror)">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="80%" height={14} />
        <Skeleton variant="text" width="65%" height={14} />
        <View style={[styles.row, { gap: spacing.md, marginTop: spacing.md }]}>
          <Skeleton variant="circle" width={48} height={48} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="40%" height={12} />
          </View>
        </View>
      </Section>

      <Section title="Modals">
        <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
          <Tag
            label="Open info modal"
            tone="brand"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ onPress: () => setModalOpen(true) } as any)}
          />
          <Tag
            label="Open destructive modal"
            tone="error"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ onPress: () => setDestructiveOpen(true) } as any)}
          />
          <Tag
            label="Open bottom sheet"
            tone="info"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ onPress: () => setSheetOpen(true) } as any)}
          />
        </View>
        <UIModal
          visible={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          title="Heads up"
          description="You're about to publish the schedule. Players will receive a push notification."
          variant="info"
          primaryAction={{
            label: 'Publish',
            onPress: () => setModalOpen(false),
          }}
          secondaryAction={{
            label: 'Cancel',
            onPress: () => setModalOpen(false),
          }}
        />
        <UIModal
          visible={destructiveOpen}
          onRequestClose={() => setDestructiveOpen(false)}
          title="Delete this division?"
          description="All teams in this division will be returned to pending. This cannot be undone."
          variant="destructive"
          primaryAction={{
            label: 'Delete',
            onPress: () => setDestructiveOpen(false),
          }}
          secondaryAction={{
            label: 'Cancel',
            onPress: () => setDestructiveOpen(false),
          }}
        />
        <BottomSheet
          visible={sheetOpen}
          onRequestClose={() => setSheetOpen(false)}
          title="Pick a sport"
          snapPoints={['40%']}
        >
          <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
            <Tag label="Soccer" tone="brand" />
            <Tag label="Basketball" tone="brand" />
            <Tag label="Volleyball" tone="brand" />
            <Tag label="Pickleball" tone="brand" />
          </View>
        </BottomSheet>
      </Section>

      <Section title="Empty state">
        <EmptyState
          title="No games this week"
          description="Filter by sport or date to find one, or check back tomorrow."
          primaryAction={{ label: 'Browse Discover', onPress: () => undefined }}
          secondaryAction={{ label: 'Open filters', onPress: () => undefined }}
        />
      </Section>
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  const { colors, spacing, radii, shadows } = useTheme();
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.surface.card,
          borderRadius: radii.card,
          padding: spacing.lg,
          gap: spacing.md,
          ...shadows.card,
        },
      ]}
    >
      <UIText variant="h3">{title}</UIText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
  },
  section: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
