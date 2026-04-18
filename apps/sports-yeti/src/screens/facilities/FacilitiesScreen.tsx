import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ChevronLeft, MapPin, Star } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import { Card, EmptyState, SearchBar, Tabs, Tag, Text } from '../../ui';
import {
  FACILITIES,
  FACILITY_SPORT_LABEL,
  type Facility,
} from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SPORT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'volleyball', label: 'Volleyball' },
  { key: 'tennis', label: 'Tennis' },
  { key: 'baseball', label: 'Baseball' },
  { key: 'hockey', label: 'Hockey' },
];

function FacilityCard({ facility, onPress }: { facility: Facility; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${facility.name} in ${facility.city}`}
    >
      <Card style={styles.card}>
        <Image
          source={{ uri: facility.cover }}
          style={styles.cover}
          contentFit="cover"
        />
        <View style={styles.cardBody}>
          <View style={styles.headRow}>
            <Text variant="h3" color={colors.text.primary} style={styles.title}>
              {facility.name}
            </Text>
            <View style={styles.rating}>
              <Star size={14} color="#B26200" strokeWidth={2.25} />
              <Text variant="caption" color={colors.text.secondary}>
                {facility.rating.toFixed(1)} ({facility.reviewCount})
              </Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.secondary}>
              {facility.city} · {facility.distanceMiles} mi
            </Text>
          </View>
          <View style={styles.tagsRow}>
            {facility.sports.slice(0, 3).map((s) => (
              <Tag key={s} tone="brand" size="sm" label={FACILITY_SPORT_LABEL[s]} />
            ))}
          </View>
          <View style={styles.priceRow}>
            <Text variant="bodySm" color={colors.text.secondary}>
              {facility.hours}
            </Text>
            <Text variant="button" color={colors.brand.primary}>
              {facility.hourlyRateCents === 0
                ? 'Free'
                : `${formatCurrency(facility.hourlyRateCents)}/hr`}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export function FacilitiesScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('all');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FACILITIES.filter((f) => {
      if (sport !== 'all' && !f.sports.includes(sport as Facility['sports'][number])) return false;
      if (q) {
        const hay = `${f.name} ${f.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [search, sport]);

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Facilities
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.filtersWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search venues by name or city…"
          onFilterPress={() => undefined}
        />
        <Tabs variant="pill" scrollable items={SPORT_TABS} value={sport} onChange={setSport} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <EmptyState
            icon={<MapPin size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="No facilities match"
            description="Try a different sport or city."
            primaryAction={{
              label: 'Reset',
              onPress: () => {
                setSearch('');
                setSport('all');
              },
            }}
          />
        ) : (
          visible.map((f) => (
            <FacilityCard
              key={f.id}
              facility={f}
              onPress={() => navigation.navigate('FacilityDetails', { id: f.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface.chip,
  },
  cardBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
