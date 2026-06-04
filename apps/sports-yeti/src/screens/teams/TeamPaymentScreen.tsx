import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Bell, ChevronLeft, CreditCard, ShieldCheck } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Modal,
  ProgressBar,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { TEAM_DETAILS, type RosterMember } from '../../mocks/teams';
import { formatCurrency } from '../../lib/format';
import { useCheckout } from '../../lib/checkout';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeamPayment'>;
type Route = RouteProp<RootStackParamList, 'TeamPayment'>;

const PAYMENT_TONE = {
  paid: 'success' as const,
  pending: 'warning' as const,
  overdue: 'live' as const,
};

const PAYMENT_LABEL = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
};

function MemberRow({
  member,
  onNudge,
  isCaptainView,
}: {
  member: RosterMember;
  onNudge: () => void;
  isCaptainView: boolean;
}) {
  return (
    <View style={styles.memberRow}>
      <Avatar uri={member.avatar} initials={member.name.charAt(0)} size={40} />
      <View style={styles.memberBody}>
        <Text variant="button" color={colors.text.primary}>
          {member.name}
          {member.isYou ? ' · You' : ''}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {member.position}
        </Text>
      </View>
      <Tag
        tone={PAYMENT_TONE[member.paymentStatus]}
        size="sm"
        label={PAYMENT_LABEL[member.paymentStatus]}
      />
      {isCaptainView && member.paymentStatus !== 'paid' && !member.isYou ? (
        <Pressable
          onPress={onNudge}
          accessibilityRole="button"
          accessibilityLabel={`Remind ${member.name}`}
          hitSlop={6}
          style={styles.nudgeBtn}
        >
          <Bell size={16} color={colors.brand.primary} strokeWidth={2.25} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function TeamPaymentScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const team = TEAM_DETAILS[route.params.teamId];
  const checkout = useCheckout();
  const [confirmPay, setConfirmPay] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!team) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Payment unavailable"
          description="We couldn't load the team's payment summary."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const youMember = team.roster.find((m) => m.isYou);
  const isUnpaid =
    !!youMember && (youMember.paymentStatus !== 'paid' || paid === false);
  const youArePaid = paid || youMember?.paymentStatus === 'paid';

  const paidCount = team.roster.filter(
    (m) => m.paymentStatus === 'paid' || (m.isYou && paid),
  ).length;
  const unpaidCount = team.roster.length - paidCount;
  const collectedCents = paidCount * team.perPlayerCents;
  const progress = team.feeTotalCents === 0 ? 1 : collectedCents / team.feeTotalCents;

  const handlePay = async () => {
    setConfirmPay(false);
    const result = await checkout.pay({
      amountCents: team.perPlayerCents,
      currency: team.currency,
      merchantLabel: `${team.name} season fee`,
      // TODO: pass createPaymentIntent once the SportsYeti backend exposes it.
    });
    if (result.status === 'success') {
      setPaid(true);
      toast.show({
        variant: 'success',
        title: `Paid ${formatCurrency(team.perPlayerCents)}`,
        description: 'Receipt sent to your email.',
      });
      return;
    }
    if (result.status === 'cancelled') {
      toast.show({ variant: 'info', title: 'Payment cancelled' });
      return;
    }
    toast.show({
      variant: 'error',
      title: 'Payment failed',
      description: result.error,
      action: { label: 'Retry', onPress: handlePay },
    });
  };

  const handleNudge = (m: RosterMember) => {
    Haptics.selectionAsync();
    toast.show({
      variant: 'success',
      title: `Reminded ${m.name}`,
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
            style={styles.iconButton}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <View style={styles.spacer} />
          <View style={styles.iconButton}>
            <ShieldCheck size={20} color={colors.brand.primary} strokeWidth={2.25} />
          </View>
        </View>

        <View style={styles.heroBlock}>
          <IconBadge size={64} tone="brand">
            <CreditCard
              size={28}
              color={colors.brand.deep}
              strokeWidth={2.25}
            />
          </IconBadge>
          <Text variant="h1" color={colors.text.primary} align="center">
            {team.name}
          </Text>
          <Text variant="body" color={colors.text.secondary} align="center">
            {team.league?.name ?? 'Season fee split'}
          </Text>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text variant="body" color={colors.text.secondary}>
              Total team fee
            </Text>
            <Text variant="button" color={colors.text.primary}>
              {formatCurrency(team.feeTotalCents)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text variant="body" color={colors.text.secondary}>
              Roster size
            </Text>
            <Text variant="button" color={colors.text.primary}>
              {team.rosterMax} expected · {team.roster.length} joined
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text variant="body" color={colors.text.primary}>
              Your share
            </Text>
            <Text variant="h3" color={colors.brand.primary}>
              {formatCurrency(team.perPlayerCents)}
            </Text>
          </View>
        </Card>

        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text variant="h3" color={colors.text.primary}>
              {formatCurrency(collectedCents)} / {formatCurrency(team.feeTotalCents)}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {paidCount} paid · {unpaidCount} pending
            </Text>
          </View>
          <ProgressBar value={progress} tone="success" size="md" showLabel />
        </Card>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Team members
          </Text>
          <View style={styles.membersList}>
            {team.roster.map((m) => (
              <MemberRow
                key={m.id}
                member={
                  m.isYou && paid ? { ...m, paymentStatus: 'paid' as const } : m
                }
                isCaptainView={team.isCaptain}
                onNudge={() => handleNudge(m)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {isUnpaid ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            label={
              checkout.isPaying
                ? 'Processing…'
                : youArePaid
                ? 'Already paid'
                : `Pay your share · ${formatCurrency(team.perPlayerCents)}`
            }
            variant="gradient"
            size="lg"
            fullWidth
            disabled={checkout.isPaying || youArePaid}
            onPress={() => setConfirmPay(true)}
          />
        </View>
      ) : null}

      <Modal
        visible={confirmPay}
        onRequestClose={() => setConfirmPay(false)}
        variant="info"
        title="Confirm payment"
        description={`${formatCurrency(team.perPlayerCents)} via Apple Pay or your saved card. Refundable if you leave the team within 7 days.`}
        primaryAction={{
          label: checkout.isPaying
            ? 'Processing…'
            : `Pay ${formatCurrency(team.perPlayerCents)}`,
          onPress: handlePay,
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmPay(false),
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
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  progressCard: {
    gap: spacing.md,
  },
  progressHeader: {
    gap: 2,
  },
  section: {
    gap: spacing.md,
  },
  membersList: {
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  memberBody: {
    flex: 1,
    gap: 2,
  },
  nudgeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
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
});
