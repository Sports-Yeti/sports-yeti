import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, spacing } from '../../theme';
import { Chip, ScreenHeader, SearchBar, Text } from '../../ui';
import { SquadCard } from '../../components/SquadCard';
import { SQUADS } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function SquadsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
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
            Find Your
          </Text>
          <Text variant="display" color={colors.brand.primary}>
            Squad.
          </Text>
          <Text
            variant="bodyLg"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Connect with local teams actively looking for players. Filter by
            sport, position, and experience level to find your perfect match on
            the ice, field, or court.
          </Text>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search teams, sports, or locations..."
          onFilterPress={() => undefined}
        />

        <View style={styles.filterRow}>
          <Chip
            label="Sport"
            onPress={() => undefined}
            trailingIcon={
              <ChevronDown
                size={14}
                color={colors.text.primary}
                strokeWidth={2.25}
              />
            }
          />
          <Chip
            label="Experience"
            onPress={() => undefined}
            trailingIcon={
              <ChevronDown
                size={14}
                color={colors.text.primary}
                strokeWidth={2.25}
              />
            }
          />
        </View>

        <View style={styles.cardsColumn}>
          {SQUADS.map((squad) => (
            <SquadCard
              key={squad.id}
              squad={squad}
              onPress={() =>
                navigation.navigate('TeamDetails', { id: squad.id })
              }
              onApply={() =>
                navigation.navigate('TeamDetails', { id: squad.id })
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
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardsColumn: {
    gap: spacing.xxl,
  },
});
