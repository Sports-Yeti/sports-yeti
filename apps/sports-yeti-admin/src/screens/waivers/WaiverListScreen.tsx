import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FileText, Plus } from 'lucide-react-native';
import {
  DataTable,
  PageHeader,
  PageScroll,
  type AdminRouteName,
  type DataTableColumn,
} from '../../admin';
import { Button, Input, Tag, Text, useToast } from '../../ui';
import { colors, spacing } from '../../theme';
import { WAIVERS, type Waiver } from '../../mocks/waivers';
import { formatDate, formatPercent } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

export function WaiverListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return WAIVERS.filter((w) =>
      q ? `${w.title} ${w.leagueName}`.toLowerCase().includes(q) : true,
    );
  }, [search]);

  const columns: DataTableColumn<Waiver>[] = [
    {
      id: 'title',
      header: 'Waiver',
      width: 320,
      sortable: true,
      accessor: (w) => (
        <View>
          <Text variant="bodySm" color={colors.text.primary} weight="600">
            {w.title}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {w.leagueName}
          </Text>
        </View>
      ),
    },
    {
      id: 'required',
      header: 'Required',
      width: 110,
      accessor: (w) =>
        w.isRequired ? (
          <Tag size="sm" tone="warning" label="Required" />
        ) : (
          <Tag size="sm" tone="neutral" label="Optional" />
        ),
    },
    {
      id: 'completion',
      header: 'Completion',
      width: 200,
      accessor: (w) => (
        <View style={styles.fillRow}>
          <View style={styles.fillBar}>
            <View
              style={[
                styles.fillFill,
                {
                  width: `${Math.min(
                    100,
                    Math.round((w.signatureCount / Math.max(w.totalRequired, 1)) * 100),
                  )}%`,
                },
              ]}
            />
          </View>
          <Text variant="caption" color={colors.text.muted}>
            {formatPercent(w.signatureCount, w.totalRequired)}
          </Text>
        </View>
      ),
    },
    {
      id: 'signatures',
      header: 'Signatures',
      width: 130,
      align: 'right',
      sortable: true,
      accessor: (w) => (
        <Text variant="bodySm" color={colors.text.primary}>
          {w.signatureCount} / {w.totalRequired}
        </Text>
      ),
    },
    {
      id: 'expires',
      header: 'Expires',
      width: 140,
      accessor: (w) => (
        <Text variant="bodySm" color={colors.text.secondary}>
          {w.expiresIso ? formatDate(w.expiresIso) : 'No expiry'}
        </Text>
      ),
    },
  ];

  return (
    <PageScroll>
      <PageHeader
        title="Waivers"
        subtitle="Required and optional documents your players must sign"
        trailing={
          <Button
            label="New waiver"
            variant="solid"
            size="sm"
            leadingIcon={<Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() => navigation.navigate('WaiverForm', undefined)}
          />
        }
      />

      <Input
        variant="search"
        value={search}
        onChangeText={setSearch}
        placeholder="Search waivers…"
      />

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(w) => w.id}
        onRowPress={(w) => navigation.navigate('WaiverDetail', { id: w.id })}
        emptyTitle="No waivers"
        emptyIcon={<FileText size={20} color={colors.brand.primary} strokeWidth={2.25} />}
      />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  fillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fillBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface.chip,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fillFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
  },
});
