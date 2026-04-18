import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores';
import { colors, spacing } from '../../theme';
import { Chip, ScreenHeader, SearchBar, Text } from '../../ui';
import { EventCard } from '../../components/EventCard';
import { DISCOVER_GAMES, SPORT_FILTERS, type SportKey } from '../../mocks/games';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function DiscoverScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [activeSport, setActiveSport] = useState<SportKey>('allSports');
  const [search, setSearch] = useState('');

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();

  return (
    <View style={styles.root}>
      <ScreenHeader
        initials={initials}
        hasNotifications
        onAvatarPress={() => navigation.navigate('Profile' as never)}
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
          <Text variant="display" color={colors.text.primary}>
            Find your
          </Text>
          <Text variant="display" color={colors.text.primary}>
            next
          </Text>
          <Text variant="display" color={colors.brand.primary}>
            game.
          </Text>
          <Text
            variant="bodyLg"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Discover pick-up games, local leagues, and open gyms near you.
          </Text>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          onFilterPress={() => undefined}
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
              selected={activeSport === filter.key}
              onPress={() => setActiveSport(filter.key)}
            />
          ))}
        </ScrollView>

        <View style={styles.cardsColumn}>
          {DISCOVER_GAMES.map((game) => (
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
      </ScrollView>
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
  cardsColumn: {
    gap: spacing.xxl,
  },
});
