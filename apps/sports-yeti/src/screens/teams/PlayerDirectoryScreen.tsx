import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, MessageCircle, Send, UserPlus } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  Button,
  EmptyState,
  SearchBar,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { DIRECTORY_PLAYERS, type DirectoryPlayer } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SPORT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'volleyball', label: 'Volleyball' },
  { key: 'hockey', label: 'Hockey' },
];

const AVAILABILITY_FILTERS = [
  { key: 'all', label: 'Any' },
  { key: 'looking_for_team', label: 'LFT' },
  { key: 'available', label: 'Available' },
];

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
  invited,
}: {
  player: DirectoryPlayer;
  onInvite: () => void;
  onMessage: () => void;
  invited: boolean;
}) {
  return (
    <View style={styles.card}>
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
  const [sport, setSport] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DIRECTORY_PLAYERS.filter((p) => {
      if (sport !== 'all' && p.sportKey !== sport) return false;
      if (availability !== 'all' && p.availability !== availability) return false;
      if (q) {
        const hay = `${p.name} ${p.handle} ${p.position} ${p.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, sport, availability]);

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
          onFilterPress={() => undefined}
        />
        <Tabs
          variant="pill"
          scrollable
          items={SPORT_FILTERS}
          value={sport}
          onChange={setSport}
        />
        <Tabs
          variant="segmented"
          items={AVAILABILITY_FILTERS}
          value={availability}
          onChange={setAvailability}
        />
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
            description="Try widening sport or availability — or share your team link to recruit."
            primaryAction={{
              label: 'Share team link',
              onPress: () =>
                toast.show({ variant: 'info', title: 'Team link copied' }),
            }}
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
                  chatId: `dm-${p.id}`,
                  title: p.name,
                })
              }
            />
          ))
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
  filtersBlock: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
