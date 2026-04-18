import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Download, ExternalLink, RefreshCw } from 'lucide-react-native';
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
  EmptyState,
  Input,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, spacing } from '../../theme';
import {
  paymentById,
  STATUS_LABEL,
  TYPE_LABEL,
  type PaymentStatus,
} from '../../mocks/payments';
import { formatCurrency, formatDateTime, formatRelative } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<PaymentStatus, 'success' | 'warning' | 'live' | 'neutral' | 'info'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'live',
  refunded: 'neutral',
  partially_refunded: 'warning',
};

export function PaymentDetailScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const toast = useToast();
  const payment = paymentById(route.params.id);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  if (!payment) {
    return (
      <PageScroll>
        <PageHeader
          title="Payment not found"
          crumbs={[{ label: 'Payments', route: 'Payments' }, { label: '—' }]}
          onNavigate={(r) => navigation.navigate(r)}
        />
        <EmptyState
          title="Payment not found"
          primaryAction={{
            label: 'Back to payments',
            onPress: () => navigation.navigate('Payments'),
          }}
        />
      </PageScroll>
    );
  }

  const refundCents = Number(refundAmount) || 0;
  const remainingRefundable = payment.amountCents - payment.refundedCents;
  const refundFeeForfeited = Math.round((refundCents / Math.max(payment.amountCents, 1)) * payment.feeCents);
  const refundNet = refundCents - refundFeeForfeited;

  const canRefund =
    refundCents > 0 &&
    refundCents <= remainingRefundable &&
    payment.status !== 'failed' &&
    payment.status !== 'pending';

  return (
    <PageScroll>
      <PageHeader
        title={`Payment ${payment.id}`}
        subtitle={payment.contextLabel}
        crumbs={[
          { label: 'Payments', route: 'Payments' },
          { label: payment.id },
        ]}
        onNavigate={(r) => navigation.navigate(r)}
        meta={`Created ${formatRelative(payment.createdAtIso)}${payment.paidAtIso ? ` · paid ${formatRelative(payment.paidAtIso)}` : ''}`}
        trailing={
          <>
            <Tag tone={STATUS_TONE[payment.status]} leadingDot label={STATUS_LABEL[payment.status]} />
            {payment.receiptUrl ? (
              <Button
                label="Download receipt"
                variant="ghost"
                size="sm"
                leadingIcon={<Download size={14} color={colors.brand.primary} strokeWidth={2.25} />}
                onPress={() =>
                  toast.show({ variant: 'success', title: 'Receipt downloaded (mock)' })
                }
              />
            ) : null}
            {payment.status === 'failed' ? (
              <Button
                label="Retry charge"
                variant="solid"
                size="sm"
                leadingIcon={<RefreshCw size={14} color={colors.text.inverse} strokeWidth={2.25} />}
                onPress={() =>
                  toast.show({ variant: 'info', title: 'Re-attempting charge…' })
                }
              />
            ) : null}
            {(payment.status === 'completed' || payment.status === 'partially_refunded') ? (
              <Button
                label="Refund"
                variant="destructive"
                size="sm"
                onPress={() => {
                  setRefundAmount(String(remainingRefundable));
                  setRefundOpen(true);
                }}
              />
            ) : null}
          </>
        }
      />

      <View style={styles.statsRow}>
        <StatCard
          label="Gross"
          value={formatCurrency(payment.amountCents)}
          tone="brand"
        />
        <StatCard
          label="Processor fee"
          value={formatCurrency(payment.feeCents)}
          helper="2.9% + 30¢"
          tone="warning"
        />
        <StatCard
          label="Refunded"
          value={formatCurrency(payment.refundedCents)}
          tone={payment.refundedCents > 0 ? 'live' : 'brand'}
        />
        <StatCard
          label="Net to org"
          value={formatCurrency(payment.netCents)}
          tone="success"
        />
      </View>

      <View style={styles.twoCol}>
        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Payer
          </Text>
          <View style={styles.payerRow}>
            <Avatar uri={payment.payerAvatar} initials={payment.payerName.charAt(0)} size={48} />
            <View style={styles.payerBody}>
              <Text variant="bodySm" color={colors.text.primary} weight="600">
                {payment.payerName}
              </Text>
              <Text variant="caption" color={colors.text.muted}>
                {payment.payerHandle}
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text variant="caption" color={colors.text.muted}>
              METHOD
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {payment.paymentMethod === 'apple_pay'
                ? 'Apple Pay'
                : payment.paymentMethod === 'google_pay'
                ? 'Google Pay'
                : payment.cardBrand
                ? `${payment.cardBrand} •••• ${payment.cardLast4}`
                : 'Card'}
            </Text>
          </View>
        </Card>

        <Card style={styles.col}>
          <Text variant="h3" color={colors.text.primary}>
            Context
          </Text>
          <View style={styles.metaRow}>
            <Text variant="caption" color={colors.text.muted}>
              TYPE
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {TYPE_LABEL[payment.type]}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text variant="caption" color={colors.text.muted}>
              FOR
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {payment.contextLabel}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text variant="caption" color={colors.text.muted}>
              CREATED
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {formatDateTime(payment.createdAtIso)}
            </Text>
          </View>
          {payment.paidAtIso ? (
            <View style={styles.metaRow}>
              <Text variant="caption" color={colors.text.muted}>
                PAID
              </Text>
              <Text variant="bodySm" color={colors.text.primary}>
                {formatDateTime(payment.paidAtIso)}
              </Text>
            </View>
          ) : null}
          {payment.receiptUrl ? (
            <Button
              label="Open in Stripe"
              variant="ghost"
              size="sm"
              trailingIcon={<ExternalLink size={12} color={colors.brand.primary} strokeWidth={2.25} />}
              onPress={() => toast.show({ variant: 'info', title: 'Stripe deep-link (mock)' })}
            />
          ) : null}
        </Card>
      </View>

      <Modal
        visible={refundOpen}
        onRequestClose={() => setRefundOpen(false)}
        variant="destructive"
        title="Issue a refund"
        description={`Refund up to ${formatCurrency(remainingRefundable)} from this payment. Processor fees on the refunded amount are forfeited.`}
        primaryAction={{
          label: refundCents > 0 ? `Refund ${formatCurrency(refundCents)}` : 'Refund',
          disabled: !canRefund,
          onPress: () => {
            setRefundOpen(false);
            setRefundAmount('');
            setRefundReason('');
            toast.show({
              variant: 'success',
              title: `Refunded ${formatCurrency(refundCents)}`,
              description: 'The payer will see the credit in 3–5 days.',
            });
          },
        }}
        secondaryAction={{ label: 'Cancel', onPress: () => setRefundOpen(false) }}
      >
        <View style={styles.modalBody}>
          <Input
            label="Refund amount (cents)"
            variant="number"
            value={refundAmount}
            onChangeText={setRefundAmount}
            helpText={`Up to ${formatCurrency(remainingRefundable)}`}
          />
          <Input
            label="Reason"
            value={refundReason}
            onChangeText={setRefundReason}
            placeholder="Weather cancel, double-charge, customer request…"
          />
          <View style={styles.refundSummary}>
            <Text variant="caption" color={colors.text.muted}>
              Refund amount
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {formatCurrency(refundCents)}
            </Text>
          </View>
          <View style={styles.refundSummary}>
            <Text variant="caption" color={colors.text.muted}>
              Processor fee forfeited
            </Text>
            <Text variant="bodySm" color={colors.status.warning}>
              {formatCurrency(refundFeeForfeited)}
            </Text>
          </View>
          <View style={styles.refundSummary}>
            <Text variant="caption" color={colors.text.primary}>
              Net debit to your org
            </Text>
            <Text variant="h4" color={colors.status.live}>
              {formatCurrency(refundNet + refundFeeForfeited)}
            </Text>
          </View>
        </View>
      </Modal>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  col: {
    flex: 1,
    minWidth: 320,
    gap: spacing.sm,
  },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  payerBody: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing['2xs'],
  },
  modalBody: {
    width: '100%',
    gap: spacing.sm,
  },
  refundSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
});
