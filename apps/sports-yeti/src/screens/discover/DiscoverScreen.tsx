import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Plus,
  SlidersHorizontal,
  Tent,
  Trophy,
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
import { CampCard } from '../../components/CampCard';
import { DiscoverLeagueCard } from '../../components/DiscoverLeagueCard';
import { ShareToTeamSheet } from '../../components/ShareToTeamSheet';
import {
  gameCoords,
  OPEN_STATUS_FILTERS,
  SKILL_LABELS,
  sportCatalogEntry,
  type DiscoverGame,
  type GameSkillLevel,
  type OpenStatusFilter,
} from '../../mocks/games';
import { DISCOVER_CAMPS, campCoords, type DiscoverCamp } from '../../mocks/camps';
import { OPEN_LEAGUES, CITY_COORDS, type OpenLeague } from '../../mocks/teams';
import { useDiscoverGames } from '../../features/discover-store';
import {
  DEFAULT_MAP_CENTER,
  distanceMilesBetween,
} from '../../mocks/facilities';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type ContentType = 'games' | 'camps' | 'leagues';

const CONTENT_TABS: { key: ContentType; label: string }[] = [
  { key: 'games', label: 'Games' },
  { key: 'camps', label: 'Camps' },
  { key: 'leagues', label: 'Leagues' },
];

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

/** Per content type, which filter sections / pills apply. */
const CONTENT_CONFIG: Record<
  ContentType,
  { status: boolean; skill: boolean; date: boolean; time: boolean }
> = {
  games: { status: true, skill: true, date: true, time: true },
  camps: { status: true, skill: true, date: true, time: false },
  leagues: { status: false, skill: false, date: false, time: false },
};

function resolveAllowedBuckets(sports: Set<string>): Set<string> | null {
  if (sports.size === 0) return null;
  return new Set(
    [...sports]
      .map((k) => sportCatalogEntry(k)?.bucket)
      .filter((b): b is NonNullable<typeof b> => !!b),
  );
}

function withinRadius(
  coords: { latitude: number; longitude: number } | null,
  center: RadiusCenter,
  radiusMiles: number,
): boolean {
  if (!coords) return true;
  return distanceMilesBetween(center, coords) <= radiusMiles;
}

