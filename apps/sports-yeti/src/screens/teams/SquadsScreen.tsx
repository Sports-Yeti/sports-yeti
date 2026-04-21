import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Plus, Trophy, Users } from 'lucide-react-native';
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
  Text,
  useToast,
} from '../../ui';
import { SquadCard } from '../../components/SquadCard';
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
type SportFilter = 'all' | SportKey;
type LevelFilter = 'all' | 'INTERMEDIATE' | 'ADVANCED' | 'RECREATIONAL';
type CostFilter = 'all' | CostMode;

const TABS: { key: Tab; label: string }[] = [
  { key: 'mine', label: 'My Teams' },
  { key: 'discover', label: 'Find a Team' },
];

const SPORT_CHIPS: { key: SportFilter; label: string }[] = [
  { key: 'all', label: 'All sports' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'volleyball', label: 'Volleyball' },
  { key: 'tennis', label: 'Tennis' },
  { key: 'baseball', label: 'Baseball' },
  { key: 'hockey', label: 'Hockey' },
];

const LEVEL_CHIPS: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: 'All levels' },
  { key: 'RECREATIONAL', label: 'Recreational' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

const COST_CHIPS: { key: CostFilter; label: string }[] = [
  { key: 'all', label: 'Any cost' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

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
  const [sport, setSport] = useState<SportFilter>('all');
  const [position, setPosition] = useState<string>('all');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [cost, setCost] = useState<CostFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  const myTeams = useMemo(
    () => SQUADS.filter((s) => s.membership !== 'none'),
    [],
  );

  const positionOptions = useMemo<string[]>(
    () => (sport === 'all' ? [] : POSITIONS_BY_SPORT[sport]),
    [sport],
  );

  const discoverable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SQUADS.filter((s: Squad) => {
      // Hide full rosters from discovery so players don't apply for nothing.
      if (s.rosterCount >= s.rosterMax) return false;
      // Don't surface teams the user is already on.
      if (s.membership === 'member' || s.membership === 'captain') return false;
      if (sport !== 'all' && s.sportKey !== sport) return false;
      if (level !== 'all' && s.level !== level) return false;
      if (cost !== 'all' && s.costMode !== cost) return false;
      if (position !== 'all') {
        const matchesPosition = s.needs.some(
          (n) => n.label.toLowerCase() === position.toLowerCase(),
        );
        if (!matchesPosition) return false;
      }
      if (q) {
        const needsHay = s.needs.map((n) => n.label).join(' ');
        const hay = `${s.name} ${s.location} ${s.sport} ${needsHay}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, sport, level, cost, position]);

  const visibleList = tab === 'mine' ? myTeams : discoverable;

  const resetFilters = () => {
    setSearch('');
    setSport('all');
    setPosition('all');
    setLevel('all');
    setCost('all');
  };

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
        <View style={styles.hero}>
          <Text variant="displaySm" color={colors.text.primary}>
            Your
          </Text>
          <Text variant="displaySm" color={colors.brand.primary}>
            Teams.
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Manage the squads you play for. Find a new one when you're ready.
          </Text>
        </View>

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

            <View style={styles.filterRow}>
              <Chip
                label={
                  SPORT_CHIPS.find((s) => s.key === sport)?.label ?? 'Sport'
                }
                selected={sport !== 'all'}
                onPress={() => setFilterOpen(true)}
                trailingIcon={
                  <ChevronDown
                    size={14}
                    color={
                      sport !== 'all'
                        ? colors.text.inverse
                        : colors.text.primary
                    }
                    strokeWidth={2.25}
                  />
                }
              />
              <Chip
                label={
                  position === 'all'
                    ? sport === 'all'
                      ? 'Any position'
                      : 'Any position'
                    : position
                }
                selected={position !== 'all'}
                onPress={() => setFilterOpen(true)}
                trailingIcon={
                  <ChevronDown
                    size={14}
                    color={
                      position !== 'all'
                        ? colors.text.inverse
                        : colors.text.primary
                    }
                    strokeWidth={2.25}
                  />
                }
              />
              <Chip
                label={
                  COST_CHIPS.find((c) => c.key === cost)?.label ?? 'Cost'
                }
                selected={cost !== 'all'}
                onPress={() => setFilterOpen(true)}
              />
            </View>
          </>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title={sectionTitle}
            actionLabel={tab === 'mine' ? 'Find a team' : 'Browse leagues'}
            onActionPress={() => {
              if (tab === 'mine') setTab('discover');
              else setCreateOpen(true);
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
                  onPress: () => setCreateOpen(true),
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
                      description: 'You\'ll get a push when a matching roster opens.',
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
                          ? `Captain reviews within 48h. You\'ll pay ${'$'}${(squad.perPlayerCents / 100).toFixed(0)} once accepted.`
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
        accessibilityLabel="Create or join a team"
        onPress={() => setCreateOpen(true)}
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
        snapPoints={['72%']}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Sport
            </Text>
            <Tabs
              variant="pill"
              scrollable
              items={SPORT_CHIPS.map((s) => ({ key: s.key, label: s.label }))}
              value={sport}
              onChange={(k) => {
                setSport(k as SportFilter);
                setPosition('all');
              }}
            />
          </View>

          {sport !== 'all' ? (
            <View style={styles.sheetGroup}>
              <Text variant="eyebrow" color={colors.text.secondary}>
                Position
              </Text>
              <Tabs
                variant="pill"
                scrollable
                items={[
                  { key: 'all', label: 'Any' },
                  ...positionOptions.map((p) => ({ key: p, label: p })),
                ]}
                value={position}
                onChange={setPosition}
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
          </View>

          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="ghost"
              fullWidth
              onPress={resetFilters}
            />
            <Button
              label="Apply"
              variant="gradient"
              fullWidth
              onPress={() => setFilterOpen(false)}
            />
          </View>
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={createOpen}
        onRequestClose={() => setCreateOpen(false)}
        title="Start something new"
        snapPoints={['55%']}
      >
        <View style={styles.sheetContent}>
          <Text variant="body" color={colors.text.secondary}>
            Create a fresh squad or browse leagues that are accepting team registrations.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCreateOpen(false);
              navigation.navigate('LeagueBrowse');
            }}
            style={({ pressed }) => [
              styles.bigOption,
              pressed ? styles.bigOptionPressed : null,
            ]}
          >
            <View style={styles.optionIcon}>
              <Trophy size={24} color={colors.brand.primary} strokeWidth={2.25} />
            </View>
            <View style={styles.optionBody}>
              <Text variant="h3" color={colors.text.primary}>
                Browse open leagues
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Captains can register a team and unlock per-player payment.
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCreateOpen(false);
              navigation.navigate('TeamCreate');
            }}
            style={({ pressed }) => [
              styles.bigOption,
              pressed ? styles.bigOptionPressed : null,
            ]}
          >
            <View style={styles.optionIcon}>
              <Users size={24} color={colors.brand.primary} strokeWidth={2.25} />
            </View>
            <View style={styles.optionBody}>
              <Text variant="h3" color={colors.text.primary}>
                Start a casual squad
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Free or paid — invite players and you become the captain.
              </Text>
            </View>
          </Pressable>
        </View>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  bigOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface.bg,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  bigOptionPressed: {
    opacity: 0.7,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: {
    flex: 1,
    gap: 2,
  },
});
