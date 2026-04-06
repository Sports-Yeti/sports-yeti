import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Payment, PaginationMeta } from '../../types';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const PAYMENT_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'partially_refunded', label: 'Partially Refunded' },
];

const PAYMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'league_registration', label: 'League Registration' },
  { value: 'camp_registration', label: 'Camp Registration' },
  { value: 'facility_booking', label: 'Facility Booking' },
];

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
      return 'League';
    case 'camp_registration':
      return 'Camp';
    case 'facility_booking':
      return 'Booking';
    default:
      return type;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

interface PaymentRowProps {
  payment: Payment;
  onPress: () => void;
}

function PaymentRow({ payment, onPress }: PaymentRowProps) {
  const statusColors = getStatusColor(payment.status);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.cellId}>
        <Text style={styles.idText} numberOfLines={1}>
          {payment.id.slice(0, 8)}...
        </Text>
      </View>
      <View style={styles.cellUser}>
        <Text style={styles.userName}>{payment.user?.name || 'Unknown'}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {payment.user?.email || ''}
        </Text>
      </View>
      <View style={styles.cellType}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{formatPaymentType(payment.type)}</Text>
        </View>
      </View>
      <View style={styles.cellAmount}>
        <Text style={styles.amountText}>{formatCurrency(payment.amount)}</Text>
        {payment.fee_amount > 0 && (
          <Text style={styles.feeText}>Fee: {formatCurrency(payment.fee_amount)}</Text>
        )}
      </View>
      <View style={styles.cellStatus}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {payment.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <View style={styles.cellDate}>
        <Text style={styles.dateText}>{formatDate(payment.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function PaymentListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payments', { status: statusFilter, type: typeFilter, dateFrom, dateTo, page }],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page,
        per_page: 20,
      };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      return api.getPayments(params);
    },
  });

  const payments = data?.data ?? [];
  const meta: PaginationMeta | undefined = data?.meta;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePaymentPress = (payment: Payment) => {
    navigation.navigate('PaymentDetail', { id: payment.id });
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch all payments with current filters for export
      const exportParams: Record<string, unknown> = {
        per_page: 1000, // Get more for export
      };
      if (statusFilter) exportParams.status = statusFilter;
      if (typeFilter) exportParams.type = typeFilter;
      if (dateFrom) exportParams.date_from = dateFrom;
      if (dateTo) exportParams.date_to = dateTo;

      const exportData = await api.getPayments(exportParams);
      const exportPayments = exportData.data;

      // Generate CSV content
      const headers = [
        'ID',
        'User Name',
        'User Email',
        'Type',
        'Amount',
        'Fee',
        'Net',
        'Status',
        'Created At',
        'Paid At',
      ];
      const rows = exportPayments.map((p) => [
        p.id,
        p.user?.name || '',
        p.user?.email || '',
        p.type,
        Number(p.amount).toFixed(2),
        Number(p.fee_amount).toFixed(2),
        Number(p.net_amount).toFixed(2),
        p.status,
        p.created_at,
        p.paid_at || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      // Create and download the file
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `payments-export-${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export payments');
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasFilters = statusFilter || typeFilter || dateFrom || dateTo;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>
            View and manage all payment transactions
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
          onPress={handleExportCSV}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.exportButtonText}>📥 Export CSV</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.selectWrapper}>
              <select
                style={styles.selectInput as never}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter((e.target as HTMLSelectElement).value);
                  setPage(1);
                }}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Type</Text>
            <View style={styles.selectWrapper}>
              <select
                style={styles.selectInput as never}
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter((e.target as HTMLSelectElement).value);
                  setPage(1);
                }}
              >
                {PAYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>From Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              value={dateFrom}
              onChangeText={(text) => {
                setDateFrom(text);
                setPage(1);
              }}
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>To Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              value={dateTo}
              onChangeText={(text) => {
                setDateTo(text);
                setPage(1);
              }}
            />
          </View>

          {hasFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Summary */}
      {meta && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            Showing {payments.length} of {meta.total} payments
          </Text>
        </View>
      )}

      {/* Content */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load payments</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.tableContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.cellId}>
              <Text style={styles.headerText}>ID</Text>
            </View>
            <View style={styles.cellUser}>
              <Text style={styles.headerText}>User</Text>
            </View>
            <View style={styles.cellType}>
              <Text style={styles.headerText}>Type</Text>
            </View>
            <View style={styles.cellAmount}>
              <Text style={styles.headerText}>Amount</Text>
            </View>
            <View style={styles.cellStatus}>
              <Text style={styles.headerText}>Status</Text>
            </View>
            <View style={styles.cellDate}>
              <Text style={styles.headerText}>Date</Text>
            </View>
          </View>

          {/* Table Body */}
          {payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyTitle}>No payments found</Text>
              <Text style={styles.emptyText}>
                {hasFilters
                  ? 'Try adjusting your filters'
                  : 'Payments will appear here once transactions are made'}
              </Text>
            </View>
          ) : (
            payments.map((payment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                onPress={() => handlePaymentPress(payment)}
              />
            ))
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Page {meta.current_page} of {meta.last_page}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === meta.last_page && styles.pageButtonDisabled,
                ]}
                onPress={() => setPage(Math.min(meta.last_page, page + 1))}
                disabled={page === meta.last_page}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  exportButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    minWidth: 130,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.7,
  },
  exportButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  filterGroup: {
    minWidth: 150,
  },
  filterLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  selectWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectInput: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    minWidth: 150,
    cursor: 'pointer',
  },
  dateInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minWidth: 140,
  },
  clearButton: {
    backgroundColor: COLORS.error + '15',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  statsBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  tableContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cellId: {
    width: 100,
    justifyContent: 'center',
  },
  idText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  cellUser: {
    flex: 1,
    minWidth: 150,
    justifyContent: 'center',
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cellType: {
    width: 100,
    justifyContent: 'center',
  },
  typeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  cellAmount: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  feeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cellStatus: {
    width: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cellDate: {
    width: 160,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
  },
  pageButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
