import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Coins,
  Flame,
  Inbox,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wrench,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  SectionHeader,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { type WebPressableState } from '../../lib/pressable';
import { colors, radii, shadows, spacing } from '../../theme';
import { pendingTeams } from '../../mocks/teams';
import { pendingBookings } from '../../mocks/bookings';
import { PAYMENTS } from '../../mocks/payments';
import { DASHBOARD_ALERTS } from '../../mocks/insights';
import { LEAGUES } from '../../mocks/leagues';
import { liveGames } from '../../mocks/games';
import { formatCurrency, formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'money', label: 'Money' },
];

/**
 * Unified morning queue for league operators. Surfaces pending team
 * applications, pending bookings, failed payments, and live alerts in
 * one place so the JTBD "what needs my attention right now" can be
 * resolved without crawling 6 sidebar items. Mock-only.
 */
export function OperationsScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [tab, setTab] = useState('all');

  const teamsPending = useMemo(() => pendingTeams(), []);
  const bookingsPending = useMemo(() => pendingBookings(), []);
  const failedPayments = useMemo(
    () => PAYMENTS.filter((p) => p.status === 'failed'),
    [],
  );
  const liveCount = useMemo(() => liveGames().length, []);
  const alerts = DASHBOARD_ALERTS;

  const total =
    teamsPending.length +
    bookingsPending.length +
    failedPayments.length +
    alerts.length;

  const filtered = useMemo(() => {
    return {
      approvals:
        tab === 'all' || tab === 'approvals'
          ? [...teamsPending, ...bookingsPending]
          : [],
      money:
        tab === 'all' || tab === 'money' ? failedPayments : [],
      alerts: tab === 'all' || tab === 'alerts' ? alerts : [],
    };
  }, [tab, teamsPending, bookingsPending, failedPayments, alerts]);

  const handleResolveAlert = (label: string) =>
    toast.show({
      variant: 'success',
      title: `${label} resolved`,
    });

  return (
    <PageScroll>
      <PageHeader
        variant="flatHero"
        eyebrow="MORNING QUEUE"
        title="Operations"
        subtitle="Approvals, alerts, and failed payments — handle the day's friction in one place."
        meta={`${total} item${total === 1 ? '' : 's'} need attention`}
        trailing={
          <Button
            label="Mark all reviewed"
            variant="ghost"
            size="sm"
            leadingIcon={
              <CheckCircle2
                size={14}
                color={colors.brand.primary}
                strokeWidth={2.5}
              />
            }
            onPress={() =>
              toast.show({
                variant: 'success',
                title: 'Queue reviewed — fresh items will surface here',
              })
            }
          />
        }
      />

      <View style={styles.statsRow}>
        <StatCard
          label="Approvals"
          value={String(teamsPending.length + bookingsPending.length)}
          tone="brand"
          icon={
            <ShieldCheck
              size={18}
              color={colors.brand.primary}
              strokeWidth={2.25}
            />
          }
          trendCopy={`${teamsPending.length} teams • ${bookingsPending.length} bookings`}
          urgent={teamsPending.length + bookingsPending.length > 4}
        />
        <StatCard
          label="Live games"
          value={String(liveCount)}
          tone="alpine"
          icon={
            <Flame size={18} color={colors.brand.alpine} strokeWidth={2.25} />
          }
          trendCopy={liveCount === 0 ? 'No games on right now' : 'Streaming live'}
        />
        <StatCard
          label="Failed payments"
          value={String(failedPayments.length)}
          tone={failedPayments.length === 0 ? 'success' : 'live'}
          icon={
            <Wallet
              size={18}
              color={
                failedPayments.length === 0
                  ? colors.status.success
                  : colors.status.live
              }
              strokeWidth={2.25}
            />
          }
          trendCopy={
            failedPayments.length === 0
              ? 'All clear'
              : `${formatCurrency(
                  failedPayments.reduce((acc, p) => acc + p.amountCents, 0),
                )} stuck`
          }
          urgent={failedPayments.length > 0}
        />
        <StatCard
          label="System alerts"
          value={String(alerts.length)}
          tone="warning"
          icon={
            <AlertTriangle
              size={18}
              color={colors.status.warning}
              strokeWidth={2.25}
            />
          }
          trendCopy={alerts.length === 0 ? 'All clear' : 'Review below'}
        />
      </View>

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      {/* APPROVALS */}
      {filtered.approvals.length > 0 ? (
        <View style={styles.sectionBlock}>
          <SectionHeader
            icon={
              <Inbox size={20} color={colors.brand.deep} strokeWidth={2.25} />
            }
            title="Awaiting your approval"
            description="Pending team registrations and booking requests."
            tone="brand"
          />
          <View style={styles.list}>
            {teamsPending.map((t) => (
              <QueueRow
                key={`team-${t.id}`}
                avatar={t.abbreviation}
                title={t.name}
                subtitle={`${t.leagueName} · applied ${formatRelative(
                  t.appliedAtIso,
                )}`}
                tag={{ label: 'Team application', tone: 'brand' }}
                meta={`${t.roster.length}/${t.rosterMax} roster · ${formatCurrency(
                  t.feeTotalCents,
                )} fee`}
                primary={{
                  label: 'Approve',
                  onPress: () => handleResolveAlert(`${t.name} approval`),
                }}
                secondary={{
                  label: 'Open team',
                  onPress: () => navigation.navigate('TeamDetail', { id: t.id }),
                }}
              />
            ))}
            {bookingsPending.map((b) => (
              <QueueRow
                key={`booking-${b.id}`}
                avatar={b.facilityName.slice(0, 2).toUpperCase()}
                title={`${b.facilityName} · ${b.spaceName}`}
                subtitle={`${b.hostName} · requested ${formatRelative(
                  b.createdAtIso,
                )}`}
                tag={{ label: 'Booking request', tone: 'info' }}
                meta={`${formatCurrency(b.amountCents)} · ${b.partySize} attendees`}
                primary={{
                  label: 'Confirm',
                  onPress: () => handleResolveAlert(`${b.facilityName} booking`),
                }}
                secondary={{
                  label: 'Open booking',
                  onPress: () =>
                    navigation.navigate('BookingDetail', { id: b.id }),
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* ALERTS */}
      {filtered.alerts.length > 0 ? (
        <View style={styles.sectionBlock}>
          <SectionHeader
            icon={
              <AlertTriangle
                size={20}
                color={colors.brand.alpine}
                strokeWidth={2.25}
              />
            }
            title="Active alerts"
            description="Live signals from across the org."
            tone="alpine"
          />
          <View style={styles.list}>
            {filtered.alerts.map((alert) => (
              <Pressable
                key={alert.id}
                onPress={() =>
                  navigation.navigate(alert.cta.route as AdminRouteName)
                }
                accessibilityRole="button"
                accessibilityLabel={alert.title}
                style={({ hovered, pressed }: WebPressableState) => [
                  styles.alertCard,
                  alert.tone === 'live' ? styles.alertCardUrgent : null,
                  hovered ? styles.alertCardHover : null,
                  pressed ? styles.alertCardPressed : null,
                ]}
              >
                <View style={styles.alertIcon}>
                  <AlertTriangle
                    size={18}
                    color={
                      alert.tone === 'live'
                        ? colors.brand.alpine
                        : alert.tone === 'warning'
                        ? colors.status.warning
                        : colors.brand.primary
                    }
                    strokeWidth={2.25}
                  />
                </View>
                <View style={styles.alertBody}>
                  <Text variant="bodySm" color={colors.text.primary} weight="600">
                    {alert.title}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {alert.body}
                  </Text>
                </View>
                <View style={styles.alertCta}>
                  <Text variant="bodySm" color={colors.brand.primary} weight="600">
                    {alert.cta.label}
                  </Text>
                  <ChevronRight
                    size={14}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* MONEY */}
      {filtered.money.length > 0 ? (
        <View style={styles.sectionBlock}>
          <SectionHeader
            icon={
              <Coins
                size={20}
                color={colors.status.live}
                strokeWidth={2.25}
              />
            }
            title="Money issues"
            description="Failed charges and refund queue."
            tone="alpine"
          />
          <View style={styles.list}>
            {filtered.money.map((p) => (
              <QueueRow
                key={`pay-${p.id}`}
                avatar={p.payerName.slice(0, 2).toUpperCase()}
                title={p.payerName}
                subtitle={`${p.contextLabel} · ${formatRelative(p.createdAtIso)}`}
                tag={{ label: 'Charge failed', tone: 'live' }}
                meta={formatCurrency(p.amountCents)}
                urgent
                primary={{
                  label: 'Resend invoice',
                  onPress: () => handleResolveAlert(`${p.payerName} invoice`),
                }}
                secondary={{
                  label: 'Open payment',
                  onPress: () =>
                    navigation.navigate('PaymentDetail', { id: p.id }),
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {filtered.approvals.length === 0 &&
      filtered.alerts.length === 0 &&
      filtered.money.length === 0 ? (
        <EmptyState
          icon={
            <Sparkles
              size={28}
              color={colors.brand.primary}
              strokeWidth={2.25}
            />
          }
          title="Inbox zero"
          description="No approvals, alerts, or failed payments need your attention right now."
          primaryAction={{
            label: 'Open Schedule',
            onPress: () => navigation.navigate('Schedule'),
          }}
          secondaryAction={{
            label: 'Open Leagues',
            onPress: () => navigation.navigate('Leagues'),
          }}
        />
      ) : null}

      <Card style={styles.shortcutCard}>
        <View style={styles.shortcutHead}>
          <Wrench size={18} color={colors.brand.primary} strokeWidth={2.25} />
          <Text variant="h3" color={colors.text.primary}>
            Quick tools
          </Text>
        </View>
        <View style={styles.shortcutGrid}>
          <ShortcutTile
            icon={<CalendarClock size={20} color={colors.brand.primary} strokeWidth={2.25} />}
            label="Generate fixtures"
            description="Round-robin or playoff brackets"
            onPress={() => navigation.navigate('FixtureGenerator')}
          />
          <ShortcutTile
            icon={<Coins size={20} color={colors.brand.primary} strokeWidth={2.25} />}
            label="Record refund"
            description="Issue a partial or full refund"
            onPress={() => navigation.navigate('Payments')}
          />
          <ShortcutTile
            icon={
              <ShieldCheck
                size={20}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
            }
            label="Bulk approve teams"
            description={`${teamsPending.length} pending`}
            onPress={() => navigation.navigate('Teams')}
          />
          <ShortcutTile
            icon={
              <Sparkles
                size={20}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
            }
            label="Send announcement"
            description="Compose for org / league / team"
            onPress={() => navigation.navigate('NewsComposer')}
          />
        </View>
      </Card>

      <Card style={styles.summaryCard}>
        <View style={styles.summaryHead}>
          <Text variant="h3" color={colors.text.primary}>
            Active leagues
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Leagues')}
            accessibilityRole="button"
            accessibilityLabel="View all leagues"
            style={styles.viewAllRow}
          >
            <Text variant="bodySm" color={colors.brand.primary} weight="600">
              View all
            </Text>
            <ChevronRight size={14} color={colors.brand.primary} strokeWidth={2.5} />
          </Pressable>
        </View>
        <View style={styles.summaryList}>
          {LEAGUES.slice(0, 3).map((l) => (
            <View key={l.id} style={styles.summaryRow}>
              <Avatar initials={l.name.slice(0, 2).toUpperCase()} size={32} />
              <View style={styles.summaryBody}>
                <Text variant="bodySm" color={colors.text.primary} weight="600">
                  {l.name}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {l.sportLabel} · {l.city}
                </Text>
              </View>
              <Tag size="sm" tone="brand" label={l.status} />
            </View>
          ))}
        </View>
      </Card>
    </PageScroll>
  );
}

interface QueueRowProps {
  avatar: string;
  title: string;
  subtitle: string;
  tag: { label: string; tone: 'brand' | 'info' | 'live' | 'warning' };
  meta: string;
  urgent?: boolean;
  primary: { label: string; onPress: () => void };
  secondary?: { label: string; onPress: () => void };
}

function QueueRow({
  avatar,
  title,
  subtitle,
  tag,
  meta,
  urgent = false,
  primary,
  secondary,
}: QueueRowProps) {
  return (
    <View style={[styles.queueRow, urgent ? styles.queueRowUrgent : null]}>
      <Avatar initials={avatar} size={40} />
      <View style={styles.queueBody}>
        <View style={styles.queueHead}>
          <Text variant="bodySm" color={colors.text.primary} weight="600">
            {title}
          </Text>
          <Tag size="sm" tone={tag.tone} label={tag.label} leadingDot />
        </View>
        <Text variant="caption" color={colors.text.muted}>
          {subtitle}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {meta}
        </Text>
      </View>
      <View style={styles.queueActions}>
        {secondary ? (
          <Button
            label={secondary.label}
            variant="ghost"
            size="sm"
            onPress={secondary.onPress}
          />
        ) : null}
        <Button
          label={primary.label}
          variant="solid"
          size="sm"
          onPress={primary.onPress}
        />
      </View>
    </View>
  );
}

interface ShortcutTileProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
}

function ShortcutTile({ icon, label, description, onPress }: ShortcutTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ hovered, pressed }: WebPressableState) => [
        styles.shortcutTile,
        hovered ? styles.shortcutTileHover : null,
        pressed ? styles.shortcutTilePressed : null,
      ]}
    >
      <View style={styles.shortcutIcon}>{icon}</View>
      <View style={styles.shortcutBody}>
        <Text variant="bodySm" color={colors.text.primary} weight="600">
          {label}
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  sectionBlock: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderRadius: radii.cardLg,
    ...shadows.glow,
  },
  queueRowUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand.alpine,
  },
  queueBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  queueHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  queueActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderRadius: radii.cardLg,
    ...shadows.glow,
  },
  alertCardUrgent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand.alpine,
  },
  alertCardHover: {
    transform: [{ translateY: -2 }],
  },
  alertCardPressed: {
    opacity: 0.92,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.containerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBody: {
    flex: 1,
    gap: 2,
  },
  alertCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shortcutCard: {
    gap: spacing.lg,
  },
  shortcutHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  shortcutTile: {
    flexBasis: 220,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface.containerLow,
    borderRadius: radii.cardLg,
    minHeight: 76,
  },
  shortcutTileHover: {
    backgroundColor: colors.brand.soft,
  },
  shortcutTilePressed: {
    opacity: 0.85,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  summaryCard: {
    gap: spacing.lg,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  summaryList: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
