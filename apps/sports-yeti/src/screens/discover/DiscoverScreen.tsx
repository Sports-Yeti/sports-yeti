import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  CalendarDays,
  MapPin,
  Plus,
  SlidersHorizontal,
  Star,
  Tent,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useAuthStore, useWatchStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  type DateRange,
  DateRangeField,
  EmptyState,
  FilterPill,
  Input,
  OptionListSheet,
  RadiusMapPicker,
  type RadiusCenter,
  SearchHeader,
  SearchMultiSelect,
  SectionHeader,
  SportCombobox,
  SportMultiSelectSheet,
  Tabs,
  Tag,
  Text,
  type TimeRange,
  TimeRangeField,
  toMinutes,
} from '../../ui';
import { EventCard } from '../../components/EventCard';
import { CampCard } from '../../components/CampCard';
import { DiscoverLeagueCard } from '../../components/DiscoverLeagueCard';
import { SquadCard } from '../../components/SquadCard';
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
import {
  OPEN_LEAGUES,
  CITY_COORDS,
  DIRECTORY_PLAYERS,
  POSITIONS_BY_SPORT,
  type CostMode,
  type DirectoryPlayer,
  type OpenLeague,
  type Squad,
  type TeamLevel,
} from '../../mocks/teams';
import { useDiscoverGames } from '../../features/discover-store';
import { useAllSquads } from '../../features/created-squads-store';
import { useTeamMembershipStore } from '../../features/team-membership-store';
import {
  catalogKeyToTeamSport,
  resolveAllowedTeamSports,
} from '../../lib/sport-filter';
import {
  DEFAULT_MAP_CENTER,
  distanceMilesBetween,
  FACILITIES,
  FACILITY_SPORT_LABEL,
  type Facility,
} from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type ContentType =
  | 'games'
  | 'camps'
  | 'leagues'
  | 'teams'
  | 'players'
  | 'facilities';

type AvailabilityFilter = 'all' | DirectoryPlayer['availability'];
type LevelFilter = 'all' | TeamLevel;
type CostFilter = 'all' | CostMode;

const CONTENT_TYPE_OPTIONS: { key: ContentType; label: string }[] = [
  { key: 'games', label: 'Games' },
  { key: 'camps', label: 'Camps' },
  { key: 'leagues', label: 'Leagues' },
  { key: 'teams', label: 'Teams' },
  { key: 'players', label: 'Players' },
  { key: 'facilities', label: 'Facilities' },
];

const AVAILABILITY_OPTIONS: { key: AvailabilityFilter; label: string }[] = [
  { key: 'all', label: 'Any' },
  { key: 'available', label: 'Available' },
  { key: 'looking_for_team', label: 'LFT' },
  { key: 'busy', label: 'Busy' },
];

const AVAILABILITY_PILL_LABEL: Record<AvailabilityFilter, string> = {
  all: 'Any',
  available: 'Available',
  looking_for_team: 'LFT',
  busy: 'Busy',
};

const AVAILABILITY_TONE = {
  available: 'success' as const,
  looking_for_team: 'warning' as const,
  busy: 'neutral' as const,
};

const AVAILABILITY_LABEL = {
  available: 'Available',
  looking_for_team: 'Looking for team',
  busy: 'Busy',
};

const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

