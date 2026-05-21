import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronDown,
  MapPin,
  Plus,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  type DateRange,
  DateRangeField,
  EmptyState,
  RadiusMapPicker,
  type RadiusCenter,
  ScreenHeader,
  SearchBar,
  SectionHeader,
  SportCombobox,
  SportMultiSelectSheet,
  Tabs,
  Text,
  type TimeRange,
  TimeRangeField,
  toMinutes,
} from '../../ui';
import { EventCard } from '../../components/EventCard';
import {
  DISCOVER_GAMES,
  gameCoords,
  OPEN_STATUS_FILTERS,
  SKILL_LABELS,
  sportCatalogEntry,
  type DiscoverGame,
  type GameSkillLevel,
  type OpenStatusFilter,
} from '../../mocks/games';
import {
  DEFAULT_MAP_CENTER,
  distanceMilesBetween,
} from '../../mocks/facilities';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface FilterState {
  /** Multi-select sport keys from `SPORT_CATALOG`. Empty = match all sports. */
  sports: Set<string>;
  search: string;
  dateRange: DateRange;
  timeRange: TimeRange;
  radiusMiles: number;
  center: RadiusCenter | null;
  skill: GameSkillLevel;
  status: OpenStatusFilter;
}

const DEFAULT_RADIUS = 25;

function initialFilters(): FilterState {
  return {
    sports: new Set<string>(),
    search: '',
    dateRange: { start: null, end: null },
    timeRange: { start: null, end: null },
    radiusMiles: DEFAULT_RADIUS,
    center: null,
    skill: 'all',
    status: 'open',
  };
}

