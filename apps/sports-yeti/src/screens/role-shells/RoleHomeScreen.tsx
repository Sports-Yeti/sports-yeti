import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Users } from 'lucide-react-native';
import { OrgAvatar, RoleBadge, Tag } from '@sports-yeti/ui';
import {
  organizationById,
  type Role,
  type RoleAssignment,
} from '@sports-yeti/mocks';
import { Text, useToast } from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import { useRoleStack } from '../../features/role-stack';
import { RoleSwitcher } from '../../features/role-switcher';

export interface RoleHomeScreenProps {
  /** Filter to a specific role (used when this screen is mounted as a tab inside that role's tab navigator). */
  expectedRole?: Role;
}

const ROLE_HEROES: Record<Role, { eyebrow: string; title: string; description: string }> = {
  player: {
    eyebrow: 'PLAYER',
    title: 'Discover, schedule, play',
    description: 'Discover open games, manage your team, share highlights.',
  },
  team_captain: {
    eyebrow: 'CAPTAIN',
    title: 'Build your team',
    description: 'Invite players, apply to a division, run open games.',
  },
  referee: {
    eyebrow: 'REFEREE',
    title: 'Officiate the game',
    description: 'Accept assignments, bid on marketplace games, submit reports.',
  },
  facility_manager: {
    eyebrow: 'FACILITY MANAGER',
    title: 'Run the venue',
    description: 'Approve bookings, manage spaces, watch utilization.',
  },
  league_admin: {
    eyebrow: 'LEAGUE ADMIN',
    title: 'Run the league',
    description: 'Schedule, approve teams, publish news.',
  },
  org_admin: {
    eyebrow: 'ORG ADMIN',
    title: 'Run the organization',
    description: 'Cross-league oversight: leagues, facilities, money, news.',
  },
};

const QUICK_ACTIONS_BY_ROLE: Record<Role, { label: string; description: string }[]> = {
  player: [
    { label: 'Discover open games', description: 'Filter by sport, date, distance.' },
    { label: 'Update profile', description: 'Looking for team, available to sub.' },
    { label: 'View your waivers', description: 'Sign anything blocking play.' },
  ],
  team_captain: [
    { label: 'Apply your team to a division', description: 'See registration windows + fees.' },
    { label: 'Invite players', description: 'Filter the directory by city + skill.' },
    { label: 'Create an open game', description: 'Set fee, request a referee.' },
  ],
  referee: [
    { label: 'Open the marketplace', description: 'Bid on nearby games.' },
    { label: 'Review your assignments', description: 'Pending, accepted, ready-for-report.' },
    { label: 'Submit a game report', description: 'Score + infractions; payout queued.' },
  ],
  facility_manager: [
    { label: 'Today on the calendar', description: 'Internal vs external split.' },
    { label: 'Pending external rentals', description: 'Approve, reject, or counter.' },
    { label: 'Update space availability', description: 'Day-of-week × time grid.' },
  ],
  league_admin: [
    { label: 'Open Approvals', description: 'Pending team applications.' },
    { label: 'Generate fixtures', description: 'Round-robin or playoff bracket.' },
    { label: 'Compose news', description: 'Cross-post to socials.' },
  ],
  org_admin: [
    { label: 'Org pulse', description: 'KPIs across leagues + facilities.' },
    { label: 'Money', description: 'Gross, net, outstanding.' },
    { label: 'Branding', description: 'Color ripples through the app.' },
  ],
};

/**
 * Generic per-role landing screen used as the placeholder Home tab for
 * Captain / Referee / FM / LeagueAdmin / OrgAdmin roles in Phase 3.
 *
 * Phases 4–8 replace these with real journey screens.
 */
export function RoleHomeScreen({ expectedRole }: RoleHomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { activeRole, roles } = useRoleStack();
  const toast = useToast();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const role = expectedRole ?? activeRole.role;
  const hero = ROLE_HEROES[role];
  const actions = QUICK_ACTIONS_BY_ROLE[role];
  const scopeLabel = activeRole.scopeLabel;
  const scopeOrg =
    activeRole.scopeId && role === 'org_admin'
      ? organizationById(activeRole.scopeId)
      : undefined;

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
          {scopeOrg ? (
            <OrgAvatar
              name={scopeOrg.name}
              logoUrl={scopeOrg.logoUrl}
              brandColor={scopeOrg.brandColor}
              size="md"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Users size={20} color={colors.brand.primary} strokeWidth={2.25} />
            </View>
          )}
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="eyebrow" color={colors.text.muted}>
              {hero.eyebrow}
            </Text>
            {scopeLabel ? (
              <Text variant="bodySm" color={colors.text.primary} style={styles.bold}>
                {scopeLabel}
              </Text>
            ) : null}
          </View>
          {roles.length > 1 ? (
            <SwitchRolePill onPress={() => setSwitcherOpen(true)} />
          ) : null}
        </View>

        <Text variant="display" color={colors.text.primary} style={styles.title}>
          {hero.title}
        </Text>
        <Text variant="body" color={colors.text.secondary}>
          {hero.description}
        </Text>

        <View style={[styles.actionStack, { gap: spacing.md }]}>
          {actions.map((a) => (
            <View key={a.label} style={styles.actionCard}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodyLg" style={styles.bold}>
                  {a.label}
                </Text>
                <Text variant="bodySm" color={colors.text.secondary}>
                  {a.description}
                </Text>
              </View>
              <Tag size="sm" tone="brand" label="Soon" />
            </View>
          ))}
        </View>

        <View style={styles.footnote}>
          <Text variant="caption" color={colors.text.muted}>
            This is the Phase 3 placeholder. The full journeys for this role
            land in {roleNextPhase(role)}.
          </Text>
        </View>
      </ScrollView>

      <RoleSwitcher
        visible={switcherOpen}
        onRequestClose={() => setSwitcherOpen(false)}
        onSwitch={() =>
          toast.show({
            variant: 'info',
            title: 'Role switched',
            description: 'New tab bar is morphing in.',
          })
        }
      />
    </View>
  );
}

interface SwitchPillProps {
  onPress: () => void;
}
function SwitchRolePill({ onPress }: SwitchPillProps) {
  const { activeRole } = useRoleStack();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Switch role"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { gap: 4, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <RoleBadge role={activeRole.role} />
      <ChevronDown size={14} color={colors.text.muted} />
    </Pressable>
  );
}

function roleNextPhase(role: Role): string {
  switch (role) {
    case 'player':
      return 'Phase 5';
    case 'team_captain':
      return 'Phase 4';
    case 'referee':
      return 'Phase 6';
    case 'facility_manager':
      return 'Phase 7';
    case 'org_admin':
      return 'Phase 8';
    case 'league_admin':
      return 'Phase 1 (admin) + Phase 9 (news)';
  }
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
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.soft,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.6,
    marginTop: spacing.sm,
  },
  actionStack: {
    width: '100%',
    marginTop: spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    padding: spacing.lg,
    ...shadows.card,
  },
  footnote: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  bold: {
    fontWeight: '600',
  },
});
