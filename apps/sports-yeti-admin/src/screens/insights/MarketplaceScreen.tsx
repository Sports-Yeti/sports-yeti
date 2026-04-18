import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Flag, ShoppingBag } from 'lucide-react-native';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type DataTableColumn,
} from '../../admin';
import { Avatar, Button, Input, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { MARKETPLACE_LISTINGS, type MarketplaceListing } from '../../mocks/insights';
import { formatCurrency, formatRelative } from '../../lib/format';

const TABS = [
  { key: 'all', label: 'All listings' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'archived', label: 'Archived' },
];

export function MarketplaceScreen() {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MARKETPLACE_LISTINGS.filter((l) => {
      if (tab !== 'all' && l.status !== tab) return false;
      if (q && !`${l.title} ${l.postedByName} ${l.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, search]);

  const columns: DataTableColumn<MarketplaceListing>[] = [
    {
      id: 'title',
      header: 'Listing',
      width: 320,
      accessor: (l) => (
        <View>
          <Text variant="bodySm" color={colors.text.primary} weight="600">
            {l.title}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {l.type.replace('_', ' ')} · {l.city}
          </Text>
        </View>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      width: 130,
      align: 'right',
      accessor: (l) => (
        <Text variant="bodySm" color={colors.brand.primary}>
          {l.priceCents === null ? 'Free' : formatCurrency(l.priceCents)}
        </Text>
      ),
    },
    {
      id: 'postedBy',
      header: 'Posted by',
      width: 220,
      accessor: (l) => (
        <View style={styles.cellRow}>
          <Avatar uri={l.postedByAvatar} initials={l.postedByName.charAt(0)} size={24} />
          <Text variant="bodySm" color={colors.text.primary}>
            {l.postedByName}
          </Text>
        </View>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 130,
      accessor: (l) => (
        <Tag
          size="sm"
          tone={l.status === 'flagged' ? 'live' : l.status === 'archived' ? 'neutral' : 'success'}
          leadingDot
          label={l.status}
        />
      ),
    },
    {
      id: 'posted',
      header: 'Posted',
      width: 130,
      accessor: (l) => (
        <Text variant="bodySm" color={colors.text.muted}>
          {formatRelative(l.postedAtIso)}
        </Text>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Marketplace"
        subtitle="Player-posted gear, sub-for-hire, and services"
        meta={`${MARKETPLACE_LISTINGS.filter((l) => l.status === 'flagged').length} flagged need review`}
        trailing={
          <Button
            label="Review flagged"
            variant="solid"
            size="sm"
            leadingIcon={<Flag size={14} color={colors.text.inverse} strokeWidth={2.25} />}
            onPress={() => setTab('flagged')}
          />
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      <Input
        variant="search"
        value={search}
        onChangeText={setSearch}
        placeholder="Search listings…"
      />

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(l) => l.id}
        emptyTitle="No listings"
        emptyIcon={<ShoppingBag size={20} color={colors.brand.primary} strokeWidth={2.25} />}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
