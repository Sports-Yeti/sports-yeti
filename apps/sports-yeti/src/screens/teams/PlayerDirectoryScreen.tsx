import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, MapPin, MessageCircle, UserPlus } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  BottomSheet,
  Button,
  EmptyState,
  FilterPill,
  RadiusMapPicker,
  type RadiusCenter,
  SearchBar,
  SearchMultiSelect,
  SportCombobox,
  SportMultiSelectSheet,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  DIRECTORY_PLAYERS,
  POSITIONS_BY_SPORT,
  CITY_COORDS,
  type DirectoryPlayer,
} from '../../mocks/teams';
import { sportCatalogEntry } from '../../mocks/games';
import { DEFAULT_MAP_CENTER, distanceMilesBetween } from '../../mocks/facilities';
import { dmChatIdForPlayer } from '../../mocks/messages';
import {
  catalogKeyToTeamSport,
  resolveAllowedTeamSports,
} from '../../lib/sport-filter';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type AvailabilityFilter = 'all' | DirectoryPlayer['availability'];

const AVAILABILITY_CHIPS: { key: AvailabilityFilter; label: string }[] = [
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

// Experience filter reuses the searchable multi-select, so options are the
// capitalized labels that match `capitalize(player.experience)`.
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];

const DEFAULT_RADIUS = 25;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

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

function PlayerCard({
  player,
  onInvite,
  onMessage,
  onOpenProfile,
  invited,
}: {
  player: DirectoryPlayer;
  onInvite: () => void;
  onMessage: () => void;
  onOpenProfile: () => void;
  invited: boolean;
}) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={onOpenProfile}
        accessibilityRole="button"
        accessibilityLabel={`View ${player.name}'s profile`}
        accessibilityHint="Opens their public profile with stats per sport"
        hitSlop={6}
        style={styles.cardLead}
      >
        <Avatar uri={player.avatar} initials={player.name.charAt(0)} size={48} />
        <View style={styles.cardBody}>
          <Text variant="button" color={colors.text.primary}>
            {player.name}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {player.position} · {player.city}
          </Text>
          <View style={styles.cardTags}>
            <Tag
              tone={AVAILABILITY_TONE[player.availability]}
              size="sm"
              leadingDot
              label={AVAILABILITY_LABEL[player.availability]}
            />
            <Tag
              tone="brand"
              size="sm"
              label={player.experience.charAt(0).toUpperCase() + player.experience.slice(1)}
            />
          </View>
        </View>
      </Pressable>
      <View style={styles.cardActions}>
        <Pressable
          onPress={onMessage}
          accessibilityRole="button"
          accessibilityLabel={`Message ${player.name}`}
          hitSlop={6}
          style={styles.iconBtn}
        >
          <MessageCircle size={18} color={colors.brand.primary} strokeWidth={2.25} />
        </Pressable>
        <Button
          label={invited ? 'Invited' : 'Invite'}
          variant={invited ? 'soft' : 'gradient'}
          size="sm"
          onPress={onInvite}
          disabled={invited}
        />
      </View>
    </View>
  );
}

