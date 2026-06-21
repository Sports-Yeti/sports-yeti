import React, { useMemo, useState } from 'react';
import { type WebPressableState } from '../../lib/pressable';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronRight,
  Flag,
  Gauge,
  Inbox,
  MailPlus,
  MapPin,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  StatCard,
  type AdminRouteName,
} from '../../admin';
import {
  Avatar,
  Button,
  Card,
  Modal,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  AUTOMATION_RULES,
  BID_URGENCY_LABEL,
  BID_URGENCY_TONE,
  PENDING_REGISTRATIONS,
  REFEREE_BIDS,
  refereeMarketplaceStats,
  type AutomationRule,
  type PendingRefereeRegistration,
  type RefereeBid,
} from '../../mocks/marketplace';
import { peopleByKind } from '../../mocks/people';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'roster', label: 'Full roster' },
];

export function RefereeMarketplaceScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [tab, setTab] = useState<'marketplace' | 'roster'>('marketplace');
  const [automationOpen, setAutomationOpen] = useState(false);
  const [rules, setRules] = useState<AutomationRule[]>(AUTOMATION_RULES);

  const stats = useMemo(() => refereeMarketplaceStats(), []);
  const referees = useMemo(() => peopleByKind('referee'), []);

  const handleApprove = (registration: PendingRefereeRegistration) => {
    toast.show({
      variant: 'success',
      title: `${registration.name} approved`,
      description: `Marked ${registration.level} for ${registration.certifiedFor.join(', ')}`,
    });
  };

  const handleReject = (registration: PendingRefereeRegistration) => {
    toast.show({
      variant: 'info',
      title: `${registration.name} flagged for review`,
    });
  };

  const handleReviewBids = (bid: RefereeBid) => {
    toast.show({
      variant: 'info',
      title: `Reviewing bids for ${bid.gameLabel}`,
      description: `${bid.bidderAvatars.length + bid.bidderOverflow} officials in queue`,
    });
  };

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="MARKETPLACE OVERVIEW"
        title="Referee Roster"
        subtitle="Manage your officials, review bids, and tune automation in one place."
        meta={`${stats.activeOfficials} active · ${stats.openBids} open bids · ${stats.pendingRegistrations} awaiting review`}
        trailing={
          <>
            <Button
              label="Automation Settings"
              variant="ghost"
              size="sm"
              leadingIcon={
                <Settings
                  size={14}
                  color={colors.brand.primary}
                  strokeWidth={2.25}
                />
              }
              onPress={() => setAutomationOpen(true)}
            />
            <Button
              label="Invite Official"
              variant="solid"
              size="sm"
              leadingIcon={
                <MailPlus
                  size={14}
                  color={colors.text.inverse}
                  strokeWidth={2.5}
                />
              }
              onPress={() => navigation.navigate('InvitePeople', { id: 'referee' })}
            />
          </>
        }
      />

      <Tabs
        items={TABS}
        value={tab}
        onChange={(v) => setTab(v as 'marketplace' | 'roster')}
        variant="segmented"
      />

      {tab === 'marketplace' ? (
        <>
          <View style={styles.statsRow}>
            <StatCard
              label="Active Officials"
              value={stats.activeOfficials.toLocaleString()}
              changePct={stats.activeOfficialsDelta}
              tone="brand"
              icon={
                <Users
                  size={14}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              }
            />
            <StatCard
              label="Pending Registrations"
              value={stats.pendingRegistrations.toLocaleString()}
              helper="Awaiting certification review"
              tone="alpine"
              icon={
                <Inbox size={14} color={colors.brand.alpine} strokeWidth={2.25} />
              }
            />
            <StatCard
              label="Open Bids"
              value={stats.openBids.toLocaleString()}
              helper="View marketplace →"
              tone="brand"
              icon={
                <Trophy
                  size={14}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              }
            />
            <StatCard
              label="Avg Assign Rate"
              value={`${stats.avgAssignRatePct}%`}
              helper="Automated efficiency"
              tone="success"
              icon={
                <Gauge size={14} color="#2E7D32" strokeWidth={2.25} />
              }
            />
          </View>

          <View style={styles.split}>
            <View style={styles.splitMain}>
              <Card>
                <View style={styles.cardHead}>
                  <View>
                    <Text variant="h2" color={colors.text.primary}>
                      Pending Registrations
                    </Text>
                    <Text variant="bodySm" color={colors.text.muted}>
                      Approve to make officials biddable on open assignments.
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      toast.show({
                        variant: 'info',
                        title: 'Full registrations queue',
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel="View all pending registrations"
                    hitSlop={6}
                    style={styles.viewAllBtn}
                  >
                    <Text variant="button" color={colors.brand.primary}>
                      View All
                    </Text>
                    <ChevronRight
                      size={14}
                      color={colors.brand.primary}
                      strokeWidth={2.5}
                    />
                  </Pressable>
                </View>

                <View style={styles.regList}>
                  {PENDING_REGISTRATIONS.map((reg) => (
                    <RegistrationRow
                      key={reg.id}
                      registration={reg}
                      onApprove={() => handleApprove(reg)}
                      onReject={() => handleReject(reg)}
                    />
                  ))}
                </View>
              </Card>
            </View>

            <View style={styles.splitAside}>
              <View style={styles.bidStack}>
                <View style={styles.bidStackHead}>
                  <Text variant="h2" color={colors.text.primary}>
                    Hot Bids
                  </Text>
                  <Tag size="sm" tone="alpine" leadingDot label="LIVE" />
                </View>
                {REFEREE_BIDS.map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    onReview={() => handleReviewBids(bid)}
                  />
                ))}
              </View>
            </View>
          </View>

          <Card>
            <View style={styles.automationCardHead}>
              <View style={styles.automationLeft}>
                <View style={styles.automationIcon}>
                  <Sparkles
                    size={18}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                </View>
                <View>
                  <Text variant="h3" color={colors.text.primary}>
                    Assignment automation
                  </Text>
                  <Text variant="bodySm" color={colors.text.muted}>
                    {rules.filter((r) => r.enabled).length} of {rules.length}{' '}
                    rules active
                  </Text>
                </View>
              </View>
              <Button
                label="Manage rules"
                variant="ghost"
                size="sm"
                onPress={() => setAutomationOpen(true)}
              />
            </View>
          </Card>
        </>
      ) : (
        <Card>
          <View style={styles.cardHead}>
            <View>
              <Text variant="h2" color={colors.text.primary}>
                Full referee roster
              </Text>
              <Text variant="bodySm" color={colors.text.muted}>
                {referees.length} active officials in your org
              </Text>
            </View>
            <Button
              label="Open table view"
              variant="ghost"
              size="sm"
              onPress={() =>
                toast.show({
                  variant: 'info',
                  title: 'Detailed roster view',
                  description: 'Swap to People → Referees tab in nav (mock).',
                })
              }
            />
          </View>
          <View style={styles.rosterList}>
            {referees.slice(0, 10).map((ref) => (
              <View key={ref.id} style={styles.rosterRow}>
                <Avatar uri={ref.avatar} initials={ref.name.charAt(0)} size={32} />
                <View style={styles.rosterBody}>
                  <Text variant="bodySm" color={colors.text.primary} weight="600">
                    {ref.name}
                  </Text>
                  <Text variant="caption" color={colors.text.muted}>
                    {ref.handle} · {ref.city}
                  </Text>
                </View>
                <View style={styles.rosterTrailing}>
                  {ref.refereeRating ? (
                    <Tag
                      size="sm"
                      tone="brand"
                      label={`★ ${ref.refereeRating.toFixed(1)}`}
                    />
                  ) : null}
                  {ref.hourlyRateCents ? (
                    <Text variant="caption" color={colors.text.secondary}>
                      {formatCurrency(ref.hourlyRateCents)}/hr
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
          {referees.length > 10 ? (
            <Text variant="caption" color={colors.text.muted} style={styles.rosterMore}>
              +{referees.length - 10} more — switch to the Marketplace tab for
              actionable surfaces.
            </Text>
          ) : null}
        </Card>
      )}

      <AutomationSettingsModal
        visible={automationOpen}
        rules={rules}
        onRequestClose={() => setAutomationOpen(false)}
        onToggle={(id, enabled) => {
          setRules((prev) =>
            prev.map((r) => (r.id === id ? { ...r, enabled } : r)),
          );
          toast.show({
            variant: 'success',
            title: `Rule ${enabled ? 'enabled' : 'disabled'}`,
          });
        }}
      />
    </PageScroll>
  );
}

interface RegistrationRowProps {
  registration: PendingRefereeRegistration;
  onApprove: () => void;
  onReject: () => void;
}

function RegistrationRow({
  registration,
  onApprove,
  onReject,
}: RegistrationRowProps) {
  return (
    <View
      style={[
        styles.regRow,
        registration.highlight ? styles.regRowHighlight : null,
      ]}
    >
      <Avatar
        uri={registration.avatar}
        initials={registration.name.charAt(0)}
        size={40}
      />
      <View style={styles.regBody}>
        <Text variant="bodySm" color={colors.text.primary} weight="600">
          {registration.name}
        </Text>
        <View style={styles.regMeta}>
          <Tag size="sm" tone="brand" label={registration.level} />
          <Text variant="caption" color={colors.text.muted}>
            {registration.submittedLabel} · {registration.certifiedFor.join(', ')}
          </Text>
        </View>
      </View>
      <View style={styles.regActions}>
        <Button label="Reject" variant="ghost" size="sm" onPress={onReject} />
        <Button
          label="Approve"
          variant="solid"
          size="sm"
          onPress={onApprove}
        />
      </View>
    </View>
  );
}

interface BidCardProps {
  bid: RefereeBid;
  onReview: () => void;
}

function BidCard({ bid, onReview }: BidCardProps) {
  const tone = BID_URGENCY_TONE[bid.urgency];
  return (
    <Pressable
      onPress={onReview}
      accessibilityRole="button"
      accessibilityLabel={`Review bids for ${bid.gameLabel}`}
      style={({ hovered, pressed }: WebPressableState) => [
        styles.bidCard,
        bid.urgency === 'urgent' ? styles.bidCardUrgent : null,
        hovered ? styles.bidCardHover : null,
        pressed ? styles.bidCardPressed : null,
      ]}
    >
      <View style={styles.bidHeader}>
        <View style={styles.bidHeaderLeft}>
          <Tag
            size="sm"
            tone={tone}
            leadingDot
            label={`${BID_URGENCY_LABEL[bid.urgency]} · ${bid.whenLabel}`}
          />
        </View>
        <Text variant="h3" color={colors.text.primary}>
          {formatCurrency(bid.payCents)}
        </Text>
      </View>
      <Text variant="button" color={colors.text.primary}>
        {bid.gameLabel}
      </Text>
      <View style={styles.bidMetaRow}>
        <MapPin size={12} color={colors.text.muted} strokeWidth={2.25} />
        <Text variant="caption" color={colors.text.muted}>
          {bid.facilityLabel}
        </Text>
      </View>
      <View style={styles.bidMetaRow}>
        <Shield size={12} color={colors.text.muted} strokeWidth={2.25} />
        <Text variant="caption" color={colors.text.muted}>
          {bid.requiredLevel} · {bid.officialsRequested}{' '}
          {bid.officialsRequested === 1 ? 'official' : 'officials'} requested
        </Text>
      </View>
      <View style={styles.bidFooter}>
        <View style={styles.bidStack2}>
          {bid.bidderAvatars.slice(0, 3).map((uri, idx) => (
            <View
              key={`${bid.id}-bidder-${idx}`}
              style={[
                styles.bidAvatarShell,
                idx > 0 ? { marginLeft: -6 } : null,
              ]}
            >
              <Avatar uri={uri} size={20} />
            </View>
          ))}
          {bid.bidderOverflow > 0 ? (
            <View
              style={[styles.bidOverflow, { marginLeft: -6 }]}
              accessibilityRole="text"
            >
              <Text variant="caption" color={colors.text.muted}>
                +{bid.bidderOverflow}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.bidReviewBtn}>
          <Text variant="button" color={colors.brand.primary}>
            Review Bids
          </Text>
          <ChevronRight
            size={14}
            color={colors.brand.primary}
            strokeWidth={2.5}
          />
        </View>
      </View>
    </Pressable>
  );
}

interface AutomationSettingsModalProps {
  visible: boolean;
  rules: AutomationRule[];
  onToggle: (id: string, enabled: boolean) => void;
  onRequestClose: () => void;
}

function AutomationSettingsModal({
  visible,
  rules,
  onToggle,
  onRequestClose,
}: AutomationSettingsModalProps) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      title="Automation settings"
      description="Tune how the marketplace assigns referees to open games."
      primaryAction={{ label: 'Done', onPress: onRequestClose }}
    >
      <View style={styles.ruleList}>
        {rules.map((rule) => (
          <View key={rule.id} style={styles.ruleRow}>
            <View style={styles.ruleBody}>
              <Text variant="bodySm" color={colors.text.primary} weight="600">
                {rule.label}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                {rule.description}
              </Text>
            </View>
            <RuleToggle
              enabled={rule.enabled}
              onToggle={(next) => onToggle(rule.id, next)}
              accessibilityLabel={rule.label}
            />
          </View>
        ))}
      </View>
    </Modal>
  );
}

interface RuleToggleProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  accessibilityLabel: string;
}

function RuleToggle({ enabled, onToggle, accessibilityLabel }: RuleToggleProps) {
  return (
    <Pressable
      onPress={() => onToggle(!enabled)}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.toggleTrack,
        enabled ? styles.toggleTrackOn : styles.toggleTrackOff,
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          enabled ? styles.toggleThumbOn : styles.toggleThumbOff,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  split: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  splitMain: {
    flex: 2,
    minWidth: 360,
  },
  splitAside: {
    flex: 1,
    minWidth: 320,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  regList: {
    gap: spacing.sm,
  },
  regRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.containerLow,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
  },
  regRowHighlight: {
    backgroundColor: colors.brand.soft,
  },
  regBody: {
    flex: 1,
    gap: 2,
  },
  regMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  regActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bidStack: {
    gap: spacing.md,
  },
  bidStackHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xs'],
  },
  bidCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.glow,
  },
  bidCardUrgent: {
    borderWidth: 1.5,
    borderColor: colors.brand.alpineGlow,
  },
  bidCardHover: {
    transform: [{ translateY: -2 }],
  },
  bidCardPressed: {
    opacity: 0.94,
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bidHeaderLeft: {
    flex: 1,
    minWidth: 0,
  },
  bidMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bidFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  bidStack2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidAvatarShell: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surface.card,
  },
  bidOverflow: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.surface.containerHigh,
    borderWidth: 2,
    borderColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  automationCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  automationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  automationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterList: {
    gap: spacing.sm,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rosterBody: {
    flex: 1,
    gap: 2,
  },
  rosterTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rosterMore: {
    paddingTop: spacing.sm,
  },
  ruleList: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ruleBody: {
    flex: 1,
    gap: 2,
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 999,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: colors.brand.primary,
  },
  toggleTrackOff: {
    backgroundColor: colors.surface.containerHigh,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surface.card,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
});
