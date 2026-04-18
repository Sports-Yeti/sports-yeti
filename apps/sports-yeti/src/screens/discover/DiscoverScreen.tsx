import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, SlidersHorizontal } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  ScreenHeader,
  SearchBar,
  SectionHeader,
  Tabs,
  Tag,
  Text,
} from '../../ui';
import { EventCard } from '../../components/EventCard';
import {
  DISCOVER_GAMES,
  DISTANCE_FILTERS,
  SKILL_LABELS,
  SPORT_FILTERS,
  TIME_BUCKET_FILTERS,
  type DiscoverGame,
  type GameSkillLevel,
  type GameTimeBucket,
  type SportKey,
} from '../../mocks/games';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface FilterState {
  sport: SportKey;
  search: string;
  time: GameTimeBucket | 'any';
  distance: number;
  skill: GameSkillLevel;
}

const INITIAL_FILTERS: FilterState = {
  sport: 'allSports',
  search: '',
  time: 'any',
  distance: 100,
  skill: 'all',
};

function applyFilters(games: DiscoverGame[], f: FilterState): DiscoverGame[] {
  const search = f.search.trim().toLowerCase();
  return games.filter((g) => {
    if (f.sport !== 'allSports' && g.sport !== f.sport) return false;
    if (f.time !== 'any' && g.timeBucket !== f.time) return false;
    if (g.distanceMiles > f.distance) return false;
    if (f.skill !== 'all' && g.skillLevel !== 'all' && g.skillLevel !== f.skill)
      return false;
    if (search) {
      const haystack = `${g.title} ${g.location} ${g.sport}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export function DiscoverScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();
  const visibleGames = useMemo(() => applyFilters(DISCOVER_GAMES, filters), [filters]);
  const featuredGame = visibleGames.find((g) => g.featured);
  const regularGames = visibleGames.filter((g) => !g.featured || g.id !== featuredGame?.id);
  const activeFilterCount =
    (filters.time === 'any' ? 0 : 1) +
    (filters.distance === 100 ? 0 : 1) +
    (filters.skill === 'all' ? 0 : 1);

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
        <View style={styles.hero}>
          <Text variant="displaySm" color={colors.text.primary}>
            Find your
          </Text>
          <Text variant="displaySm" color={colors.brand.primary}>
            next game.
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Pickup games, drop-ins, and open gyms near you.
          </Text>
        </View>

        <SearchBar
          value={filters.search}
          onChangeText={(v) => setFilters((p) => ({ ...p, search: v }))}
          placeholder="Search games, sports, locations…"
          onFilterPress={() => setFilterSheetOpen(true)}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {SPORT_FILTERS.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              selected={filters.sport === filter.key}
              onPress={() =>
                setFilters((p) => ({ ...p, sport: filter.key }))
              }
            />
          ))}
        </ScrollView>

        {activeFilterCount > 0 ? (
          <View style={styles.activeFilters}>
            {filters.time !== 'any' ? (
              <Tag
                tone="brand"
                label={
                  TIME_BUCKET_FILTERS.find((b) => b.key === filters.time)
                    ?.label ?? 'Time'
                }
              />
            ) : null}
            {filters.distance !== 100 ? (
              <Tag tone="brand" label={`Within ${filters.distance} mi`} />
            ) : null}
            {filters.skill !== 'all' ? (
              <Tag tone="brand" label={SKILL_LABELS[filters.skill]} />
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
              hitSlop={8}
              onPress={() => setFilters(INITIAL_FILTERS)}
            >
              <Text variant="button" color={colors.text.secondary}>
                Clear
              </Text>
            </Pressable>
          </View>
        ) : null}

        {featuredGame ? (
          <View style={styles.section}>
            <SectionHeader title="Featured Tonight" />
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
            title={`${regularGames.length} game${regularGames.length === 1 ? '' : 's'} for you`}
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
              description="Try expanding distance, time, or skill — or host your own scrimmage."
              primaryAction={{
                label: 'Host a scrimmage',
                onPress: () => navigation.navigate('CreateGame'),
              }}
              secondaryAction={{
                label: 'Reset filters',
                onPress: () => setFilters(INITIAL_FILTERS),
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
        snapPoints={['72%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              When
            </Text>
            <Tabs
              variant="pill"
              scrollable
              items={TIME_BUCKET_FILTERS.map((t) => ({
                key: t.key,
                label: t.label,
              }))}
              value={filters.time}
              onChange={(key) =>
                setFilters((p) => ({ ...p, time: key as FilterState['time'] }))
              }
            />
          </View>

          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Distance
            </Text>
            <Tabs
              variant="segmented"
              items={DISTANCE_FILTERS.map((d) => ({
                key: String(d.key),
                label: d.label,
              }))}
              value={String(filters.distance)}
              onChange={(key) =>
                setFilters((p) => ({ ...p, distance: Number(key) }))
              }
            />
          </View>

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

          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="ghost"
              onPress={() => setFilters(INITIAL_FILTERS)}
              fullWidth
            />
            <Button
              label="Show results"
              variant="gradient"
              onPress={() => setFilterSheetOpen(false)}
              fullWidth
            />
          </View>
        </ScrollView>
      </BottomSheet>
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
  hero: {
    gap: 4,
  },
  heroSubtitle: {
    marginTop: spacing.md,
  },
  filterRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
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
