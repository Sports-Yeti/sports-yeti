import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type WebPressableState } from '../../lib/pressable';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { Plus, Star, Warehouse } from 'lucide-react-native';
import {
  FacilityPortfolioCard,
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Input, Select, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import {
  FACILITIES,
  type Facility,
} from '../../mocks/facilities';
import { SPORT_OPTIONS } from '../../mocks/leagues';
import { formatCurrency } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const TABS = [
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'grid', label: 'Grid' },
  { key: 'list', label: 'List' },
];

export function FacilityListScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [view, setView] = useState('portfolio');
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState<string>('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FACILITIES.filter((f) => {
      if (sport !== 'all' && !f.sports.includes(sport as Facility['sports'][number])) return false;
      if (q && !`${f.name} ${f.city} ${f.address}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, sport]);

  return (
    <PageScroll>
      <PageHeader
        variant="hero"
        eyebrow="PORTFOLIO"
        heroImage={{
          uri: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=70',
        }}
        title="Facilities Portfolio"
        subtitle="Venues, courts, and fields across all your locations."
        meta={`${visible.length} of ${FACILITIES.length} shown`}
        trailing={
          <Button
            label="Add facility"
            variant="solid"
            size="sm"
            leadingIcon={<Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() =>
              navigation.navigate('FacilityForm', undefined)
            }
          />
        }
      />

      <View style={styles.toolbar}>
        <Input
          variant="search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or city…"
          containerStyle={styles.searchField}
        />
        <Select
          options={[
            { value: 'all', label: 'All sports' },
            ...SPORT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
          ]}
          value={sport}
          onChange={setSport}
          width={180}
        />
        <Tabs items={TABS} value={view} onChange={setView} variant="segmented" />
      </View>

      {visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Warehouse size={20} color={colors.brand.primary} strokeWidth={2.25} />}
            title="No facilities match"
            description="Try widening filters, or add a new venue."
          />
        </Card>
      ) : view === 'portfolio' ? (
        <View style={styles.portfolio}>
          {visible.map((f) => (
            <FacilityPortfolioCard
              key={f.id}
              facility={f}
              onPress={() => navigation.navigate('FacilityDetail', { id: f.id })}
              onMore={() =>
                toast.show({
                  variant: 'info',
                  title: `${f.name} actions`,
                  description: 'Action menu coming soon.',
                })
              }
              onAddSpace={() =>
                toast.show({
                  variant: 'info',
                  title: `Add space to ${f.name}`,
                  description: 'Space editor opens from FacilityDetail (mock).',
                })
              }
              onSpacePress={(space) =>
                toast.show({
                  variant: 'info',
                  title: space.name,
                  description: space.statusDetail ?? 'Space details (mock).',
                })
              }
            />
          ))}
        </View>
      ) : view === 'grid' ? (
        <View style={styles.grid}>
          {visible.map((f) => (
            <FacilityCard
              key={f.id}
              facility={f}
              onPress={() => navigation.navigate('FacilityDetail', { id: f.id })}
            />
          ))}
        </View>
      ) : (
        <Card>
          {visible.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => navigation.navigate('FacilityDetail', { id: f.id })}
              accessibilityRole="button"
              accessibilityLabel={f.name}
              style={({ hovered }: WebPressableState) => [
                styles.listRow,
                hovered ? styles.listRowHover : null,
              ]}
            >
              <View style={styles.listBody}>
                <Text variant="bodySm" color={colors.text.primary} weight="600">
                  {f.name}
                </Text>
                <Text variant="caption" color={colors.text.muted}>
                  {f.city} · {f.spaces.length} spaces
                </Text>
              </View>
              <Tag size="sm" tone="brand" label={`${f.spaces.length} spaces`} />
            </Pressable>
          ))}
        </Card>
      )}
    </PageScroll>
  );
}

function FacilityCard({ facility, onPress }: { facility: Facility; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={facility.name}
      style={({ hovered }: WebPressableState) => [
        styles.card,
        hovered ? styles.cardHover : null,
      ]}
    >
      <Image source={{ uri: facility.cover }} style={styles.cover} />
      <View style={styles.cardBody}>
        <Text variant="h4" color={colors.text.primary}>
          {facility.name}
        </Text>
        <Text variant="caption" color={colors.text.muted}>
          {facility.city} · {facility.spaces.length} spaces
        </Text>
        <View style={styles.cardMeta}>
          <View style={styles.ratingRow}>
            <Star size={12} color="#B26200" strokeWidth={2.25} />
            <Text variant="caption" color={colors.text.secondary}>
              {facility.rating.toFixed(1)} ({facility.reviewCount})
            </Text>
          </View>
          <Text variant="caption" color={colors.brand.primary}>
            from {formatCurrency(Math.min(...facility.spaces.map((s) => s.hourlyRateCents)))}/hr
          </Text>
        </View>
      </View>
    </Pressable>
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
  portfolio: {
    gap: spacing.lg,
  },
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
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  listRowHover: {
    backgroundColor: colors.surface.bg,
  },
  listBody: {
    flex: 1,
    gap: 2,
  },
});
