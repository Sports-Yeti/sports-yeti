import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, UserCheck, UserPlus, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows, spacing } from '../../theme';
import { Avatar, Button, EmptyState, Tag, Text, useToast } from '../../ui';
import {
  EXPERIENCE_LEVEL_BY_KEY,
  FOLLOWING_BY_PLAYER,
  PROFILE_USER,
  SPORT_META_BY_KEY,
  getPublicProfile,
  type PublicPlayerProfile,
} from '../../mocks/profile';
import { useFollowStore } from '../../features/follow-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'FollowingList'>;
type Route = RouteProp<RootStackParamList, 'FollowingList'>;

function FollowedPlayerRow({
  player,
  isSelf,
  isFollowedByMe,
  onOpen,
  onToggleFollow,
}: {
  player: PublicPlayerProfile;
  /** Row is the current user themselves — no follow button. */
  isSelf: boolean;
  isFollowedByMe: boolean;
  onOpen: () => void;
  onToggleFollow: () => void;
}) {
  const primarySport = player.sportProfiles[0];
  const sportLabel = primarySport
    ? `${SPORT_META_BY_KEY[primarySport.sportKey].label} · ${primarySport.position}`
    : '';
  const experience = EXPERIENCE_LEVEL_BY_KEY[player.experience];

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${player.name}'s profile`}
        onPress={onOpen}
        hitSlop={6}
        style={styles.rowLead}
      >
        <Avatar uri={player.avatar} initials={player.name.charAt(0)} size={48} />
        <View style={styles.rowBody}>
          <Text variant="button" color={colors.text.primary}>
            {player.name}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {sportLabel}
          </Text>
          <View style={styles.rowTags}>
            <Tag tone="brand" size="sm" label={experience.label} />
            {player.proBadge === 'approved' ? (
              <Tag tone="success" size="sm" leadingDot label="Pro" />
            ) : null}
          </View>
        </View>
      </Pressable>
      {!isSelf ? (
        <Button
          label={isFollowedByMe ? 'Following' : 'Follow'}
          variant={isFollowedByMe ? 'soft' : 'gradient'}
          size="sm"
          leadingIcon={
            isFollowedByMe ? (
              <UserCheck size={14} color={colors.brand.primary} strokeWidth={2.25} />
            ) : (
              <UserPlus size={14} color={colors.text.inverse} strokeWidth={2.25} />
            )
          }
          onPress={onToggleFollow}
        />
      ) : null}
    </View>
  );
}

export function FollowingListScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const playerId = route.params.playerId;
  const isMyList = playerId === PROFILE_USER.playerId;
  const owner = getPublicProfile(playerId);

  const myFollowingIds = useFollowStore((s) => s.followingIds);
  const toggleFollow = useFollowStore((s) => s.toggleFollow);

  const followingIds = isMyList
    ? myFollowingIds
    : FOLLOWING_BY_PLAYER[playerId] ?? [];
  const players = followingIds
    .map((id) => getPublicProfile(id))
    .filter((p): p is PublicPlayerProfile => !!p);

  const handleToggleFollow = (target: PublicPlayerProfile) => {
    const nowFollowing = toggleFollow(target.playerId);
    Haptics.selectionAsync();
    toast.show({
      variant: nowFollowing ? 'success' : 'info',
      title: nowFollowing
        ? `Following ${target.name}`
        : `Unfollowed ${target.name}`,
    });
  };

  const title = isMyList ? 'Following' : `${owner?.name ?? 'Player'} follows`;

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
        <Text variant="h2" color={colors.text.primary} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {players.length === 0 ? (
          <EmptyState
            icon={<Users size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title={isMyList ? 'Not following anyone yet' : 'No follows yet'}
            description={
              isMyList
                ? 'Follow players from their profile or the Player Directory to get notified of their activity.'
                : "This player isn't following anyone yet."
            }
            primaryAction={
              isMyList
                ? {
                    label: 'Browse Player Directory',
                    onPress: () => navigation.navigate('PlayerDirectory'),
                  }
                : undefined
            }
          />
        ) : (
          <>
            <Text variant="caption" color={colors.text.secondary}>
              {players.length} player{players.length === 1 ? '' : 's'}
              {isMyList
                ? " · you'll be notified of their activity"
                : ' · follow lists are public'}
            </Text>
            <View style={styles.list}>
              {players.map((player) => (
                <FollowedPlayerRow
                  key={player.playerId}
                  player={player}
                  isSelf={player.playerId === PROFILE_USER.playerId}
                  isFollowedByMe={myFollowingIds.includes(player.playerId)}
                  onOpen={() =>
                    navigation.push('PlayerProfile', { playerId: player.playerId })
                  }
                  onToggleFollow={() => handleToggleFollow(player)}
                />
              ))}
            </View>
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
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  rowLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
});
