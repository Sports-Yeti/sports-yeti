import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShieldOff,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  AvatarStack,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  EXPERIENCE_LEVEL_BY_KEY,
  FOLLOWING_BY_PLAYER,
  PROFILE_USER,
  SPORT_META_BY_KEY,
  formatFeetInches,
  genderIdentityLabel,
  getParticipationForSport,
  getPublicProfile,
  SPORT_ATTRIBUTE_TEMPLATES,
  type PublicPlayerProfile,
  type SportPlayerProfile,
} from '../../mocks/profile';
import { CAPTAIN_OF_TEAMS } from '../../mocks/teams';
import { dmChatIdForPlayer } from '../../mocks/messages';
import { useFollowStore } from '../../features/follow-store';
import type { SportKey } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PlayerProfile'>;
type Route = RouteProp<RootStackParamList, 'PlayerProfile'>;

function ParticipationPanel({
  profile,
  sportKey,
}: {
  profile: PublicPlayerProfile;
  sportKey: SportKey;
}) {
  const stats = getParticipationForSport(profile, sportKey);
  return (
    <View style={styles.statsGrid}>
      {stats.map((stat) => {
        const Icon = stat.Icon;
        return (
          <Card
            key={stat.id}
            padded
            style={[
              styles.statCard,
              stat.highlight ? styles.statCardPrimary : null,
            ]}
          >
            <IconBadge size={36} tone={stat.highlight ? 'brand' : 'soft'}>
              <Icon
                size={16}
                color={stat.highlight ? colors.brand.deep : colors.brand.primary}
                strokeWidth={2.25}
              />
            </IconBadge>
            <Text variant="display" color={colors.text.primary}>
              {stat.value}
            </Text>
            <Text variant="eyebrow" color={colors.text.secondary}>
              {stat.label}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}

function SportProfileSummary({
  sportProfile,
  physical,
}: {
  sportProfile: SportPlayerProfile;
  physical: PublicPlayerProfile['physical'];
}) {
  const meta = SPORT_META_BY_KEY[sportProfile.sportKey];
  const Icon = meta.Icon;
  const secondary = sportProfile.secondaryPositions ?? [];
  const attributeTemplate = SPORT_ATTRIBUTE_TEMPLATES[sportProfile.sportKey];
  const attributes = sportProfile.attributes ?? {};
  const attributeRows = attributeTemplate
    .map((field) => ({ label: field.label, value: attributes[field.id] }))
    .filter((row): row is { label: string; value: string } => !!row.value);

  const physicalRows = [
    physical.heightIn
      ? { label: 'Height', value: formatFeetInches(physical.heightIn) }
      : null,
    physical.weightLb ? { label: 'Weight', value: `${physical.weightLb} lb` } : null,
    physical.wingspanIn
      ? { label: 'Wingspan', value: formatFeetInches(physical.wingspanIn) }
      : null,
  ].filter((r): r is { label: string; value: string } => !!r);

  return (
    <Card style={styles.sportSummaryCard}>
      <View style={styles.sportSummaryHeader}>
        <IconBadge size={48} tone="brand">
          <Icon size={22} color={colors.brand.deep} strokeWidth={2.25} />
        </IconBadge>
        <View style={styles.sportSummaryTitle}>
          <Text variant="h3" color={colors.text.primary}>
            {meta.label}
          </Text>
          <View style={styles.sportSummaryTags}>
            <Tag tone="brand" size="sm" label={`${sportProfile.position} · Primary`} />
            {secondary.map((pos) => (
              <Tag key={pos} tone="neutral" size="sm" label={pos} />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.sportSummaryMeta}>
        {sportProfile.yearsPlaying ? (
          <Tag tone="info" size="sm" label={`${sportProfile.yearsPlaying} yrs playing`} />
        ) : null}
        {sportProfile.jerseyNumber ? (
          <Tag tone="info" size="sm" label={`Jersey #${sportProfile.jerseyNumber}`} />
        ) : null}
      </View>

      {physicalRows.length > 0 || attributeRows.length > 0 ? (
        <View style={styles.attributesBlock}>
          <Text variant="eyebrow" color={colors.text.secondary}>
            MEASURABLES
          </Text>
          <View style={styles.attributesGrid}>
            {[...physicalRows, ...attributeRows].map((row) => (
              <View key={row.label} style={styles.attributeCell}>
                <Text variant="caption" color={colors.text.secondary}>
                  {row.label}
                </Text>
                <Text variant="button" color={colors.text.primary}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export function PlayerProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const playerId = route.params.playerId;
  const isMe = playerId === PROFILE_USER.playerId;
  const profile = useMemo(() => getPublicProfile(playerId), [playerId]);

  const myFollowingIds = useFollowStore((s) => s.followingIds);
  const toggleFollow = useFollowStore((s) => s.toggleFollow);
  const isFollowing = myFollowingIds.includes(playerId);

  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [invitedTeamIds, setInvitedTeamIds] = useState<Set<string>>(new Set());

  const sportProfiles = profile?.sportProfiles ?? [];
  const [activeSport, setActiveSport] = useState<SportKey>(
    sportProfiles[0]?.sportKey ?? 'soccer',
  );
  const activeSportProfile =
    sportProfiles.find((sp) => sp.sportKey === activeSport) ??
    sportProfiles[0];

  // Public follow list: my own is live from the store; others read the mock.
  const followingIds = isMe
    ? myFollowingIds
    : FOLLOWING_BY_PLAYER[playerId] ?? [];
  const followingCount = followingIds.length;
  const followingAvatars = followingIds
    .map((id) => getPublicProfile(id)?.avatar)
    .filter((a): a is string => !!a);

  if (!profile) {
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
            Player
          </Text>
          <View style={styles.backBtn} />
        </View>
        <EmptyState
          icon={
            <ShieldOff size={28} color={colors.brand.primary} strokeWidth={2.25} />
          }
          title="Profile unavailable"
          description="This player may have set their profile to private or removed their account."
          primaryAction={{ label: 'Back', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const experience = EXPERIENCE_LEVEL_BY_KEY[profile.experience];
  const gender = genderIdentityLabel(profile.genderIdentity);

  const tabs = sportProfiles.map((sp) => ({
    key: sp.sportKey,
    label: SPORT_META_BY_KEY[sp.sportKey].short,
  }));

  const handleToggleFollow = () => {
    const nowFollowing = toggleFollow(playerId);
    Haptics.selectionAsync();
    toast.show({
      variant: nowFollowing ? 'success' : 'info',
      title: nowFollowing
        ? `Following ${profile.name}`
        : `Unfollowed ${profile.name}`,
      description: nowFollowing
        ? "You'll get notified about their activity."
        : undefined,
    });
  };

  const handleInviteToTeam = (teamId: string, teamName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setInvitedTeamIds((prev) => new Set(prev).add(teamId));
    setInviteSheetOpen(false);
    toast.show({
      variant: 'success',
      title: `Invited ${profile.name} to ${teamName}`,
      description: 'They got an in-app notification.',
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
          {isMe ? 'My public profile' : 'Player profile'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (isMe ? 40 : 140) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerCenter}>
            <Avatar uri={profile.avatar} initials={profile.name.charAt(0)} size={104} bordered />
            <View style={styles.nameRow}>
              <Text variant="h1" color={colors.text.primary} align="center">
                {profile.name}
              </Text>
              {profile.proBadge === 'approved' ? (
                <BadgeCheck size={22} color={colors.brand.primary} strokeWidth={2.25} />
              ) : null}
            </View>
            <Text variant="body" color={colors.text.secondary} align="center">
              {profile.handle} · {profile.city}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary} align="center" style={styles.bio}>
              {profile.bio}
            </Text>
            <View style={styles.headerTags}>
              <Tag tone="brand" size="sm" label={experience.label} />
              {profile.proBadge === 'approved' ? (
                <Tag tone="success" size="sm" leadingDot label="Pro verified" />
              ) : null}
              {gender ? <Tag tone="neutral" size="sm" label={gender} /> : null}
            </View>
            {isMe ? (
              <Tag tone="info" size="sm" label="Preview — visible to others" />
            ) : null}
          </View>
        </Card>

        {tabs.length > 1 ? (
          <Tabs
            variant="pill"
            scrollable
            items={tabs}
            value={activeSport}
            onChange={(k) => setActiveSport(k as SportKey)}
          />
        ) : null}

        {activeSportProfile ? (
          <SportProfileSummary
            sportProfile={activeSportProfile}
            physical={profile.physical}
          />
        ) : null}

        {profile.showStats ? (
          <View style={styles.statsBlock}>
            <View style={styles.sectionHeader}>
              <Text variant="h2" color={colors.text.primary}>
                Activity
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Lifetime · {SPORT_META_BY_KEY[activeSport].label}
              </Text>
            </View>
            <ParticipationPanel profile={profile} sportKey={activeSport} />
          </View>
        ) : (
          <Card style={styles.statsHidden}>
            <Text variant="bodySm" color={colors.text.secondary} align="center">
              {isMe
                ? 'You hid your activity. Toggle "Show activity" in Edit Profile.'
                : 'This player hides their activity from public view.'}
            </Text>
          </Card>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View players ${profile.name} follows`}
          onPress={() => navigation.navigate('FollowingList', { playerId })}
        >
          <Card style={styles.followingCard}>
            <IconBadge size={40}>
              <Users size={18} color={colors.brand.primary} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.followingBody}>
              <Text variant="button" color={colors.text.primary}>
                Following
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                {followingCount === 0
                  ? 'Not following anyone yet.'
                  : `${followingCount} player${followingCount === 1 ? '' : 's'}`}
              </Text>
            </View>
            {followingAvatars.length > 0 ? (
              <AvatarStack uris={followingAvatars} size={32} max={3} />
            ) : null}
            <ChevronRight size={18} color={colors.text.secondary} strokeWidth={2.25} />
          </Card>
        </Pressable>
      </ScrollView>

      {!isMe ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.actionRow}>
            <Button
              label={isFollowing ? 'Following' : 'Follow'}
              variant={isFollowing ? 'soft' : 'gradient'}
              size="lg"
              leadingIcon={
                isFollowing ? (
                  <UserCheck size={16} color={colors.brand.primary} strokeWidth={2.25} />
                ) : (
                  <UserPlus size={16} color={colors.text.inverse} strokeWidth={2.25} />
                )
              }
              onPress={handleToggleFollow}
              style={styles.actionBtn}
            />
            <Button
              label="Message"
              variant="soft"
              size="lg"
              leadingIcon={
                <MessageCircle size={16} color={colors.brand.primary} strokeWidth={2.25} />
              }
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate('Chat', {
                  chatId: dmChatIdForPlayer(profile.playerId),
                  title: profile.name,
                  avatar: profile.avatar,
                });
              }}
              style={styles.actionBtn}
            />
            <Button
              label="Invite"
              variant="solid"
              size="lg"
              leadingIcon={
                <Users size={16} color={colors.text.inverse} strokeWidth={2.25} />
              }
              onPress={() => setInviteSheetOpen(true)}
              style={styles.actionBtn}
            />
          </View>
        </View>
      ) : null}

      <BottomSheet
        visible={inviteSheetOpen}
        onRequestClose={() => setInviteSheetOpen(false)}
        title={`Invite ${profile.name} to a team`}
        snapPoints={['55%']}
      >
        {CAPTAIN_OF_TEAMS.length === 0 ? (
          <EmptyState
            icon={<Users size={28} color={colors.brand.primary} strokeWidth={2.25} />}
            title="You don't captain a team yet"
            description="Create a team first, then invite players to fill your roster."
            primaryAction={{
              label: 'Create a team',
              onPress: () => {
                setInviteSheetOpen(false);
                navigation.navigate('TeamCreate');
              },
            }}
          />
        ) : (
          <View style={styles.inviteList}>
            <Text variant="caption" color={colors.text.secondary}>
              Pick one of the teams you captain. The player gets an invite
              notification they can accept or decline.
            </Text>
            {CAPTAIN_OF_TEAMS.map((team) => {
              const TeamIcon = team.Icon;
              const invited = invitedTeamIds.has(team.id);
              return (
                <View key={team.id} style={styles.inviteRow}>
                  <IconBadge size={44} tone="soft">
                    <TeamIcon size={20} color={colors.brand.primary} strokeWidth={2.25} />
                  </IconBadge>
                  <View style={styles.inviteRowBody}>
                    <Text variant="button" color={colors.text.primary}>
                      {team.name}
                    </Text>
                    <Text variant="caption" color={colors.text.secondary}>
                      {team.sport} · {team.roster.length}/{team.rosterMax} roster
                    </Text>
                  </View>
                  <Button
                    label={invited ? 'Invited' : 'Invite'}
                    variant={invited ? 'soft' : 'gradient'}
                    size="sm"
                    disabled={invited}
                    onPress={() => handleInviteToTeam(team.id, team.name)}
                  />
                </View>
              );
            })}
          </View>
        )}
      </BottomSheet>
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
    gap: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.brand.soft,
    paddingVertical: spacing.xl,
  },
  headerCenter: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bio: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  headerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  sportSummaryCard: {
    gap: spacing.md,
  },
  sportSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sportSummaryTitle: {
    flex: 1,
    gap: 6,
  },
  sportSummaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sportSummaryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  attributesBlock: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  attributeCell: {
    minWidth: 88,
    gap: 2,
  },
  statsBlock: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  statCardPrimary: {
    borderWidth: 1,
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
    ...shadows.soft,
  },
  statsHidden: {
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
  },
  followingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  followingBody: {
    flex: 1,
    gap: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
  inviteList: {
    gap: spacing.md,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 60,
  },
  inviteRowBody: {
    flex: 1,
    gap: 2,
  },
});
