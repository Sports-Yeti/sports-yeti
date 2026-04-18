import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import { Pressable } from 'react-native';
import { SquadCard } from '../../components/SquadCard';
import { SQUADS, type Squad } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SPORT_CHIPS: { key: string; label: string }[] = [
  { key: 'all', label: 'All sports' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'volleyball', label: 'Volleyball' },
  { key: 'tennis', label: 'Tennis' },
  { key: 'baseball', label: 'Baseball' },
  { key: 'hockey', label: 'Hockey' },
];

const LEVEL_CHIPS: { key: 'all' | 'INTERMEDIATE' | 'ADVANCED' | 'RECREATIONAL'; label: string }[] = [
  { key: 'all', label: 'All levels' },
  { key: 'RECREATIONAL', label: 'Recreational' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

export function SquadsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState<string>('all');
  const [level, setLevel] = useState<(typeof LEVEL_CHIPS)[number]['key']>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  const filteredSquads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SQUADS.filter((s: Squad) => {
      if (sport !== 'all' && s.sportKey !== sport) return false;
      if (level !== 'all' && s.level !== level) return false;
      if (q) {
        const hay = `${s.name} ${s.location} ${s.sport}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, sport, level]);

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
            Find Your
          </Text>
          <Text variant="displaySm" color={colors.brand.primary}>
            Squad.
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Local teams looking for players. Apply, get matched, play more.
          </Text>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search teams, sports, or cities…"
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
              LEVEL_CHIPS.find((l) => l.key === level)?.label ?? 'Level'
            }
            selected={level !== 'all'}
            onPress={() => setFilterOpen(true)}
            trailingIcon={
              <ChevronDown
                size={14}
                color={
                  level !== 'all'
                    ? colors.text.inverse
                    : colors.text.primary
                }
                strokeWidth={2.25}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={`${filteredSquads.length} squad${filteredSquads.length === 1 ? '' : 's'}`}
            actionLabel="Browse leagues"
            onActionPress={() => setCreateOpen(true)}
          />
          {filteredSquads.length === 0 ? (
            <EmptyState
              icon={
                <Users size={28} color={colors.brand.primary} strokeWidth={2.25} />
              }
              title="No squads match"
              description="Try widening sport or level — or start your own team."
              primaryAction={{
                label: 'Create a team',
                onPress: () => setCreateOpen(true),
              }}
              secondaryAction={{
                label: 'Reset',
                onPress: () => {
                  setSearch('');
                  setSport('all');
                  setLevel('all');
                },
              }}
            />
          ) : (
            <View style={styles.cardsColumn}>
              {filteredSquads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  onPress={() =>
                    navigation.navigate('TeamDetails', { id: squad.id })
                  }
                  onApply={() => {
                    toast.show({
                      variant: 'success',
                      title: `Applied to ${squad.name}`,
                      description: 'The captain will respond within 48 hours.',
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
        title="Filter squads"
        snapPoints={['60%']}
      >
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Sport
            </Text>
            <Tabs
              variant="pill"
              scrollable
              items={SPORT_CHIPS.map((s) => ({ key: s.key, label: s.label }))}
              value={sport}
              onChange={setSport}
            />
          </View>
          <View style={styles.sheetGroup}>
            <Text variant="eyebrow" color={colors.text.secondary}>
              Level
            </Text>
            <Tabs
              variant="segmented"
              items={LEVEL_CHIPS.map((l) => ({ key: l.key, label: l.label }))}
              value={level}
              onChange={(k) => setLevel(k as typeof level)}
            />
          </View>
          <View style={styles.sheetActions}>
            <Button
              label="Reset"
              variant="ghost"
              fullWidth
              onPress={() => {
                setSport('all');
                setLevel('all');
              }}
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
                Register your team for a league with a season schedule.
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCreateOpen(false);
              toast.show({
                variant: 'info',
                title: 'Team creator coming soon',
                description: 'For now, captain a team via league registration.',
              });
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
                For pickup or recreational play. No league commitment.
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
    gap: spacing.md,
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
