import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Calendar, ChevronDown, UserPlus, Users } from 'lucide-react-native';
import { OrgAvatar, RoleBadge, SeasonPill, SkillLevelPill, Tag } from '@sports-yeti/ui';
import {
  DEMO_ORG_ID,
  divisionById,
  DEMO_PLAYER_ID,
  leagueById,
  organizationById,
  rosterForTeam,
  seasonById,
  teamsCaptainedBy,
  type Team,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { useRoleStack } from '../../features/role-stack';
import { RoleSwitcher } from '../../features/role-switcher';
import { WaiverProgressCard } from '../../features/waiver-gate';
import { useOpenSubRequests } from '../../features/sub-requests-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function CaptainHomeScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { roles, activeRole } = useRoleStack();
  const toast = useToast();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Captain's teams = teams where the demo player is the captain.
  const teams = useMemo(() => teamsCaptainedBy(DEMO_PLAYER_ID), []);
  // Seeded + session-posted sub requests, so a request created in the
  // SubRequestCreate flow shows up here immediately.
  const allOpenSubRequests = useOpenSubRequests();
  const subRequests = useMemo(() => {
    const myTeamIds = new Set(teams.map((t) => t.id));
    return allOpenSubRequests.filter((s) => myTeamIds.has(s.teamId));
  }, [teams, allOpenSubRequests]);

  // Waiver gate for the org-wide org waiver — captain needs this signed
  // to apply teams to a division. The DivisionApply screen enforces the
  // gate on its own CTA; this card mirrors progress on the home.
  const orgScopes = useMemo(
    () =>
      [{ kind: 'organization' as const, scopeId: DEMO_ORG_ID }],
    [],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerAvatar}>
            <Users size={20} color={colors.brand.primary} strokeWidth={2.25} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="eyebrow" color={colors.text.muted}>
              CAPTAIN
            </Text>
            {activeRole.scopeLabel ? (
              <Text variant="bodySm" color={colors.text.primary} style={styles.bold}>
                {activeRole.scopeLabel}
              </Text>
            ) : null}
          </View>
          {roles.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch role"
              onPress={() => setSwitcherOpen(true)}
              style={styles.switchPill}
            >
              <RoleBadge role="team_captain" />
              <ChevronDown size={14} color={colors.text.muted} />
            </Pressable>
          ) : null}
        </View>

        <Text variant="display" color={colors.text.primary} style={styles.title}>
          Run your roster
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          Build the team, get them paid, get them on a schedule.
        </Text>

        <View style={[styles.actionRow, { gap: spacing.sm }]}>
          <ActionButton
            label="Create team"
            description="Independent or applied to a division."
            onPress={() => navigation.navigate('TeamCreate')}
            primary
          />
          <ActionButton
            label="Open game"
            description="Set fee, request a referee."
            onPress={() => navigation.navigate('CreateGame')}
          />
        </View>

        <WaiverProgressCard
          scopes={orgScopes}
          action="apply your team to a division"
        />

        <SectionTitle title="Your teams" />
        {teams.length === 0 ? (
          <EmptyCard
            title="No teams yet"
            description="Create your first team to start inviting players."
            actionLabel="Create team"
            onAction={() => navigation.navigate('TeamCreate')}
          />
        ) : (
          teams.map((t) => <CaptainTeamCard key={t.id} team={t} />)
        )}

        <SectionTitle title="Sub requests" />
        {subRequests.length === 0 ? (
          <EmptyCard
            title="No open sub requests"
            description="Post one when you're short for a game."
            actionLabel="Post sub request"
            onAction={() => navigation.navigate('SubRequestCreate')}
          />
        ) : (
          subRequests.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={`Sub request: ${s.position ?? 'any position'}`}
              onPress={() =>
                navigation.navigate('SubRequestInbox', { teamId: s.teamId })
              }
              style={({ pressed }) => [
                styles.subCard,
                { opacity: pressed ? 0.92 : 1 },
              ]}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="body" style={styles.bold}>
                  {s.position ?? 'Any position'}
                </Text>
                {s.skillLevel ? (
                  <SkillLevelPill level={s.skillLevel} />
                ) : null}
                <Text variant="bodySm" color={colors.text.secondary}>
                  {s.applicantPlayerIds.length} applicant
                  {s.applicantPlayerIds.length === 1 ? '' : 's'}
                </Text>
              </View>
              {s.status === 'pending_captain_confirm' ? (
                <Tag size="sm" tone="warning" label="Confirm" leadingDot />
              ) : (
                <Tag size="sm" tone="info" label="Open" />
              )}
            </Pressable>
          ))
        )}

        <SectionTitle title="Browse" />
        <View style={[styles.actionRow, { gap: spacing.sm }]}>
          <ActionButton
            label="Player directory"
            description="Filter by city, skill, sub status."
            onPress={() => navigation.navigate('PlayerDirectory')}
          />
          <ActionButton
            label="Browse divisions"
            description="Apply your team to a registration window."
            onPress={() => navigation.navigate('DivisionApply')}
          />
        </View>
      </ScrollView>

      <RoleSwitcher
        visible={switcherOpen}
        onRequestClose={() => setSwitcherOpen(false)}
        onSwitch={() =>
          toast.show({ variant: 'info', title: 'Role switched' })
        }
      />
    </View>
  );
}

