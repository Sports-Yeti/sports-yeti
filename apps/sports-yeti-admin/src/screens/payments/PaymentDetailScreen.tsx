import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import { RefundModal } from '../../components/RefundModal';
import type { Payment } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RouteProps = RouteProp<MainStackParamList, 'PaymentDetail'>;

function getStatusColor(status: Payment['status']): { bg: string; text: string } {
  switch (status) {
    case 'completed':
      return { bg: COLORS.success + '20', text: COLORS.success };
    case 'pending':
    case 'processing':
      return { bg: COLORS.warning + '20', text: COLORS.warning };
    case 'failed':
      return { bg: COLORS.error + '20', text: COLORS.error };
    case 'refunded':
    case 'partially_refunded':
      return { bg: COLORS.secondary + '20', text: COLORS.secondary };
    default:
      return { bg: COLORS.textMuted + '20', text: COLORS.textMuted };
  }
}

function formatPaymentType(type: Payment['type']): string {
  switch (type) {
    case 'league_registration':
      return 'League Registration';
    case 'camp_registration':
      return 'Camp Registration';
    case 'facility_booking':
      return 'Facility Booking';
    default:
      return type;
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
  monospace?: boolean;
}

function DetailRow({ label, value, monospace }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[styles.detailValue, monospace && styles.monospace]}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

export function PaymentDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const queryClient = useQueryClient();
  const { id } = route.params;

  const [showRefundModal, setShowRefundModal] = useState(false);

  const { data: payment, isLoading, error, refetch } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => api.getPayment(id),
  });

  const refundMutation = useMutation({
    mutationFn: (params: { amount?: number; reason?: string }) =>
      api.refundPayment(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowRefundModal(false);
    },
  });

  const handleRefund = async (amount: number | undefined, reason: string) => {
    await refundMutation.mutateAsync({ amount, reason });
  };

  const canRefund =
    payment?.status === 'completed' || payment?.status === 'partially_refunded';

  const refundableAmount =
    payment?.amount && payment?.refund_amount
      ? payment.amount - payment.refund_amount
      : payment?.amount ?? 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !payment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load payment details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors = getStatusColor(payment.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Payment Details</Text>
            <Text style={styles.paymentId}>{payment.id}</Text>
          </View>
          {canRefund && (
            <TouchableOpacity
              style={styles.refundButton}
              onPress={() => setShowRefundModal(true)}
            >
              <Text style={styles.refundButtonText}>Issue Refund</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {payment.status.replace('_', ' ')}
              </Text>
            </View>
            <Text style={styles.amountLarge}>{formatCurrency(payment.amount)}</Text>
          </View>

          <View style={styles.amountBreakdown}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Gross Amount</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(payment.amount)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Platform Fee</Text>
              <Text style={styles.amountValue}>
                -{formatCurrency(payment.fee_amount)}
              </Text>
            </View>
            <View style={[styles.amountRow, styles.amountRowTotal]}>
              <Text style={styles.amountLabelTotal}>Net Amount</Text>
              <Text style={styles.amountValueTotal}>
                {formatCurrency(payment.net_amount)}
              </Text>
            </View>
            {payment.refund_amount && payment.refund_amount > 0 && (
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: COLORS.error }]}>
                  Refunded
                </Text>
                <Text style={[styles.amountValue, { color: COLORS.error }]}>
                  -{formatCurrency(payment.refund_amount)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.card}>
            <DetailRow label="Payment Type" value={formatPaymentType(payment.type)} />
            <DetailRow label="Created At" value={formatDate(payment.created_at)} />
            <DetailRow label="Paid At" value={formatDate(payment.paid_at)} />
            {payment.refunded_at && (
              <DetailRow label="Refunded At" value={formatDate(payment.refunded_at)} />
            )}
          </View>
        </View>

        {/* User Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.card}>
            <DetailRow label="Name" value={payment.user?.name || 'Unknown'} />
            <DetailRow label="Email" value={payment.user?.email || 'N/A'} />
            <DetailRow label="User ID" value={String(payment.user_id)} monospace />
          </View>
        </View>

        {/* Stripe Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stripe Information</Text>
          <View style={styles.card}>
            <DetailRow
              label="Payment Intent ID"
              value={payment.stripe_payment_intent_id || 'N/A'}
              monospace
            />
            <DetailRow
              label="Charge ID"
              value={payment.stripe_charge_id || 'N/A'}
              monospace
            />
            <DetailRow
              label="Idempotency Key"
              value={payment.idempotency_key || 'N/A'}
              monospace
            />
          </View>
        </View>

        {/* Related Entities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Entities</Text>
          <View style={styles.card}>
            <DetailRow
              label="League"
              value={payment.league?.name || payment.league_id || 'N/A'}
            />
            <DetailRow
              label="Payable Type"
              value={payment.payable_type?.split('\\').pop() || 'N/A'}
            />
            <DetailRow
              label="Payable ID"
              value={payment.payable_id || 'N/A'}
              monospace
            />
          </View>
        </View>

        {/* Metadata */}
        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metadata</Text>
            <View style={styles.card}>
              <Text style={styles.metadataText}>
                {JSON.stringify(payment.metadata, null, 2)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Refund Modal */}
      <RefundModal
        visible={showRefundModal}
        payment={payment}
        maxRefundAmount={refundableAmount}
        isProcessing={refundMutation.isPending}
        error={refundMutation.error?.message}
        onClose={() => setShowRefundModal(false)}
        onSubmit={handleRefund}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  paymentId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  refundButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  refundButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  amountLarge: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  amountBreakdown: {
    gap: SPACING.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountRowTotal: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  amountLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  amountLabelTotal: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  amountValueTotal: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
  },
  metadataText: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  bottomSpacer: {
    height: SPACING.xxl,
  },
});