export function PlayerDirectoryScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [search, setSearch] = useState('');
  /** Multi-select sport keys from `SPORT_CATALOG`. Empty = match all sports. */
  const [sports, setSports] = useState<Set<string>>(new Set<string>());
  /** Multi-select roster positions. Empty = any position. */
  const [positions, setPositions] = useState<Set<string>>(new Set<string>());
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  /** Multi-select experience labels (capitalized). Empty = any level. */
  const [experience, setExperience] = useState<Set<string>>(new Set<string>());
  const [center, setCenter] = useState<RadiusCenter | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sportSheetOpen, setSportSheetOpen] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const selectedSportEntries = useMemo(
    () =>
      [...sports]
        .map((k) => sportCatalogEntry(k))
        .filter((e): e is NonNullable<ReturnType<typeof sportCatalogEntry>> => !!e),
    [sports],
  );

  const allowedTeamSports = useMemo(
    () => resolveAllowedTeamSports(sports),
    [sports],
  );

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

  // Radius only filters once the user pins a center, since players span
  // far-flung cities — applying a default radius would hide most of them.
  const radiusActive = center !== null;
  const radiusCenter = useMemo<RadiusCenter>(
    () => center ?? { ...DEFAULT_MAP_CENTER, label: 'Default area' },
    [center],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const lowerPositions = new Set([...positions].map((p) => p.toLowerCase()));
    return DIRECTORY_PLAYERS.filter((p) => {
      if (allowedTeamSports && !allowedTeamSports.has(p.sportKey)) return false;
      if (availability !== 'all' && p.availability !== availability) return false;
      if (experience.size > 0 && !experience.has(capitalize(p.experience)))
        return false;
      if (lowerPositions.size > 0 && !lowerPositions.has(p.position.toLowerCase()))
        return false;
      if (radiusActive) {
        const coords = CITY_COORDS[p.city];
        if (coords && distanceMilesBetween(radiusCenter, coords) > radiusMiles) {
          return false;
        }
      }
      if (q) {
        const hay = `${p.name} ${p.handle} ${p.position} ${p.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    search,
    allowedTeamSports,
    availability,
    experience,
    positions,
    radiusActive,
    radiusCenter,
    radiusMiles,
  ]);

  const hasActiveFilters =
    sports.size > 0 ||
    positions.size > 0 ||
    availability !== 'all' ||
    experience.size > 0 ||
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
    setAvailability('all');
    setExperience(new Set<string>());
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

  const experiencePillLabel = (() => {
    if (experience.size === 0) return 'Experience · Any';
    if (experience.size === 1) {
      const [only] = experience;
      return only ?? 'Experience · Any';
    }
    return `${experience.size} levels`;
  })();

  const distancePillLabel = radiusActive
    ? `${radiusMiles} mi · ${radiusCenter.label}`
    : 'Distance · Any';

  const handleInvite = (player: DirectoryPlayer) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setInvitedIds((prev) => new Set(prev).add(player.id));
    toast.show({
      variant: 'success',
      title: `Invited ${player.name}`,
      description: 'They got an in-app notification.',
      action: {
        label: 'Undo',
        onPress: () =>
          setInvitedIds((prev) => {
            const next = new Set(prev);
            next.delete(player.id);
            return next;
          }),
      },
    });
  };

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
          Player Directory
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.filtersBlock}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, position, or city…"
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
            label={`Availability · ${AVAILABILITY_PILL_LABEL[availability]}`}
            onPress={() => setFilterOpen(true)}
          />
          <FilterPill
            label={experiencePillLabel}
            onPress={() => setFilterOpen(true)}
          />
          <FilterPill
            label={distancePillLabel}
            onPress={() => setFilterOpen(true)}
            leading={
              <MapPin size={12} color={colors.brand.deep} strokeWidth={2.5} />
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
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <UserPlus
                size={28}
                color={colors.brand.primary}
                strokeWidth={2.25}
              />
            }
            title="No players match"
            description={
              hasActiveFilters
                ? 'Try widening sport, availability, experience, or distance.'
                : 'No players in the directory yet — share your team link to recruit.'
            }
            primaryAction={
              hasActiveFilters
                ? { label: 'Reset filters', onPress: resetFilters }
                : {
                    label: 'Share team link',
                    onPress: () =>
                      toast.show({ variant: 'info', title: 'Team link copied' }),
                  }
            }
          />
        ) : (
          filtered.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              invited={invitedIds.has(p.id)}
              onInvite={() => handleInvite(p)}
              onMessage={() =>
                navigation.navigate('Chat', {
                  // Canonical per-player DM id (directory `d-` prefix maps
                  // to the roster `p-` prefix) so the same person opens
                  // the same conversation from every entry point.
                  chatId: dmChatIdForPlayer(p.id.replace(/^d-/, 'p-')),
                  title: p.name,
                  avatar: p.avatar,
                })
              }
              onOpenProfile={() =>
                navigation.navigate('PlayerProfile', {
                  // Directory IDs are prefixed `d-`; public profile IDs use
                  // the canonical roster `p-` prefix.
                  playerId: p.id.replace(/^d-/, 'p-'),
                })
              }
            />
          ))
        )}
      </ScrollView>

      <BottomSheet
        visible={filterOpen}
        onRequestClose={() => setFilterOpen(false)}
        title="Filter players"
        snapPoints={['88%']}
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
              Availability
            </Text>
            <Tabs
              variant="segmented"
              items={AVAILABILITY_CHIPS.map((a) => ({ key: a.key, label: a.label }))}
              value={availability}
              onChange={(k) => setAvailability(k as AvailabilityFilter)}
            />
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Experience
            </Text>
            <SearchMultiSelect
              value={experience}
              onChange={setExperience}
              options={EXPERIENCE_OPTIONS}
              placeholder="Search experience levels…"
              emptyText="No levels match that search."
            />
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
                filtered.length === 0
                  ? 'No matches'
                  : `Show ${filtered.length} player${filtered.length === 1 ? '' : 's'}`
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
  filtersBlock: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sheetContent: {
    gap: spacing.xl,
    paddingBottom: spacing.xl,
  },
  sheetGroup: {
    gap: spacing.md,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  cardLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
