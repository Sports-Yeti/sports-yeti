import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Plus, Users } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  EmptyState,
  FilterPill,
  Input,
  RadiusMapPicker,
  type RadiusCenter,
  ScreenHeader,
  SearchBar,
  SearchMultiSelect,
  SectionHeader,
  SportCombobox,
  SportMultiSelectSheet,
  Tabs,
  Text,
  useToast,
} from '../../ui';
import { SquadCard } from '../../components/SquadCard';
import { sportCatalogEntry } from '../../mocks/games';
import { DEFAULT_MAP_CENTER, distanceMilesBetween } from '../../mocks/facilities';
import {
  POSITIONS_BY_SPORT,
  SQUADS,
  TEAM_DETAILS,
  type CostMode,
  type SportKey,
  type Squad,
} from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'mine' | 'discover';
type LevelFilter = 'all' | 'INTERMEDIATE' | 'ADVANCED' | 'RECREATIONAL';
type CostFilter = 'all' | CostMode;

const TABS: { key: Tab; label: string }[] = [
  { key: 'mine', label: 'My Teams' },
  { key: 'discover', label: 'Find a Team' },
];

const LEVEL_CHIPS: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: 'All levels' },
  { key: 'RECREATIONAL', label: 'Recreational' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

const COST_CHIPS: { key: CostFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

const LEVEL_LABEL: Record<LevelFilter, string> = {
  all: 'All levels',
  RECREATIONAL: 'Recreational',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const COST_LABEL: Record<CostFilter, string> = {
  all: 'Any',
  free: 'Free',
  paid: 'Paid',
};

const DEFAULT_RADIUS = 25;

/** Parse a dollar string to a number, or null when blank / invalid. */
function parseDollars(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Catalogue entries from `SPORT_CATALOG` bucket back to the concrete sport
// keys used by Discover, which don't include hockey. Map the hockey-family
// entries explicitly so hockey teams still match the shared sport filter.
const TEAM_SPORT_BY_CATALOG_KEY: Record<string, SportKey> = {
  'ice-hockey': 'hockey',
  'roller-hockey': 'hockey',
  'field-hockey': 'hockey',
};

function catalogKeyToTeamSport(key: string): SportKey | null {
  const mapped = TEAM_SPORT_BY_CATALOG_KEY[key];
  if (mapped) return mapped;
  const bucket = sportCatalogEntry(key)?.bucket;
  return (bucket as SportKey | null) ?? null;
}

function deriveChatLocked(squadId: string): boolean {
  const team = TEAM_DETAILS[squadId];
  if (!team) return false;
  if (team.costMode === 'free') return false;
  if (team.membership !== 'member' && team.membership !== 'captain') return false;
  return team.hasUnpaidShare;
}

export function SquadsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('mine');
  const [search, setSearch] = useState('');
  /** Multi-select sport keys from `SPORT_CATALOG`. Empty = match all sports. */
  const [sports, setSports] = useState<Set<string>>(new Set<string>());
  /** Multi-select roster positions. Empty = any position. */
  const [positions, setPositions] = useState<Set<string>>(new Set<string>());
  const [level, setLevel] = useState<LevelFilter>('all');
  const [cost, setCost] = useState<CostFilter>('all');
  const [minCost, setMinCost] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [center, setCenter] = useState<RadiusCenter | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sportSheetOpen, setSportSheetOpen] = useState(false);

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  const myTeams = useMemo(
    () => SQUADS.filter((s) => s.membership !== 'none'),
    [],
  );

  const selectedSportEntries = useMemo(
    () =>
      [...sports]
        .map((k) => sportCatalogEntry(k))
        .filter((e): e is NonNullable<ReturnType<typeof sportCatalogEntry>> => !!e),
    [sports],
  );

  // Resolve the selected catalogue entries down to the concrete team sport
  // keys we can match against. `null` means "any sport".
  const allowedTeamSports = useMemo<Set<SportKey> | null>(() => {
    if (sports.size === 0) return null;
    const set = new Set<SportKey>();
    for (const key of sports) {
      const teamSport = catalogKeyToTeamSport(key);
      if (teamSport) set.add(teamSport);
    }
    return set;
  }, [sports]);

  // Positions to choose from = union across every selected sport. Empty until
  // a sport is picked, since positions are sport-specific.
  const positionOptions = useMemo<string[]>(() => {
    if (!allowedTeamSports || allowedTeamSports.size === 0) return [];
    const out: string[] = [];
    for (const teamSport of allowedTeamSports) {
      for (const p of POSITIONS_BY_SPORT[teamSport]) {
        if (!out.includes(p)) out.push(p);
      }
    }
    return out;
  }, [allowedTeamSports]);

  const minDollars = parseDollars(minCost);
  const maxDollars = parseDollars(maxCost);
  // Radius only filters once the user pins a center, since teams span far-flung
  // cities — applying a default radius would hide most of them.
  const radiusActive = center !== null;
  const radiusCenter = useMemo<RadiusCenter>(
    () => center ?? { ...DEFAULT_MAP_CENTER, label: 'Default area' },
    [center],
  );

  const discoverable = useMemo(() => {
    const q = search.trim().toLowerCase();
    const lowerPositions = new Set([...positions].map((p) => p.toLowerCase()));
    return SQUADS.filter((s: Squad) => {
      // Hide full rosters from discovery so players don't apply for nothing.
      if (s.rosterCount >= s.rosterMax) return false;
      // Don't surface teams the user is already on.
      if (s.membership === 'member' || s.membership === 'captain') return false;
      if (allowedTeamSports && !allowedTeamSports.has(s.sportKey)) return false;
      if (level !== 'all' && s.level !== level) return false;
      if (cost !== 'all' && s.costMode !== cost) return false;
      // Min/max per-player cost (ignored for the free-only filter).
      if (cost !== 'free') {
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
      if (radiusActive) {
        if (distanceMilesBetween(radiusCenter, s.coords) > radiusMiles) {
          return false;
        }
      }
      if (q) {
        const needsHay = s.needs.map((n) => n.label).join(' ');
        const hay = `${s.name} ${s.location} ${s.sport} ${needsHay}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    search,
    allowedTeamSports,
    level,
    cost,
    positions,
    minDollars,
    maxDollars,
    radiusActive,
    radiusCenter,
    radiusMiles,
  ]);

  const visibleList = tab === 'mine' ? myTeams : discoverable;

  const hasActiveFilters =
    sports.size > 0 ||
    positions.size > 0 ||
    level !== 'all' ||
    cost !== 'all' ||
    minDollars !== null ||
    maxDollars !== null ||
    radiusActive;

  const setSportsAndSyncPositions = (next: Set<string>) => {
    setSports(next);
    // Drop position picks that no longer belong to any selected sport.
    setPositions((prev) => {
      if (prev.size === 0) return prev;
      const valid = new Set<string>();
      for (const key of next) {
        const teamSport = catalogKeyToTeamSport(key);
        if (teamSport) {
          for (const p of POSITIONS_BY_SPORT[teamSport]) valid.add(p);
        }
      }
      const pruned = new Set([...prev].filter((p) => valid.has(p)));
      return pruned.size === prev.size ? prev : pruned;
    });
  };

  const removeSport = (key: string) =>
    setSportsAndSyncPositions(new Set([...sports].filter((k) => k !== key)));

  const resetFilters = () => {
    setSearch('');
    setSports(new Set<string>());
    setPositions(new Set<string>());
    setLevel('all');
    setCost('all');
    setMinCost('');
    setMaxCost('');
    setCenter(null);
    setRadiusMiles(DEFAULT_RADIUS);
  };

  const positionPillLabel = (() => {
    if (positions.size === 0) return 'Position · Any';
    if (positions.size === 1) {
      const [only] = positions;
      return only ?? 'Position · Any';
    }
    return `${positions.size} positions`;
  })();

  const costPillLabel = (() => {
    if (cost === 'free') return 'Cost · Free';
    if (minDollars !== null && maxDollars !== null)
      return `Cost · $${minDollars}–$${maxDollars}`;
    if (minDollars !== null) return `Cost · ≥$${minDollars}`;
    if (maxDollars !== null) return `Cost · ≤$${maxDollars}`;
    return `Cost · ${COST_LABEL[cost]}`;
  })();

  const distancePillLabel = radiusActive
    ? `${radiusMiles} mi · ${radiusCenter.label}`
    : 'Distance · Any';

  const sectionTitle =
    tab === 'mine'
      ? `${myTeams.length} team${myTeams.length === 1 ? '' : 's'} you're on`
      : `${discoverable.length} team${discoverable.length === 1 ? '' : 's'} recruiting`;

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
        <Tabs
          variant="segmented"
          items={TABS}
          value={tab}
          onChange={(k) => setTab(k as Tab)}
        />

        {tab === 'discover' ? (
          <>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search teams, sports, positions…"
              onFilterPress={() => setFilterOpen(true)}
            />

            <View style={styles.pillRow}>
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
                <FilterPill
                  label="Sports · Any"
                  onPress={() => setSportSheetOpen(true)}
                />
              ) : null}
              {positionOptions.length > 0 ? (
                <FilterPill
                  label={positionPillLabel}
                  onPress={() => setFilterOpen(true)}
                />
              ) : null}
              <FilterPill
                label={`Level · ${LEVEL_LABEL[level]}`}
                onPress={() => setFilterOpen(true)}
              />
              <FilterPill
                label={costPillLabel}
                onPress={() => setFilterOpen(true)}
              />
              <FilterPill
                label={distancePillLabel}
                onPress={() => setFilterOpen(true)}
                leading={
                  <MapPin
                    size={12}
                    color={colors.brand.deep}
                    strokeWidth={2.5}
                  />
                }
              />
              {hasActiveFilters ? (
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
            </View>
          </>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title={sectionTitle}
            actionLabel={tab === 'mine' ? 'Find a team' : 'Browse leagues'}
            onActionPress={() => {
              if (tab === 'mine') setTab('discover');
              else navigation.navigate('LeagueBrowse');
            }}
          />
          {visibleList.length === 0 ? (
            tab === 'mine' ? (
              <EmptyState
                icon={
                  <Users size={28} color={colors.brand.primary} strokeWidth={2.25} />
                }
                title="You're not on any teams yet"
                description="Browse teams looking for your position — or start your own squad."
                primaryAction={{
                  label: 'Find a team',
                  onPress: () => setTab('discover'),
                }}
                secondaryAction={{
                  label: 'Start a squad',
                  onPress: () => navigation.navigate('TeamCreate'),
                }}
              />
            ) : (
              <EmptyState
                icon={
                  <Users size={28} color={colors.brand.primary} strokeWidth={2.25} />
                }
                title="No teams match"
                description="Try widening your filters — or get notified when a roster opens."
                primaryAction={{
                  label: 'Reset filters',
                  onPress: resetFilters,
                }}
                secondaryAction={{
                  label: 'Notify me',
                  onPress: () =>
                    toast.show({
                      variant: 'success',
                      title: "We'll ping you",
                      description: "You'll get a push when a matching roster opens.",
                    }),
                }}
              />
            )
          ) : (
            <View style={styles.cardsColumn}>
              {visibleList.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  variant={tab === 'mine' ? 'mine' : 'discover'}
                  chatLocked={deriveChatLocked(squad.id)}
                  onPress={() =>
                    navigation.navigate('TeamDetails', { id: squad.id })
                  }
                  onApply={() => {
                    toast.show({
                      variant: 'success',
                      title: `Applied to ${squad.name}`,
                      description:
                        squad.costMode === 'paid'
                          ? `Captain reviews within 48h. You'll pay $${(squad.perPlayerCents / 100).toFixed(0)} once accepted.`
                          : 'The captain will respond within 48 hours.',
                    });
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start a casual squad"
        onPress={() => navigation.navigate('TeamCreate')}
        style={[styles.fab, shadows.card, { bottom: insets.bottom + 110 }]}
      >
        <Plus size={20} color={colors.text.inverse} strokeWidth={2.5} />
        <Text variant="button" color={colors.text.inverse}>
          New squad
        </Text>
      </Pressable>

      <BottomSheet
        visible={filterOpen}
        onRequestClose={() => setFilterOpen(false)}
        title="Filter teams"
        snapPoints={['86%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Sports
            </Text>
            <SportCombobox
              value={sports}
              onChange={setSportsAndSyncPositions}
              placeholder="Search sports (e.g. soccer, hockey)…"
              scrollResults={false}
              maxVisibleResults={6}
            />
          </View>

          {positionOptions.length > 0 ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Position
              </Text>
              <SearchMultiSelect
                value={positions}
                onChange={setPositions}
                options={positionOptions}
                placeholder="Search positions…"
                emptyText="No positions match that search."
              />
            </View>
          ) : null}

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Level
            </Text>
            <Tabs
              variant="segmented"
              items={LEVEL_CHIPS.map((l) => ({ key: l.key, label: l.label }))}
              value={level}
              onChange={(k) => setLevel(k as LevelFilter)}
            />
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Cost
            </Text>
            <Tabs
              variant="segmented"
              items={COST_CHIPS.map((c) => ({ key: c.key, label: c.label }))}
              value={cost}
              onChange={(k) => setCost(k as CostFilter)}
            />
            {cost !== 'free' ? (
              <View style={styles.costRow}>
                <Input
                  variant="number"
                  size="sm"
                  label="Min $ / player"
                  placeholder="0"
                  value={minCost}
                  onChangeText={setMinCost}
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
                  value={maxCost}
                  onChangeText={setMaxCost}
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

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Location & radius
            </Text>
            <RadiusMapPicker
              center={center}
              onChangeCenter={setCenter}
              radiusMiles={radiusMiles}
              onChangeRadius={setRadiusMiles}
            />
          </View>

          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="ghost"
              fullWidth
              onPress={resetFilters}
            />
            <Button
              label={
                discoverable.length === 0
                  ? 'No matches'
                  : `Show ${discoverable.length} team${
                      discoverable.length === 1 ? '' : 's'
                    }`
              }
              variant="gradient"
              fullWidth
              onPress={() => setFilterOpen(false)}
            />
          </View>
        </ScrollView>
      </BottomSheet>

      <SportMultiSelectSheet
        visible={sportSheetOpen}
        onRequestClose={() => setSportSheetOpen(false)}
        value={sports}
        onApply={setSportsAndSyncPositions}
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
    paddingTop: spacing.xxl,
    gap: spacing.xxl,
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
    paddingBottom: spacing.xl,
  },
  sheetGroup: {
    gap: spacing.md,
  },
  costRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
