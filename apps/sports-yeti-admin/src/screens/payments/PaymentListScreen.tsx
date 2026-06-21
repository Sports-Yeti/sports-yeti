import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CreditCard, Download } from 'lucide-react-native';
import {
  BulkActionBar,
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Avatar, Button, Input, Select, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import {
  PAYMENTS,
  STATUS_LABEL,
  TYPE_LABEL,
  type Payment,
  type PaymentStatus,
} from '../../mocks/payments';
import { formatCurrency, formatRelative } from '../../lib/format';

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

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'failed', label: 'Failed' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Paid' },
  { key: 'refunded', label: 'Refunded' },
];

export function PaymentListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PAYMENTS.filter((p) => {
      if (tab !== 'all') {
        if (tab === 'refunded' && !(p.status === 'refunded' || p.status === 'partially_refunded')) return false;
        if (tab !== 'refunded' && p.status !== tab) return false;
      }
      if (type !== 'all' && p.type !== type) return false;
      if (q && !`${p.payerName} ${p.payerHandle} ${p.contextLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, type, search]);

  const columns: DataTableColumn<Payment>[] = [
    {
      id: 'payer',
      header: 'Payer',
      width: 240,
      sortable: true,
      accessor: (p) => (
        <View style={styles.cellRow}>
          <Avatar uri={p.payerAvatar} initials={p.payerName.charAt(0)} size={28} />
          <View style={styles.cellBody}>
            <Text variant="bodySm" color={colors.text.primary} weight="600">
              {p.payerName}
            </Text>
            <Text variant="caption" color={colors.text.muted}>
              {p.payerHandle}
            </Text>
          </View>
        </View>
      ),
    },
    {
      id: 'context',
      header: 'For',
      width: 320,
      accessor: (p) => (
        <View>
          <Text variant="bodySm" color={colors.text.primary}>
            {p.contextLabel}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {TYPE_LABEL[p.type]}
          </Text>
        </View>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      width: 120,
      align: 'right',
      sortable: true,
      accessor: (p) => (
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodySm" color={colors.text.primary}>
            {formatCurrency(p.amountCents)}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            net {formatCurrency(p.netCents)}
          </Text>
        </View>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 130,
      accessor: (p) => (
        <Tag size="sm" tone={STATUS_TONE[p.status]} leadingDot label={STATUS_LABEL[p.status]} />
      ),
    },
    {
      id: 'method',
      header: 'Method',
      width: 130,
      accessor: (p) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {p.paymentMethod === 'apple_pay'
            ? 'Apple Pay'
            : p.paymentMethod === 'google_pay'
            ? 'Google Pay'
            : p.cardBrand
            ? `${p.cardBrand} •••• ${p.cardLast4}`
            : 'Card'}
        </Text>
      ),
    },
    {
      id: 'created',
      header: 'Created',
      width: 130,
      sortable: true,
      accessor: (p) => (
        <Text variant="bodySm" color={colors.text.muted}>
          {formatRelative(p.createdAtIso)}
        </Text>
      ),
    },
  ];

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === visible.length ? new Set() : new Set(visible.map((p) => p.id)),
    );

  return (
    <PageScroll>
      <PageHeader
        title="Payments"
        subtitle="Every charge, refund, and dispute"
        meta={`${PAYMENTS.filter((p) => p.status === 'failed').length} failed need attention`}
        trailing={
          <Button
            label="Export CSV"
            variant="ghost"
            size="sm"
            leadingIcon={<Download size={14} color={colors.brand.primary} strokeWidth={2.25} />}
            onPress={() =>
              toast.show({
                variant: 'success',
                title: `Exported ${visible.length} payments`,
              })
            }
          />
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      <View style={styles.toolbar}>
        <Input
          variant="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search payer, context…"
          containerStyle={styles.searchField}
        />
        <Select
          options={[
            { value: 'all', label: 'All types' },
            { value: 'team_share', label: 'Team share' },
            { value: 'league_registration', label: 'League registration' },
            { value: 'facility_booking', label: 'Facility booking' },
            { value: 'highlight', label: 'AI highlight' },
          ]}
          value={type}
          onChange={setType}
          width={200}
        />
      </View>

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(p) => p.id}
        selectable
        selectedIds={selected}
        onToggleSelect={(id) =>
          setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        onToggleSelectAll={toggleAll}
        onRowPress={(p) => navigation.navigate('PaymentDetail', { id: p.id })}
        emptyTitle="No payments match"
        emptyIcon={<CreditCard size={20} color={colors.brand.primary} strokeWidth={2.25} />}
      />

      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            label: 'Resend invoice',
            onPress: () => {
              toast.show({
                variant: 'success',
                title: `Invoiced ${selected.size}`,
              });
              setSelected(new Set());
            },
          },
          {
            label: 'Export CSV',
            onPress: () => {
              toast.show({
                variant: 'success',
                title: `Exported ${selected.size} rows`,
              });
              setSelected(new Set());
            },
          },
        ]}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  searchField: {
    flex: 1,
    minWidth: 240,
  },
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cellBody: {
    flex: 1,
    gap: 2,
  },
});
