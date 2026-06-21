import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type WebPressableState } from '../../lib/pressable';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { Plus, Tent } from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Input, Select, Tabs, Tag, Text } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { CAMPS, STATUS_LABEL, type Camp, type CampStatus } from '../../mocks/camps';
import { formatCurrency, formatDate } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<CampStatus, 'success' | 'warning' | 'live' | 'neutral'> = {
  open: 'success',
  draft: 'warning',
  closed: 'neutral',
  completed: 'neutral',
  cancelled: 'live',
};

const TABS = [
  { key: 'all', label: 'All camps' },
  { key: 'open', label: 'Open' },
  { key: 'draft', label: 'Drafts' },
  { key: 'closed', label: 'Closed' },
];

export function CampListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CAMPS.filter((c) => {
      if (tab !== 'all' && c.status !== tab) return false;
      if (q && !`${c.name} ${c.sportLabel} ${c.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, search]);

  return (
    <PageScroll>
      <PageHeader
        title="Camps"
        subtitle="Skills clinics, camps, and bootcamps"
        meta={`${CAMPS.filter((c) => c.status === 'open').length} open · ${visible.length} shown`}
        trailing={
          <Button
            label="New camp"
            variant="solid"
            size="sm"
            leadingIcon={<Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() => navigation.navigate('CampForm', undefined)}
          />
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} variant="segmented" />

      <Input
        variant="search"
        value={search}
        onChangeText={setSearch}
        placeholder="Search camps by name, sport, or city…"
      />

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Tent size={20} color={colors.brand.primary} strokeWidth={2.25} />}
            title="No camps match"
            description="Drafts are hidden until you publish them."
          />
        </Card>
      ) : (
        <View style={styles.grid}>
          {visible.map((c) => (
            <CampCard key={c.id} camp={c} onPress={() => navigation.navigate('CampDetail', { id: c.id })} />
          ))}
        </View>
      )}
    </PageScroll>
  );
}

function CampCard({ camp, onPress }: { camp: Camp; onPress: () => void }) {
  const fillPct = Math.round((camp.registered / camp.capacity) * 100);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={camp.name}
      style={({ hovered }: WebPressableState) => [
        styles.card,
        hovered ? styles.cardHover : null,
      ]}
    >
      <Image source={{ uri: camp.cover }} style={styles.cover} />
      <View style={styles.cardBody}>
        <View style={styles.cardHead}>
          <Tag size="sm" tone={STATUS_TONE[camp.status]} leadingDot label={STATUS_LABEL[camp.status]} />
          <Text variant="caption" color={colors.text.muted}>
            {camp.ageGroup}
          </Text>
        </View>
        <Text variant="h3" color={colors.text.primary}>
          {camp.name}
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {camp.sportLabel} · {camp.city}
        </Text>
        <View style={styles.cardMeta}>
          <Text variant="bodySm" color={colors.text.secondary}>
            {formatDate(camp.startIso)} – {formatDate(camp.endIso)}
          </Text>
          <Text variant="bodySm" color={colors.brand.primary}>
            {camp.feeCents === 0 ? 'Free' : formatCurrency(camp.feeCents)}
          </Text>
        </View>
        <View style={styles.fillRow}>
          <View style={styles.fillBar}>
            <View style={[styles.fillFill, { width: `${Math.min(100, fillPct)}%` }]} />
          </View>
          <Text variant="caption" color={colors.text.muted}>
            {camp.registered} / {camp.capacity}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    minWidth: 280,
    maxWidth: 360,
    backgroundColor: colors.surface.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border.soft,
    overflow: 'hidden',
  },
  cardHover: {
    borderColor: colors.border.strong,
  },
  cover: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surface.chip,
  },
  cardBody: {
    padding: spacing.md,
    gap: 4,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  fillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
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