const LEVEL_OPTIONS: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: 'All levels' },
  { key: 'RECREATIONAL', label: 'Recreational' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

const LEVEL_LABEL: Record<LevelFilter, string> = {
  all: 'All levels',
  RECREATIONAL: 'Recreational',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const COST_OPTIONS: { key: CostFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

const COST_LABEL: Record<CostFilter, string> = {
  all: 'All',
  free: 'Free',
  paid: 'Paid',
};

/** Parse a dollar string to a number, or null when blank / invalid. */
function parseDollars(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const SEARCH_PLACEHOLDER: Record<ContentType, string> = {
  games: 'Search games, sports, locations…',
  camps: 'Search camps, coaches, cities…',
  leagues: 'Search leagues, sports, cities…',
  teams: 'Search teams, sports, positions…',
  players: 'Search players by name, position, city…',
  facilities: 'Search venues by name or city…',
};

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
  /** Player availability filter. */
  availability: AvailabilityFilter;
  /** Multi-select experience labels (capitalized). Empty = any level. */
  experience: Set<string>;
  /** Multi-select roster positions (team domain). Empty = any position. */
  positions: Set<string>;
  /** Team competitive level. */
  level: LevelFilter;
  /** Team cost mode. */
  cost: CostFilter;
  /** Per-player cost bounds (dollar strings; blank = unbounded). */
  minCost: string;
  maxCost: string;
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
    availability: 'all',
    experience: new Set<string>(),
    positions: new Set<string>(),
    level: 'all',
    cost: 'all',
    minCost: '',
    maxCost: '',
  };
}

/** Per content type, which filter sections / pills apply beyond sports + distance. */
interface ContentConfig {
  status: boolean;
  skill: boolean;
  date: boolean;
  time: boolean;
  availability: boolean;
  experience: boolean;
  position: boolean;
  level: boolean;
  cost: boolean;
}

const CONTENT_CONFIG: Record<ContentType, ContentConfig> = {
  games: { status: true, skill: true, date: true, time: true, availability: false, experience: false, position: false, level: false, cost: false },
  camps: { status: true, skill: true, date: true, time: false, availability: false, experience: false, position: false, level: false, cost: false },
  leagues: { status: false, skill: false, date: false, time: false, availability: false, experience: false, position: false, level: false, cost: false },
  teams: { status: false, skill: false, date: false, time: false, availability: false, experience: false, position: true, level: true, cost: true },
  players: { status: false, skill: false, date: false, time: false, availability: true, experience: true, position: false, level: false, cost: false },
  facilities: { status: false, skill: false, date: false, time: false, availability: false, experience: false, position: false, level: false, cost: false },
};

/** Games, camps, and leagues filter around a default map center (Denver). The
 *  team-domain surfaces (teams, players, facilities) only filter by radius once
 *  the user pins a center, since they span far-flung cities. */
function usesDefaultCenter(content: ContentType): boolean {
  return content === 'games' || content === 'camps' || content === 'leagues';
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

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
  const allowed = resolveAllowedTeamSports(f.sports);

  return OPEN_LEAGUES.filter((l) => {
    if (allowed && !allowed.has(l.sportKey)) return false;
    if (!withinRadius(CITY_COORDS[l.city] ?? null, center, f.radiusMiles))
      return false;
    if (search) {
      const hay = `${l.name} ${l.sport} ${l.city}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function filterTeams(f: FilterState, squads: Squad[]): Squad[] {
  const search = f.search.trim().toLowerCase();
  const allowed = resolveAllowedTeamSports(f.sports);
  const radiusActive = f.center !== null;
  const minDollars = parseDollars(f.minCost);
  const maxDollars = parseDollars(f.maxCost);
  const lowerPositions = new Set([...f.positions].map((p) => p.toLowerCase()));

  return squads.filter((s) => {
    // Hide full rosters and teams the user already belongs to.
    if (s.rosterCount >= s.rosterMax) return false;
    if (s.membership === 'member' || s.membership === 'captain') return false;
    if (allowed && !allowed.has(s.sportKey)) return false;
    if (f.level !== 'all' && s.level !== f.level) return false;
    if (f.cost !== 'all' && s.costMode !== f.cost) return false;
    // Min/max per-player cost (ignored for the free-only filter).
    if (f.cost !== 'free') {
      const dollars = s.perPlayerCents / 100;
      if (minDollars !== null && dollars < minDollars) return false;
      if (maxDollars !== null && dollars > maxDollars) return false;
    }
    if (lowerPositions.size > 0) {
      const matchesPosition = s.needs.some((n) =>
        lowerPositions.has(n.label.toLowerCase()),
      );
      if (!matchesPosition) return false;
    }
    if (
      radiusActive &&
      distanceMilesBetween(f.center!, s.coords) > f.radiusMiles
    )
      return false;
    if (search) {
      const needsHay = s.needs.map((n) => n.label).join(' ');
      const hay = `${s.name} ${s.location} ${s.sport} ${needsHay}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function filterPlayers(f: FilterState): DirectoryPlayer[] {
  const search = f.search.trim().toLowerCase();
  const allowed = resolveAllowedTeamSports(f.sports);
  const radiusActive = f.center !== null;

  return DIRECTORY_PLAYERS.filter((p) => {
    if (allowed && !allowed.has(p.sportKey)) return false;
    if (f.availability !== 'all' && p.availability !== f.availability)
      return false;
    if (f.experience.size > 0 && !f.experience.has(capitalize(p.experience)))
      return false;
    if (radiusActive) {
      const coords = CITY_COORDS[p.city];
      if (coords && distanceMilesBetween(f.center!, coords) > f.radiusMiles)
        return false;
    }
    if (search) {
      const hay = `${p.name} ${p.handle} ${p.position} ${p.city}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function filterFacilities(f: FilterState): Facility[] {
  const search = f.search.trim().toLowerCase();
  const allowed = resolveAllowedTeamSports(f.sports);
  const radiusActive = f.center !== null;

  return FACILITIES.filter((fac) => {
    if (allowed && !fac.sports.some((s) => allowed.has(s))) return false;
    if (
      radiusActive &&
      distanceMilesBetween(f.center!, fac.coords) > f.radiusMiles
    )
      return false;
    if (search) {
      const hay = `${fac.name} ${fac.city}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  }).sort((a, b) => a.distanceMiles - b.distanceMiles);
}

function distancePillLabel(content: ContentType, f: FilterState): string {
  if (usesDefaultCenter(content)) {
    return `${f.radiusMiles} mi · ${f.center?.label ?? 'Default area'}`;
  }
  return f.center
    ? `${f.radiusMiles} mi · ${f.center.label}`
    : 'Distance · Any';
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

function experiencePillLabel(experience: Set<string>): string {
  if (experience.size === 0) return 'Experience · Any';
  if (experience.size === 1) {
    const [only] = experience;
    return `Experience · ${only}`;
  }
  return `Experience · ${experience.size} levels`;
}

function positionPillLabel(positions: Set<string>): string {
  if (positions.size === 0) return 'Position · Any';
  if (positions.size === 1) {
    const [only] = positions;
    return only ?? 'Position · Any';
  }
  return `${positions.size} positions`;
}

function costPillLabel(f: FilterState): string {
  if (f.cost === 'free') return 'Cost · Free';
  const minDollars = parseDollars(f.minCost);
  const maxDollars = parseDollars(f.maxCost);
  if (minDollars !== null && maxDollars !== null)
    return `Cost · $${minDollars}–$${maxDollars}`;
  if (minDollars !== null) return `Cost · ≥$${minDollars}`;
  if (maxDollars !== null) return `Cost · ≤$${maxDollars}`;
  return `Cost · ${COST_LABEL[f.cost]}`;
}

/** Whether any filter that applies to the active content type is non-default,
 *  so the "Clear" affordance only reflects filters visible in the current view. */
function hasNonDefaultFilters(f: FilterState, config: ContentConfig): boolean {
  if (f.sports.size > 0) return true;
  if (f.center !== null || f.radiusMiles !== DEFAULT_RADIUS) return true;
  if (config.status && f.status !== 'open') return true;
  if (config.skill && f.skill !== 'all') return true;
  if (config.availability && f.availability !== 'all') return true;
  if (config.experience && f.experience.size > 0) return true;
  if (config.position && f.positions.size > 0) return true;
  if (config.level && f.level !== 'all') return true;
  if (
    config.cost &&
    (f.cost !== 'all' ||
      parseDollars(f.minCost) !== null ||
      parseDollars(f.maxCost) !== null)
  )
    return true;
  if (config.date && (f.dateRange.start !== null || f.dateRange.end !== null))
    return true;
  if (config.time && (f.timeRange.start !== null || f.timeRange.end !== null))
    return true;
  return false;
}

// ---------- Player & facility result cards ----------

function DiscoverPlayerCard({
  player,
  onPress,
}: {
  player: DirectoryPlayer;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${player.name}, ${player.position}, ${player.city}, ${AVAILABILITY_LABEL[player.availability]}, ${capitalize(player.experience)}`}
      accessibilityHint="Opens their public profile"
      style={cardStyles.playerCard}
    >
      <Avatar uri={player.avatar} initials={player.name.charAt(0)} size={48} />
      <View style={cardStyles.playerBody}>
        <Text variant="button" color={colors.text.primary}>
          {player.name}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {player.position} · {player.city}
        </Text>
        <View style={cardStyles.playerTags}>
          <Tag
            tone={AVAILABILITY_TONE[player.availability]}
            size="sm"
            leadingDot
            label={AVAILABILITY_LABEL[player.availability]}
          />
          <Tag tone="brand" size="sm" label={capitalize(player.experience)} />
        </View>
      </View>
    </Pressable>
  );
}

function DiscoverFacilityCard({
  facility,
  onPress,
}: {
  facility: Facility;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${facility.name}, ${facility.city}, ${facility.distanceMiles} miles away, rated ${facility.rating.toFixed(1)} from ${facility.reviewCount} reviews, ${
        facility.hourlyRateCents === 0
          ? 'free'
          : `${formatCurrency(facility.hourlyRateCents)} per hour`
      }`}
      accessibilityHint="Opens facility details"
    >
      <Card style={cardStyles.facilityCard}>
        <Image
          source={{ uri: facility.cover }}
          style={cardStyles.facilityCover}
          contentFit="cover"
        />
        <View style={cardStyles.facilityBody}>
          <View style={cardStyles.facilityHead}>
            <Text
              variant="h3"
              color={colors.text.primary}
              style={cardStyles.flex1}
            >
              {facility.name}
            </Text>
            <View style={cardStyles.facilityRating}>
              <Star size={14} color="#B26200" strokeWidth={2.25} />
              <Text variant="caption" color={colors.text.secondary}>
                {facility.rating.toFixed(1)} ({facility.reviewCount})
              </Text>
            </View>
          </View>
          <View style={cardStyles.facilityMeta}>
            <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.secondary}>
              {facility.city} · {facility.distanceMiles} mi
            </Text>
          </View>
          <View style={cardStyles.facilityTags}>
            {facility.sports.slice(0, 3).map((s) => (
              <Tag key={s} tone="brand" size="sm" label={FACILITY_SPORT_LABEL[s]} />
            ))}
          </View>
          <View style={cardStyles.facilityPrice}>
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

// ---------- Screen ----------

export function DiscoverScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuthStore();
  // One watched card per view, leaving a clear peek of the next card so users
  // know the rail scrolls horizontally.
  const WATCH_PEEK = spacing.xxl * 2.5;
  const watchCardWidth = width - spacing.lg * 2 - WATCH_PEEK;
  const [content, setContent] = useState<ContentType>('games');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [shareLeague, setShareLeague] = useState<OpenLeague | null>(null);

  // Sheet visibility — each pill opens its own focused option list.
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [contentSheetOpen, setContentSheetOpen] = useState(false);
  const [sportSheetOpen, setSportSheetOpen] = useState(false);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [skillSheetOpen, setSkillSheetOpen] = useState(false);
  const [availabilitySheetOpen, setAvailabilitySheetOpen] = useState(false);
  const [experienceSheetOpen, setExperienceSheetOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [distanceSheetOpen, setDistanceSheetOpen] = useState(false);
  const [positionSheetOpen, setPositionSheetOpen] = useState(false);
  const [levelSheetOpen, setLevelSheetOpen] = useState(false);
  const [costSheetOpen, setCostSheetOpen] = useState(false);

  const config = CONTENT_CONFIG[content];
  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  // Seeded fixtures + games hosted through the wizard this session.
  const allGames = useDiscoverGames();
  // Seeded + session squads with membership overrides, mirroring Find a Team.
  const allSquads = useAllSquads();
  const membershipOverrides = useTeamMembershipStore((s) => s.overrides);
  const squads = useMemo(
    () =>
      allSquads.map((s) => {
        const override = membershipOverrides[s.id];
        return override ? { ...s, membership: override } : s;
      }),
    [allSquads, membershipOverrides],
  );

  const games = useMemo(() => filterGames(filters, allGames), [filters, allGames]);
  const camps = useMemo(() => filterCamps(filters), [filters]);
  const leagues = useMemo(() => filterLeagues(filters), [filters]);
  const teams = useMemo(() => filterTeams(filters, squads), [filters, squads]);
  const players = useMemo(() => filterPlayers(filters), [filters]);
  const facilities = useMemo(() => filterFacilities(filters), [filters]);

  // "Watching" rail — the games / teams the user is following, shown above the
  // results for the matching content type as a horizontal scroll (one per view)
  // with a View all link to the full watchlist.
  const watchedIds = useWatchStore((s) => s.watchedIds);
  const watchedTeamIds = useWatchStore((s) => s.watchedTeamIds);

  const watchedGames = useMemo(
    () => allGames.filter((g) => watchedIds.has(g.id)),
    [allGames, watchedIds],
  );
  const watchedTeams = useMemo(
    () => squads.filter((s) => watchedTeamIds.has(s.id)),
    [squads, watchedTeamIds],
  );

  const watchingItems =
    content === 'games'
      ? watchedGames
      : content === 'teams'
      ? watchedTeams
      : [];
  const showWatching = watchingItems.length > 0;

  const resultCount = ((): number => {
    switch (content) {
      case 'games':
        return games.length;
      case 'camps':
        return camps.length;
      case 'leagues':
        return leagues.length;
      case 'teams':
        return teams.length;
      case 'players':
        return players.length;
      case 'facilities':
        return facilities.length;
      default: {
        const _exhaustive: never = content;
        return _exhaustive;
      }
    }
  })();

  const selectedSportEntries = useMemo(
    () =>
      [...filters.sports]
        .map((k) => sportCatalogEntry(k))
        .filter((e): e is NonNullable<ReturnType<typeof sportCatalogEntry>> => !!e),
    [filters.sports],
  );

  // Roster positions to choose from = union across every selected sport. Empty
  // until a sport is picked, since positions are sport-specific (mirrors the
  // Teams / Player Directory pages).
  const positionOptions = useMemo<string[]>(() => {
    const allowed = resolveAllowedTeamSports(filters.sports);
    if (!allowed || allowed.size === 0) return [];
    const out: string[] = [];
    for (const teamSport of allowed) {
      for (const p of POSITIONS_BY_SPORT[teamSport]) {
        if (!out.includes(p)) out.push(p);
      }
    }
    return out;
  }, [filters.sports]);

  // Set sports and drop any position picks that no longer belong to a selected
  // sport, keeping the position filter coherent with the sport selection.
  const applySports = (next: Set<string>) =>
    setFilters((p) => {
      let positions = p.positions;
      if (positions.size > 0) {
        const valid = new Set<string>();
        for (const key of next) {
          const teamSport = catalogKeyToTeamSport(key);
          if (teamSport) {
            for (const pos of POSITIONS_BY_SPORT[teamSport]) valid.add(pos);
          }
        }
        const pruned = new Set([...positions].filter((pos) => valid.has(pos)));
        if (pruned.size !== positions.size) positions = pruned;
      }
      return { ...p, sports: next, positions };
    });

  const removeSport = (key: string) =>
    applySports(new Set([...filters.sports].filter((k) => k !== key)));

  const dateLabel = dateRangeLabel(filters.dateRange);

  const contentLabel =
    CONTENT_TYPE_OPTIONS.find((o) => o.key === content)?.label ?? 'Games';

  const noun = ((): string => {
    switch (content) {
      case 'games':
        return `${filters.status === 'closed' ? 'closed ' : 'open '}game`;
      case 'camps':
        return 'camp';
      case 'leagues':
        return 'league';
      case 'teams':
        return 'team';
      case 'players':
        return 'player';
      case 'facilities':
        return 'facility';
      default: {
        const _exhaustive: never = content;
        return _exhaustive;
      }
    }
  })();

  const sectionTitle = (() => {
    if (content === 'facilities') {
      return `${resultCount} ${resultCount === 1 ? 'facility' : 'facilities'}`;
    }
    return `${resultCount} ${noun}${resultCount === 1 ? '' : 's'}`;
  })();

  const emptyIcon = ((): React.ReactNode => {
    switch (content) {
      case 'games':
        return <SlidersHorizontal size={28} color={colors.brand.primary} strokeWidth={2.25} />;
      case 'camps':
        return <Tent size={28} color={colors.brand.primary} strokeWidth={2.25} />;
      case 'leagues':
        return <Trophy size={28} color={colors.brand.primary} strokeWidth={2.25} />;
      case 'teams':
        return <Users size={28} color={colors.brand.primary} strokeWidth={2.25} />;
      case 'players':
        return <UserPlus size={28} color={colors.brand.primary} strokeWidth={2.25} />;
      case 'facilities':
        return <MapPin size={28} color={colors.brand.primary} strokeWidth={2.25} />;
      default: {
        const _exhaustive: never = content;
        return _exhaustive;
      }
    }
  })();

  const resetFilters = () => setFilters(initialFilters);

  function renderResults() {
    switch (content) {
      case 'games':
        return games.map((game) => (
          <EventCard
            key={game.id}
            game={game}
            onPress={() => navigation.navigate('GameDetails', { id: game.id })}
            onJoinPress={() => navigation.navigate('GameDetails', { id: game.id })}
          />
        ));
      case 'camps':
        return camps.map((camp) => (
          <CampCard
            key={camp.id}
            camp={camp}
            onPress={() => navigation.navigate('CampDetails', { id: camp.id })}
            onRegisterPress={() =>
              navigation.navigate('CampDetails', { id: camp.id })
            }
          />
        ));
      case 'leagues':
        return leagues.map((league) => (
          <DiscoverLeagueCard
            key={league.id}
            league={league}
            onPress={() =>
              navigation.navigate('LeagueDetails', { leagueId: league.id })
            }
            onSharePress={() => setShareLeague(league)}
          />
        ));
      case 'teams':
        return teams.map((squad) => (
          <SquadCard
            key={squad.id}
            squad={squad}
            variant="discover"
            onPress={() => navigation.navigate('TeamDetails', { id: squad.id })}
            onApply={() => navigation.navigate('TeamDetails', { id: squad.id })}
          />
        ));
      case 'players':
        return players.map((player) => (
          <DiscoverPlayerCard
            key={player.id}
            player={player}
            onPress={() =>
              navigation.navigate('PlayerProfile', {
                // Directory IDs are prefixed `d-`; public profile IDs use the
                // canonical roster `p-` prefix.
                playerId: player.id.replace(/^d-/, 'p-'),
              })
            }
          />
        ));
      case 'facilities':
        return facilities.map((facility) => (
          <DiscoverFacilityCard
            key={facility.id}
            facility={facility}
            onPress={() =>
              navigation.navigate('FacilityDetails', { id: facility.id })
            }
          />
        ));
      default: {
        const _exhaustive: never = content;
        return _exhaustive;
      }
    }
  }

  return (
    <View style={styles.root}>
      <SearchHeader
        initials={initials}
        hasNotifications
        searchValue={filters.search}
        onSearchChange={(v) => setFilters((p) => ({ ...p, search: v }))}
        searchPlaceholder={SEARCH_PLACEHOLDER[content]}
        onFilterPress={() => setFilterSheetOpen(true)}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.pillRow}
        >
          <FilterPill
            label={`Type · ${contentLabel}`}
            onPress={() => setContentSheetOpen(true)}
            accessibilityLabel={`Content type filter, currently ${contentLabel}`}
          />

          {selectedSportEntries.map((entry) => (
            <FilterPill
              key={entry.key}
              label={entry.label}
              onPress={() => setSportSheetOpen(true)}
              onClose={() => removeSport(entry.key)}
              accessibilityLabel={`${entry.label} sport filter`}
            />
          ))}
          {selectedSportEntries.length === 0 ? (
            <FilterPill label="Sports · Any" onPress={() => setSportSheetOpen(true)} />
          ) : null}

          {config.status ? (
            <FilterPill
              label={`Status · ${statusLabel(filters.status)}`}
              onPress={() => setStatusSheetOpen(true)}
            />
          ) : null}

          {config.skill ? (
            <FilterPill
              label={
                filters.skill === 'all'
                  ? 'Skill · All'
                  : `Skill · ${SKILL_LABELS[filters.skill]}`
              }
              onPress={() => setSkillSheetOpen(true)}
            />
          ) : null}

          {config.availability ? (
            <FilterPill
              label={`Availability · ${AVAILABILITY_PILL_LABEL[filters.availability]}`}
              onPress={() => setAvailabilitySheetOpen(true)}
            />
          ) : null}

          {config.experience ? (
            <FilterPill
              label={experiencePillLabel(filters.experience)}
              onPress={() => setExperienceSheetOpen(true)}
            />
          ) : null}

          {config.position && positionOptions.length > 0 ? (
            <FilterPill
              label={positionPillLabel(filters.positions)}
              onPress={() => setPositionSheetOpen(true)}
            />
          ) : null}

          {config.level ? (
            <FilterPill
              label={`Level · ${LEVEL_LABEL[filters.level]}`}
              onPress={() => setLevelSheetOpen(true)}
            />
          ) : null}

          {config.cost ? (
            <FilterPill
              label={costPillLabel(filters)}
              onPress={() => setCostSheetOpen(true)}
            />
          ) : null}

          {config.date && dateLabel ? (
            <FilterPill
              label={dateLabel}
              onPress={() => setDateSheetOpen(true)}
              leading={
                <CalendarDays size={12} color={colors.brand.deep} strokeWidth={2.5} />
              }
            />
          ) : null}

          <FilterPill
            label={distancePillLabel(content, filters)}
            onPress={() => setDistanceSheetOpen(true)}
            leading={<MapPin size={12} color={colors.brand.deep} strokeWidth={2.5} />}
          />

          {hasNonDefaultFilters(filters, config) ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
              hitSlop={8}
              onPress={resetFilters}
              style={styles.clearBtn}
            >
              <Text variant="caption" color={colors.text.secondary}>
                Clear
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>

        {showWatching ? (
          <View style={styles.section}>
            <SectionHeader
              title="Watching"
              actionLabel={`View all (${watchingItems.length})`}
              onActionPress={() => navigation.navigate('Watchlist')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={watchCardWidth + spacing.md}
              snapToAlignment="start"
              contentContainerStyle={styles.watchRail}
            >
              {content === 'games'
                ? watchedGames.map((game) => (
                    <View key={game.id} style={{ width: watchCardWidth }}>
                      <EventCard
                        game={game}
                        onPress={() =>
                          navigation.navigate('GameDetails', { id: game.id })
                        }
                        onJoinPress={() =>
                          navigation.navigate('GameDetails', { id: game.id })
                        }
                      />
                    </View>
                  ))
                : null}
              {content === 'teams'
                ? watchedTeams.map((squad) => (
                    <View key={squad.id} style={{ width: watchCardWidth }}>
                      <SquadCard
                        squad={squad}
                        variant="discover"
                        onPress={() =>
                          navigation.navigate('TeamDetails', { id: squad.id })
                        }
                        onApply={() =>
                          navigation.navigate('TeamDetails', { id: squad.id })
                        }
                      />
                    </View>
                  ))
                : null}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title={sectionTitle} />
          {resultCount === 0 ? (
            <EmptyState
              icon={emptyIcon}
              title={`No ${
                content === 'facilities' ? 'facilities' : `${noun}s`
              } match your filters`}
              description={
                content === 'games'
                  ? 'Try expanding the date range, distance, or skill.'
                  : 'Try a different sport, widen the distance, or clear filters.'
              }
              primaryAction={
                content === 'games'
                  ? {
                      label: 'Host a scrimmage',
                      onPress: () => navigation.navigate('CreateGame'),
                    }
                  : { label: 'Reset filters', onPress: resetFilters }
              }
              secondaryAction={
                content === 'games'
                  ? { label: 'Reset filters', onPress: resetFilters }
                  : undefined
              }
            />
          ) : (
            <View style={styles.cardsColumn}>{renderResults()}</View>
          )}
        </View>
      </ScrollView>

      {content === 'games' ? (
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
      ) : null}

      {/* ---------- Full filter sheet (hamburger) ---------- */}
      <BottomSheet
        visible={filterSheetOpen}
        onRequestClose={() => setFilterSheetOpen(false)}
        title="Filters"
        snapPoints={['92%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Show
            </Text>
            <Tabs
              variant="pill"
              scrollable
              items={CONTENT_TYPE_OPTIONS.map((c) => ({ key: c.key, label: c.label }))}
              value={content}
              onChange={(k) => setContent(k as ContentType)}
            />
          </View>

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
              onChange={applySports}
              placeholder="Search sports (e.g. pickleball, futsal)…"
              scrollResults={false}
              maxVisibleResults={6}
            />
          </View>

          {config.position && positionOptions.length > 0 ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Position
              </Text>
              <SearchMultiSelect
                value={filters.positions}
                onChange={(positions) => setFilters((p) => ({ ...p, positions }))}
                options={positionOptions}
                placeholder="Search positions…"
                emptyText="No positions match that search."
              />
            </View>
          ) : null}

          {config.level ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Level
              </Text>
              <Tabs
                variant="segmented"
                items={LEVEL_OPTIONS.map((l) => ({ key: l.key, label: l.label }))}
                value={filters.level}
                onChange={(k) => setFilters((p) => ({ ...p, level: k as LevelFilter }))}
              />
            </View>
          ) : null}

          {config.cost ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Cost
              </Text>
              <Tabs
                variant="segmented"
                items={COST_OPTIONS.map((c) => ({ key: c.key, label: c.label }))}
                value={filters.cost}
                onChange={(k) => setFilters((p) => ({ ...p, cost: k as CostFilter }))}
              />
              {filters.cost !== 'free' ? (
                <View style={styles.costRow}>
                  <Input
                    variant="number"
                    size="sm"
                    label="Min $ / player"
                    placeholder="0"
                    value={filters.minCost}
                    onChangeText={(minCost) =>
                      setFilters((p) => ({ ...p, minCost }))
                    }
                    leadingIcon={
                      <Text variant="body" color={colors.text.secondary}>
                        $
                      </Text>
                    }
                    containerStyle={styles.flex1}
                  />
                  <Input
                    variant="number"
                    size="sm"
                    label="Max $ / player"
                    placeholder="Any"
                    value={filters.maxCost}
                    onChangeText={(maxCost) =>
                      setFilters((p) => ({ ...p, maxCost }))
                    }
                    leadingIcon={
                      <Text variant="body" color={colors.text.secondary}>
                        $
                      </Text>
                    }
                    containerStyle={styles.flex1}
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          {config.availability ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Availability
              </Text>
              <Tabs
                variant="segmented"
                items={AVAILABILITY_OPTIONS.map((a) => ({ key: a.key, label: a.label }))}
                value={filters.availability}
                onChange={(k) =>
                  setFilters((p) => ({ ...p, availability: k as AvailabilityFilter }))
                }
              />
            </View>
          ) : null}

          {config.experience ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Experience
              </Text>
              <SearchMultiSelect
                value={filters.experience}
                onChange={(experience) => setFilters((p) => ({ ...p, experience }))}
                options={EXPERIENCE_OPTIONS}
                placeholder="Search experience levels…"
                emptyText="No levels match that search."
              />
            </View>
          ) : null}

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
              onPress={resetFilters}
              fullWidth
            />
            <Button
              label={
                resultCount === 0
                  ? 'No matches'
                  : `Show ${resultCount} result${resultCount === 1 ? '' : 's'}`
              }
              variant="gradient"
              onPress={() => setFilterSheetOpen(false)}
              fullWidth
            />
          </View>
        </ScrollView>
      </BottomSheet>

      {/* ---------- Per-pill option sheets ---------- */}
      <OptionListSheet
        visible={contentSheetOpen}
        onRequestClose={() => setContentSheetOpen(false)}
        title="Show"
        options={CONTENT_TYPE_OPTIONS}
        selectedKey={content}
        onSelect={(key) => setContent(key as ContentType)}
      />

      <OptionListSheet
        visible={statusSheetOpen}
        onRequestClose={() => setStatusSheetOpen(false)}
        title="Status"
        options={OPEN_STATUS_FILTERS}
        selectedKey={filters.status}
        onSelect={(key) =>
          setFilters((p) => ({ ...p, status: key as OpenStatusFilter }))
        }
      />

      <OptionListSheet
        visible={skillSheetOpen}
        onRequestClose={() => setSkillSheetOpen(false)}
        title="Skill level"
        options={(Object.keys(SKILL_LABELS) as GameSkillLevel[]).map((k) => ({
          key: k,
          label: SKILL_LABELS[k],
        }))}
        selectedKey={filters.skill}
        onSelect={(key) =>
          setFilters((p) => ({ ...p, skill: key as GameSkillLevel }))
        }
      />

      <OptionListSheet
        visible={availabilitySheetOpen}
        onRequestClose={() => setAvailabilitySheetOpen(false)}
        title="Availability"
        options={AVAILABILITY_OPTIONS}
        selectedKey={filters.availability}
        onSelect={(key) =>
          setFilters((p) => ({ ...p, availability: key as AvailabilityFilter }))
        }
      />

      <OptionListSheet
        visible={experienceSheetOpen}
        onRequestClose={() => setExperienceSheetOpen(false)}
        title="Experience"
        multiple
        options={EXPERIENCE_OPTIONS.map((label) => ({ key: label, label }))}
        selectedKeys={filters.experience}
        onApply={(experience) => setFilters((p) => ({ ...p, experience }))}
      />

      <OptionListSheet
        visible={positionSheetOpen}
        onRequestClose={() => setPositionSheetOpen(false)}
        title="Position"
        multiple
        options={positionOptions.map((label) => ({ key: label, label }))}
        selectedKeys={filters.positions}
        onApply={(positions) => setFilters((p) => ({ ...p, positions }))}
      />

      <OptionListSheet
        visible={levelSheetOpen}
        onRequestClose={() => setLevelSheetOpen(false)}
        title="Level"
        options={LEVEL_OPTIONS}
        selectedKey={filters.level}
        onSelect={(key) =>
          setFilters((p) => ({ ...p, level: key as LevelFilter }))
        }
      />

      {/* ---------- Sport multi-select ---------- */}
      <SportMultiSelectSheet
        visible={sportSheetOpen}
        onRequestClose={() => setSportSheetOpen(false)}
        value={filters.sports}
        onApply={applySports}
      />

      {/* ---------- Date range sheet ---------- */}
      <BottomSheet
        visible={dateSheetOpen}
        onRequestClose={() => setDateSheetOpen(false)}
        title="Date & time"
        snapPoints={['70%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
          <View style={styles.sheetActions}>
            <Button
              label="Clear dates"
              variant="ghost"
              fullWidth
              onPress={() =>
                setFilters((p) => ({
                  ...p,
                  dateRange: { start: null, end: null },
                  timeRange: { start: null, end: null },
                }))
              }
            />
            <Button
              label="Done"
              variant="gradient"
              fullWidth
              onPress={() => setDateSheetOpen(false)}
            />
          </View>
        </ScrollView>
      </BottomSheet>

      {/* ---------- Distance sheet ---------- */}
      <BottomSheet
        visible={distanceSheetOpen}
        onRequestClose={() => setDistanceSheetOpen(false)}
        title="Location & radius"
        snapPoints={['70%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetGroup}>
            <RadiusMapPicker
              center={filters.center}
              onChangeCenter={(center) => setFilters((p) => ({ ...p, center }))}
              radiusMiles={filters.radiusMiles}
              onChangeRadius={(radiusMiles) =>
                setFilters((p) => ({ ...p, radiusMiles }))
              }
            />
          </View>
          <View style={styles.sheetActions}>
            <Button
              label="Clear"
              variant="ghost"
              fullWidth
              onPress={() =>
                setFilters((p) => ({
                  ...p,
                  center: null,
                  radiusMiles: DEFAULT_RADIUS,
                }))
              }
            />
            <Button
              label="Done"
              variant="gradient"
              fullWidth
              onPress={() => setDistanceSheetOpen(false)}
            />
          </View>
        </ScrollView>
      </BottomSheet>

      {/* ---------- Cost sheet ---------- */}
      <BottomSheet
        visible={costSheetOpen}
        onRequestClose={() => setCostSheetOpen(false)}
        title="Cost"
        snapPoints={['60%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetGroup}>
            <Tabs
              variant="segmented"
              items={COST_OPTIONS.map((c) => ({ key: c.key, label: c.label }))}
              value={filters.cost}
              onChange={(k) => setFilters((p) => ({ ...p, cost: k as CostFilter }))}
            />
            {filters.cost !== 'free' ? (
              <View style={styles.costRow}>
                <Input
                  variant="number"
                  size="sm"
                  label="Min $ / player"
                  placeholder="0"
                  value={filters.minCost}
                  onChangeText={(minCost) =>
                    setFilters((p) => ({ ...p, minCost }))
                  }
                  leadingIcon={
                    <Text variant="body" color={colors.text.secondary}>
                      $
                    </Text>
                  }
                  containerStyle={styles.flex1}
                />
                <Input
                  variant="number"
                  size="sm"
                  label="Max $ / player"
                  placeholder="Any"
                  value={filters.maxCost}
                  onChangeText={(maxCost) =>
                    setFilters((p) => ({ ...p, maxCost }))
                  }
                  leadingIcon={
                    <Text variant="body" color={colors.text.secondary}>
                      $
                    </Text>
                  }
                  containerStyle={styles.flex1}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.sheetActions}>
            <Button
              label="Clear"
              variant="ghost"
              fullWidth
              onPress={() =>
                setFilters((p) => ({
                  ...p,
                  cost: 'all',
                  minCost: '',
                  maxCost: '',
                }))
              }
            />
            <Button
              label="Done"
              variant="gradient"
              fullWidth
              onPress={() => setCostSheetOpen(false)}
            />
          </View>
        </ScrollView>
      </BottomSheet>

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
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.lg,
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
  watchRail: {
    flexDirection: 'row',
    gap: spacing.md,
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
  costRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
});

const cardStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  playerBody: {
    flex: 1,
    gap: 4,
  },
  playerTags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  facilityCard: {
    padding: 0,
    overflow: 'hidden',
  },
  facilityCover: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface.chip,
  },
  facilityBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  facilityHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  facilityRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  facilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  facilityTags: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  facilityPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