interface CaptainTeamCardProps {
  team: Team;
}
function CaptainTeamCard({ team }: CaptainTeamCardProps) {
  const navigation = useNavigation<Navigation>();
  const division = team.divisionId ? divisionById(team.divisionId) : undefined;
  const season = division ? seasonById(division.seasonId) : undefined;
  const league = division ? leagueById(division.leagueId) : undefined;
  const org = league ? organizationById(league.organizationId) : undefined;
  const roster = rosterForTeam(team.id);
  const paid = roster.filter((m) => m.paymentStatus === 'paid').length;
  const total = roster.length;
  const waiversSigned = roster.filter((m) => m.waiversSigned).length;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${team.name}`}
      onPress={() => navigation.navigate('TeamRoster', { teamId: team.id })}
      style={({ pressed }) => [
        styles.teamCard,
        { opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <View style={[styles.teamHead, { gap: spacing.sm }]}>
        {org ? (
          <OrgAvatar
            name={org.name}
            logoUrl={org.logoUrl}
            brandColor={org.brandColor}
            size="md"
          />
        ) : (
          <View style={styles.headerAvatar}>
            <Users size={18} color={colors.brand.primary} strokeWidth={2.25} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyLg" style={styles.bold}>
            {team.name}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {team.sport} · {team.skillLevel} · {team.city}
          </Text>
        </View>
        <ArrowRight size={18} color={colors.text.muted} />
      </View>

      <View style={[styles.teamMeta, { gap: spacing.xs }]}>
        {division && season ? (
          <>
            <SeasonPill cycle={season.cycle} year={season.year} />
            <Tag size="sm" tone="info" label={division.name} />
          </>
        ) : (
          <Tag size="sm" tone="warning" label="Independent" leadingDot />
        )}
        <Tag
          size="sm"
          tone={team.status === 'approved' ? 'success' : 'warning'}
          label={team.status.replace('_', ' ')}
          leadingDot
        />
      </View>

      <View style={[styles.teamStats, { gap: spacing.lg }]}>
        <Stat label="Roster" value={`${total} / ${team.rosterMax}`} />
        <Stat label="Paid" value={`${paid} / ${total}`} />
        <Stat label="Waivers" value={`${waiversSigned} / ${total}`} />
      </View>
    </Pressable>
  );
}

interface StatProps {
  label: string;
  value: string;
}
function Stat({ label, value }: StatProps) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="eyebrow" color={colors.text.muted}>
        {label}
      </Text>
      <Text variant="bodyLg" color={colors.text.primary} style={styles.bold}>
        {value}
      </Text>
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  description: string;
  onPress: () => void;
  primary?: boolean;
}
function ActionButton({ label, description, onPress, primary }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        {
          backgroundColor: primary ? colors.brand.primary : colors.surface.card,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Text
        variant="bodyLg"
        color={primary ? colors.text.inverse : colors.text.primary}
        style={styles.bold}
      >
        {label}
      </Text>
      <Text
        variant="bodySm"
        color={primary ? colors.text.inverse : colors.text.secondary}
      >
        {description}
      </Text>
    </Pressable>
  );
}

interface SectionTitleProps {
  title: string;
}
function SectionTitle({ title }: SectionTitleProps) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text variant="h3" color={colors.text.primary}>
        {title}
      </Text>
    </View>
  );
}

interface EmptyCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}
function EmptyCard({ title, description, actionLabel, onAction }: EmptyCardProps) {
  return (
    <View style={styles.emptyCard}>
      <Calendar size={20} color={colors.text.muted} />
      <Text variant="body" color={colors.text.primary} style={styles.bold}>
        {title}
      </Text>
      <Text variant="bodySm" color={colors.text.secondary} align="center">
        {description}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onAction}
        style={({ pressed }) => [
          styles.emptyAction,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <UserPlus size={14} color={colors.text.inverse} strokeWidth={2.4} />
        <Text variant="bodySm" color={colors.text.inverse} style={styles.bold}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.soft,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.6,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: radii.lg,
    gap: 4,
    ...shadows.soft,
  },
  sectionTitleWrap: {
    marginTop: spacing.lg,
  },
  teamCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  teamHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  teamStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  emptyCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.soft,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primary,
    marginTop: spacing.sm,
  },
  bold: {
    fontWeight: '600',
  },
});