function filterGames(f: FilterState, games: DiscoverGame[]): DiscoverGame[] {
  const search = f.search.trim().toLowerCase();
  const center = f.center ?? { ...DEFAULT_MAP_CENTER, label: 'Default' };
  const buckets = resolveAllowedBuckets(f.sports);
  const rangeStart = f.dateRange.start
    ? new Date(f.dateRange.start).setHours(0, 0, 0, 0)
    : null;
  const rangeEnd = f.dateRange.end
    ? new Date(f.dateRange.end).setHours(23, 59, 59, 999)
    : null;
  const timeStart = f.timeRange.start ? toMinutes(f.timeRange.start) : null;
  const timeEnd = f.timeRange.end ? toMinutes(f.timeRange.end) : null;

  return games.filter((g) => {
    if (f.status !== 'all' && g.openStatus !== f.status) return false;
    if (buckets && !buckets.has(g.sport)) return false;
    if (f.skill !== 'all' && g.skillLevel !== 'all' && g.skillLevel !== f.skill)
      return false;
    if (rangeStart !== null || rangeEnd !== null) {
      const startsAt = new Date(g.startsAt).getTime();
      if (rangeStart !== null && startsAt < rangeStart) return false;
      if (rangeEnd !== null && startsAt > rangeEnd) return false;
    }
    if (timeStart !== null || timeEnd !== null) {
      const d = new Date(g.startsAt);
      const m = d.getHours() * 60 + d.getMinutes();
      if (timeStart !== null && m < timeStart) return false;
      if (timeEnd !== null && m > timeEnd) return false;
    }
    if (!withinRadius(gameCoords(g), center, f.radiusMiles)) return false;
    if (search) {
      const hay = `${g.title} ${g.location} ${g.sport}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function filterCamps(f: FilterState): DiscoverCamp[] {
  const search = f.search.trim().toLowerCase();
  const center = f.center ?? { ...DEFAULT_MAP_CENTER, label: 'Default' };
  const buckets = resolveAllowedBuckets(f.sports);
  const rangeStart = f.dateRange.start
    ? new Date(f.dateRange.start).setHours(0, 0, 0, 0)
    : null;
  const rangeEnd = f.dateRange.end
    ? new Date(f.dateRange.end).setHours(23, 59, 59, 999)
    : null;

  return DISCOVER_CAMPS.filter((c) => {
    if (f.status !== 'all' && c.status !== f.status) return false;
    if (buckets && !buckets.has(c.sport)) return false;
    if (f.skill !== 'all' && c.skillLevel !== 'all' && c.skillLevel !== f.skill)
      return false;
    if (rangeStart !== null || rangeEnd !== null) {
      const startsAt = new Date(c.startsAt).getTime();
      if (rangeStart !== null && startsAt < rangeStart) return false;
      if (rangeEnd !== null && startsAt > rangeEnd) return false;
    }
    if (!withinRadius(campCoords(c), center, f.radiusMiles)) return false;
    if (search) {
      const hay = `${c.title} ${c.city} ${c.sport} ${c.organizer}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function filterLeagues(f: FilterState): OpenLeague[] {
  const search = f.search.trim().toLowerCase();
  const center = f.center ?? { ...DEFAULT_MAP_CENTER, label: 'Default' };
  const buckets = resolveAllowedBuckets(f.sports);

  return OPEN_LEAGUES.filter((l) => {
    if (buckets && !buckets.has(l.sportKey)) return false;
    if (!withinRadius(CITY_COORDS[l.city] ?? null, center, f.radiusMiles))
      return false;
    if (search) {
      const hay = `${l.name} ${l.sport} ${l.city}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function distanceLabel(f: FilterState): string {
  return `${f.radiusMiles} mi · ${f.center?.label ?? 'Default area'}`;
}

function statusLabel(status: OpenStatusFilter): string {
  return OPEN_STATUS_FILTERS.find((s) => s.key === status)?.label ?? 'Open';
}

function dateRangeLabel(range: DateRange): string | null {
  if (!range.start && !range.end) return null;
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (range.start && range.end) return `${fmt(range.start)} → ${fmt(range.end)}`;
  if (range.start) return `From ${fmt(range.start)}`;
  return `Until ${fmt(range.end!)}`;
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

// ---------- Pill ----------

interface PillProps {
  label: string;
  onPress: () => void;
  onClose?: () => void;
  accessibilityLabel?: string;
  leading?: React.ReactNode;
}

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
        <ChevronDown size={12} color={colors.brand.deep} strokeWidth={2.5} />
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
  const [content, setContent] = useState<ContentType>('games');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sportSheetOpen, setSportSheetOpen] = useState(false);
  const [shareLeague, setShareLeague] = useState<OpenLeague | null>(null);

  const config = CONTENT_CONFIG[content];
  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  // Seeded fixtures + games hosted through the wizard this session.
  const allGames = useDiscoverGames();
  const games = useMemo(
    () => filterGames(filters, allGames),
    [filters, allGames],
  );
  const camps = useMemo(() => filterCamps(filters), [filters]);
  const leagues = useMemo(() => filterLeagues(filters), [filters]);

  const featuredGame = content === 'games' ? games.find((g) => g.featured) : undefined;
  const regularGames = games.filter(
    (g) => !g.featured || g.id !== featuredGame?.id,
  );

  const resultCount =
    content === 'games'
      ? games.length
      : content === 'camps'
      ? camps.length
      : leagues.length;

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

  const dateLabel = dateRangeLabel(filters.dateRange);

  const sectionTitle =
    content === 'games'
      ? `${resultCount} ${filters.status === 'closed' ? 'closed' : 'open'} game${resultCount === 1 ? '' : 's'}`
      : content === 'camps'
      ? `${resultCount} camp${resultCount === 1 ? '' : 's'}`
      : `${resultCount} league${resultCount === 1 ? '' : 's'}`;

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
        <View style={styles.contentSwitch}>
          <Tabs
            variant="segmented"
            items={CONTENT_TABS}
            value={content}
            onChange={(k) => setContent(k as ContentType)}
          />
        </View>

        <SearchBar
          value={filters.search}
          onChangeText={(v) => setFilters((p) => ({ ...p, search: v }))}
          placeholder={
            content === 'games'
              ? 'Search games, sports, locations…'
              : content === 'camps'
              ? 'Search camps, coaches, cities…'
              : 'Search leagues, sports, cities…'
          }
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
            <Pill label="Sports · Any" onPress={() => setSportSheetOpen(true)} />
          ) : null}

          {config.status ? (
            <Pill
              label={`Status · ${statusLabel(filters.status)}`}
              onPress={() => setFilterSheetOpen(true)}
            />
          ) : null}

          {config.skill ? (
            <Pill
              label={
                filters.skill === 'all'
                  ? 'Skill · All'
                  : `Skill · ${SKILL_LABELS[filters.skill]}`
              }
              onPress={() => setFilterSheetOpen(true)}
            />
          ) : null}

          {config.date && dateLabel ? (
            <Pill
              label={dateLabel}
              onPress={() => setFilterSheetOpen(true)}
              leading={
                <CalendarDays size={12} color={colors.brand.deep} strokeWidth={2.5} />
              }
            />
          ) : null}

          <Pill
            label={distanceLabel(filters)}
            onPress={() => setFilterSheetOpen(true)}
            leading={<MapPin size={12} color={colors.brand.deep} strokeWidth={2.5} />}
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
          <SectionHeader title={sectionTitle} />
          {resultCount === 0 ? (
            <EmptyState
              icon={
                content === 'games' ? (
                  <SlidersHorizontal size={28} color={colors.brand.primary} strokeWidth={2.25} />
                ) : content === 'camps' ? (
                  <Tent size={28} color={colors.brand.primary} strokeWidth={2.25} />
                ) : (
                  <Trophy size={28} color={colors.brand.primary} strokeWidth={2.25} />
                )
              }
              title={
                content === 'games'
                  ? 'No games match your filters'
                  : content === 'camps'
                  ? 'No camps match your filters'
                  : 'No leagues match your filters'
              }
              description={
                content === 'leagues'
                  ? 'Try a different sport or widen the distance — or check back as new seasons open.'
                  : 'Try expanding the date range, distance, or skill.'
              }
              primaryAction={
                content === 'games'
                  ? {
                      label: 'Host a scrimmage',
                      onPress: () => navigation.navigate('CreateGame'),
                    }
                  : { label: 'Reset filters', onPress: () => setFilters(initialFilters) }
              }
              secondaryAction={
                content === 'games'
                  ? { label: 'Reset filters', onPress: () => setFilters(initialFilters) }
                  : undefined
              }
            />
          ) : (
            <View style={styles.cardsColumn}>
              {content === 'games'
                ? regularGames.map((game) => (
                    <EventCard
                      key={game.id}
                      game={game}
                      onPress={() => navigation.navigate('GameDetails', { id: game.id })}
                      onJoinPress={() => navigation.navigate('GameDetails', { id: game.id })}
                    />
                  ))
                : null}
              {content === 'camps'
                ? camps.map((camp) => (
                    <CampCard
                      key={camp.id}
                      camp={camp}
                      onPress={() => navigation.navigate('CampDetails', { id: camp.id })}
                      onRegisterPress={() =>
                        navigation.navigate('CampDetails', { id: camp.id })
                      }
                    />
                  ))
                : null}
              {content === 'leagues'
                ? leagues.map((league) => (
                    <DiscoverLeagueCard
                      key={league.id}
                      league={league}
                      onPress={() =>
                        navigation.navigate('LeagueDetails', { leagueId: league.id })
                      }
                      onSharePress={() => setShareLeague(league)}
                    />
                  ))
                : null}
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Host a new game"
        onPress={() => navigation.navigate('CreateGame')}
        style={[styles.fab, shadows.card, { bottom: insets.bottom + 110 }]}
      >
        <Plus size={20} color={colors.text.inverse} strokeWidth={2.5} />
        <Text variant="button" color={colors.text.inverse}>
          Host a game
        </Text>
      </Pressable>

      {/* ---------- Filter sheet ---------- */}
      <BottomSheet
        visible={filterSheetOpen}
        onRequestClose={() => setFilterSheetOpen(false)}
        title={`Filter ${content}`}
        snapPoints={['92%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {config.status ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Status
              </Text>
              <Tabs
                variant="segmented"
                items={OPEN_STATUS_FILTERS.map((s) => ({ key: s.key, label: s.label }))}
                value={filters.status}
                onChange={(k) =>
                  setFilters((p) => ({ ...p, status: k as OpenStatusFilter }))
                }
              />
            </View>
          ) : null}

          {config.date ? (
            <View style={styles.sheetGroup}>
              <DateRangeField
                label="Date range"
                value={filters.dateRange}
                onChange={(dateRange) => setFilters((p) => ({ ...p, dateRange }))}
                helpText={
                  content === 'camps'
                    ? 'Filter by when camps run.'
                    : 'Filter by when games are scheduled.'
                }
              />
            </View>
          ) : null}

          {config.time ? (
            <View style={styles.sheetGroup}>
              <TimeRangeField
                label="Time of day"
                value={filters.timeRange}
                onChange={(timeRange) => setFilters((p) => ({ ...p, timeRange }))}
                helpText="Useful for lunch-hour pickup or after-work games."
              />
            </View>
          ) : null}

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
              onChangeCenter={(center) => setFilters((p) => ({ ...p, center }))}
              radiusMiles={filters.radiusMiles}
              onChangeRadius={(radiusMiles) =>
                setFilters((p) => ({ ...p, radiusMiles }))
              }
            />
          </View>

          {config.skill ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Skill level
              </Text>
              <Tabs
                variant="segmented"
                items={(Object.keys(SKILL_LABELS) as GameSkillLevel[]).map((k) => ({
                  key: k,
                  label: SKILL_LABELS[k],
                }))}
                value={filters.skill}
                onChange={(key) =>
                  setFilters((p) => ({ ...p, skill: key as GameSkillLevel }))
                }
              />
            </View>
          ) : null}

          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="ghost"
              onPress={() => setFilters(initialFilters)}
              fullWidth
            />
            <Button
              label={
                resultCount === 0 ? 'No matches' : `Show ${resultCount} result${resultCount === 1 ? '' : 's'}`
              }
              variant="gradient"
              onPress={() => setFilterSheetOpen(false)}
              fullWidth
            />
          </View>
        </ScrollView>
      </BottomSheet>

      {/* ---------- Sport multi-select ---------- */}
      <SportMultiSelectSheet
        visible={sportSheetOpen}
        onRequestClose={() => setSportSheetOpen(false)}
        value={filters.sports}
        onApply={(sports) => setFilters((p) => ({ ...p, sports }))}
      />

      {/* ---------- League share-to-team sheet ---------- */}
      <ShareToTeamSheet
        league={shareLeague}
        onRequestClose={() => setShareLeague(null)}
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
  contentSwitch: {
    width: '100%',
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