function applyFilters(games: DiscoverGame[], f: FilterState): DiscoverGame[] {
  const search = f.search.trim().toLowerCase();
  const center = f.center ?? { ...DEFAULT_MAP_CENTER, label: 'Default' };
  const rangeStart = f.dateRange.start
    ? new Date(f.dateRange.start).setHours(0, 0, 0, 0)
    : null;
  const rangeEnd = f.dateRange.end
    ? new Date(f.dateRange.end).setHours(23, 59, 59, 999)
    : null;
  const timeStart = f.timeRange.start ? toMinutes(f.timeRange.start) : null;
  const timeEnd = f.timeRange.end ? toMinutes(f.timeRange.end) : null;

  // Resolve selected catalogue entries back to the canonical buckets that
  // discover-games are tagged with. Selections that bucket to `null` (e.g.
  // pickleball, BJJ — sports we don't yet have fixtures for) just don't
  // match anything, which is the correct behaviour.
  const allowedBuckets =
    f.sports.size > 0
      ? new Set(
          [...f.sports]
            .map((k) => sportCatalogEntry(k)?.bucket)
            .filter((b): b is NonNullable<typeof b> => !!b),
        )
      : null;

  return games.filter((g) => {
    if (f.status !== 'all' && g.openStatus !== f.status) return false;
    if (allowedBuckets && !allowedBuckets.has(g.sport as never)) return false;
    if (f.skill !== 'all' && g.skillLevel !== 'all' && g.skillLevel !== f.skill)
      return false;
    if (rangeStart !== null || rangeEnd !== null) {
      const startsAt = new Date(g.startsAt).getTime();
      if (rangeStart !== null && startsAt < rangeStart) return false;
      if (rangeEnd !== null && startsAt > rangeEnd) return false;
    }
    if (timeStart !== null || timeEnd !== null) {
      const startsAt = new Date(g.startsAt);
      const m = startsAt.getHours() * 60 + startsAt.getMinutes();
      if (timeStart !== null && m < timeStart) return false;
      if (timeEnd !== null && m > timeEnd) return false;
    }
    const coords = gameCoords(g);
    if (coords) {
      const d = distanceMilesBetween(center, coords);
      if (d > f.radiusMiles) return false;
    }
    if (search) {
      const haystack = `${g.title} ${g.location} ${g.sport}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

function distanceLabel(f: FilterState): string {
  const where = f.center?.label ?? 'Default area';
  return `${f.radiusMiles} mi · ${where}`;
}

function statusLabel(status: OpenStatusFilter): string {
  return OPEN_STATUS_FILTERS.find((s) => s.key === status)?.label ?? 'Open';
}

function hasNonDefaultFilters(f: FilterState): boolean {
  return (
    f.sports.size > 0 ||
    f.status !== 'open' ||
    f.skill !== 'all' ||
    f.radiusMiles !== DEFAULT_RADIUS ||
    f.center !== null ||
    f.dateRange.start !== null ||
    f.dateRange.end !== null ||
    f.timeRange.start !== null ||
    f.timeRange.end !== null
  );
}

// ---------- Pill components ----------

interface PillProps {
  label: string;
  onPress: () => void;
  /** Optional close affordance. When provided shows an X icon and routes
   *  its press to `onClose` instead of `onPress`. */
  onClose?: () => void;
  accessibilityLabel?: string;
  /** Optional leading icon. */
  leading?: React.ReactNode;
}

/**
 * Compact tappable filter pill. The whole pill opens the filter sheet (or
 * whatever `onPress` does). A small embedded X — when `onClose` is set —
 * removes just this filter without opening the sheet.
 */
function Pill({ label, onPress, onClose, accessibilityLabel, leading }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        pillStyles.base,
        pressed ? pillStyles.pressed : null,
      ]}
      hitSlop={4}
    >
      {leading ? <View style={pillStyles.leading}>{leading}</View> : null}
      <Text variant="caption" color={colors.brand.deep} style={pillStyles.label}>
        {label}
      </Text>
      {onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          hitSlop={10}
          onPress={onClose}
          style={pillStyles.closeBtn}
        >
          <X size={12} color={colors.brand.deep} strokeWidth={2.5} />
        </Pressable>
      ) : (
        <ChevronDown
          size={12}
          color={colors.brand.deep}
          strokeWidth={2.5}
        />
      )}
    </Pressable>
  );
}

const pillStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minHeight: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.soft,
  },
  pressed: {
    opacity: 0.8,
  },
  leading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.brand.deep,
  },
  closeBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.card,
  },
});

// ---------- Screen ----------

export function DiscoverScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sportSheetOpen, setSportSheetOpen] = useState(false);

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();
  const visibleGames = useMemo(
    () => applyFilters(DISCOVER_GAMES, filters),
    [filters],
  );
  const featuredGame = visibleGames.find((g) => g.featured);
  const regularGames = visibleGames.filter(
    (g) => !g.featured || g.id !== featuredGame?.id,
  );

  const selectedSportEntries = useMemo(
    () =>
      [...filters.sports]
        .map((k) => sportCatalogEntry(k))
        .filter((e): e is NonNullable<ReturnType<typeof sportCatalogEntry>> => !!e),
    [filters.sports],
  );

  const removeSport = (key: string) =>
    setFilters((p) => {
      const next = new Set(p.sports);
      next.delete(key);
      return { ...p, sports: next };
    });

  return (
    <View style={styles.root}>
      <ScreenHeader
        initials={initials}
        hasNotifications
        onAvatarPress={() => navigation.navigate('Profile' as never)}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SearchBar
          value={filters.search}
          onChangeText={(v) => setFilters((p) => ({ ...p, search: v }))}
          placeholder="Search games, sports, locations…"
          onFilterPress={() => setFilterSheetOpen(true)}
        />

        <View style={styles.pillRow}>
          {selectedSportEntries.map((entry) => (
            <Pill
              key={entry.key}
              label={entry.label}
              onPress={() => setSportSheetOpen(true)}
              onClose={() => removeSport(entry.key)}
              accessibilityLabel={`${entry.label} sport filter`}
            />
          ))}
          {selectedSportEntries.length === 0 ? (
            <Pill
              label="Sports · Any"
              onPress={() => setSportSheetOpen(true)}
            />
          ) : null}
          <Pill
            label={`Status · ${statusLabel(filters.status)}`}
            onPress={() => setFilterSheetOpen(true)}
          />
          <Pill
            label={
              filters.skill === 'all'
                ? 'Skill · All'
                : `Skill · ${SKILL_LABELS[filters.skill]}`
            }
            onPress={() => setFilterSheetOpen(true)}
          />
          <Pill
            label={distanceLabel(filters)}
            onPress={() => setFilterSheetOpen(true)}
            leading={
              <MapPin
                size={12}
                color={colors.brand.deep}
                strokeWidth={2.5}
              />
            }
          />
          {hasNonDefaultFilters(filters) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
              hitSlop={8}
              onPress={() => setFilters(initialFilters)}
              style={styles.clearBtn}
            >
              <Text variant="caption" color={colors.text.secondary}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>

        {featuredGame ? (
          <View style={styles.section}>
            <SectionHeader title="Featured" />
            <EventCard
              game={featuredGame}
              onPress={() =>
                navigation.navigate('GameDetails', { id: featuredGame.id })
              }
              onJoinPress={() =>
                navigation.navigate('GameDetails', { id: featuredGame.id })
              }
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title={`${regularGames.length} ${
              filters.status === 'closed' ? 'closed' : 'open'
            } event${regularGames.length === 1 ? '' : 's'}`}
          />
          {regularGames.length === 0 ? (
            <EmptyState
              icon={
                <SlidersHorizontal
                  size={28}
                  color={colors.brand.primary}
                  strokeWidth={2.25}
                />
              }
              title="No games match your filters"
              description="Try expanding the date range, distance, or skill — or host your own scrimmage."
              primaryAction={{
                label: 'Host a scrimmage',
                onPress: () => navigation.navigate('CreateGame'),
              }}
              secondaryAction={{
                label: 'Reset filters',
                onPress: () => setFilters(initialFilters),
              }}
            />
          ) : (
            <View style={styles.cardsColumn}>
              {regularGames.map((game) => (
                <EventCard
                  key={game.id}
                  game={game}
                  onPress={() =>
                    navigation.navigate('GameDetails', { id: game.id })
                  }
                  onJoinPress={() =>
                    navigation.navigate('GameDetails', { id: game.id })
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Host a new game"
        onPress={() => navigation.navigate('CreateGame')}
        style={[
          styles.fab,
          shadows.card,
          { bottom: insets.bottom + 110 },
        ]}
      >
        <Plus size={20} color={colors.text.inverse} strokeWidth={2.5} />
        <Text variant="button" color={colors.text.inverse}>
          Host a game
        </Text>
      </Pressable>

      <BottomSheet
        visible={filterSheetOpen}
        onRequestClose={() => setFilterSheetOpen(false)}
        title="Filter games"
        snapPoints={['92%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Status
            </Text>
            <Tabs
              variant="segmented"
              items={OPEN_STATUS_FILTERS.map((s) => ({
                key: s.key,
                label: s.label,
              }))}
              value={filters.status}
              onChange={(k) =>
                setFilters((p) => ({ ...p, status: k as OpenStatusFilter }))
              }
            />
          </View>

          <View style={styles.sheetGroup}>
            <DateRangeField
              label="Date range"
              value={filters.dateRange}
              onChange={(dateRange) =>
                setFilters((p) => ({ ...p, dateRange }))
              }
              helpText="Filter by when games are scheduled."
            />
          </View>

          <View style={styles.sheetGroup}>
            <TimeRangeField
              label="Time of day"
              value={filters.timeRange}
              onChange={(timeRange) =>
                setFilters((p) => ({ ...p, timeRange }))
              }
              helpText="Useful for lunch-hour pickup or after-work games."
            />
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Sports
            </Text>
            <SportCombobox
              value={filters.sports}
              onChange={(sports) => setFilters((p) => ({ ...p, sports }))}
              placeholder="Search sports (e.g. pickleball, futsal)…"
              scrollResults={false}
              maxVisibleResults={6}
            />
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Pin a location & radius
            </Text>
            <RadiusMapPicker
              center={filters.center}
              onChangeCenter={(center) =>
                setFilters((p) => ({ ...p, center }))
              }
              radiusMiles={filters.radiusMiles}
              onChangeRadius={(radiusMiles) =>
                setFilters((p) => ({ ...p, radiusMiles }))
              }
            />
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Skill level
            </Text>
            <Tabs
              variant="segmented"
              items={(Object.keys(SKILL_LABELS) as GameSkillLevel[]).map(
                (k) => ({ key: k, label: SKILL_LABELS[k] }),
              )}
              value={filters.skill}
              onChange={(key) =>
                setFilters((p) => ({ ...p, skill: key as GameSkillLevel }))
              }
            />
          </View>

          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="ghost"
              onPress={() => setFilters(initialFilters)}
              fullWidth
            />
            <Button
              label={
                visibleGames.length === 0
                  ? 'No matches'
                  : `Show ${visibleGames.length} result${
                      visibleGames.length === 1 ? '' : 's'
                    }`
              }
              variant="gradient"
              onPress={() => setFilterSheetOpen(false)}
              fullWidth
            />
          </View>
        </ScrollView>
      </BottomSheet>

      <SportMultiSelectSheet
        visible={sportSheetOpen}
        onRequestClose={() => setSportSheetOpen(false)}
        value={filters.sports}
        onApply={(sports) => setFilters((p) => ({ ...p, sports }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  clearBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: 'center',
  },
  section: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  cardsColumn: {
    gap: spacing.xxl,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primary,
  },
  sheetContent: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sheetGroup: {
    gap: spacing.md,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
