import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Eye } from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import { EmptyState, SectionHeader, Text } from '../../ui';
import { EventCard } from '../../components/EventCard';
import { SquadCard } from '../../components/SquadCard';
import { useWatchStore } from '../../stores';
import { useDiscoverGames } from '../../features/discover-store';
import { useAllSquads } from '../../features/created-squads-store';
import { useTeamMembershipStore } from '../../features/team-membership-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function WatchlistScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();

  const watchedIds = useWatchStore((s) => s.watchedIds);
  const watchedTeamIds = useWatchStore((s) => s.watchedTeamIds);

  const allGames = useDiscoverGames();
  const allSquads = useAllSquads();
  const membershipOverrides = useTeamMembershipStore((s) => s.overrides);

  const games = useMemo(
    () => allGames.filter((g) => watchedIds.has(g.id)),
    [allGames, watchedIds],
  );

  const teams = useMemo(
    () =>
      allSquads
        .filter((s) => watchedTeamIds.has(s.id))
        .map((s) => {
          const override = membershipOverrides[s.id];
          return override ? { ...s, membership: override } : s;
        }),
    [allSquads, watchedTeamIds, membershipOverrides],
  );

  const isEmpty = games.length === 0 && teams.length === 0;

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
          Watching
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <EmptyState
            icon={<Eye size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="You're not watching anything yet"
            description="Tap Watch on any game or team to follow spots, roster openings, and updates here."
            primaryAction={{
              label: 'Browse the Join tab',
              onPress: () => navigation.goBack(),
            }}
          />
        ) : (
          <>
            {games.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={`Games · ${games.length}`}
                />
                <View style={styles.cardsColumn}>
                  {games.map((game) => (
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
              </View>
            ) : null}

            {teams.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title={`Teams · ${teams.length}`} />
                <View style={styles.cardsColumn}>
                  {teams.map((squad) => (
                    <SquadCard
                      key={squad.id}
                      squad={squad}
                      variant="discover"
                      onPress={() =>
                        navigation.navigate('TeamDetails', { id: squad.id })
                      }
                      onApply={() =>
                        navigation.navigate('TeamDetails', { id: squad.id })
                      }
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xxl,
  },
  section: {
    gap: spacing.lg,
  },
  cardsColumn: {
    gap: spacing.xxl,
  },
});
