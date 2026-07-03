import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  LogOut,
  Pencil,
  Settings,
  Sparkles,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { useSavedHighlights } from '../../features/saved-highlights-store';
import { useFollowStore } from '../../features/follow-store';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  AvatarStack,
  Button,
  Card,
  IconBadge,
  Modal,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  EXPERIENCE_LEVEL_BY_KEY,
  NOTIFICATIONS,
  PROFILE_MORE_LINKS,
  PROFILE_USER,
  SPORT_META_BY_KEY,
  formatFeetInches,
  getParticipationForSport,
  getPublicProfile,
  type AppNotification,
  type ProfileMoreRoute,
  type ProfileStat,
  type ProfileUser,
  type SportPlayerProfile,
} from '../../mocks/profile';
import type { SportKey } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function ProfileHeader({
  profile,
  onEdit,
  onPreview,
}: {
  profile: ProfileUser;
  onEdit: () => void;
  onPreview: () => void;
}) {
  const experience = EXPERIENCE_LEVEL_BY_KEY[profile.experience];
  return (
    <Card style={styles.headerCard}>
      <View style={styles.headerEditRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Preview public profile"
          accessibilityHint="See how other players view your profile"
          hitSlop={8}
          onPress={onPreview}
          style={styles.iconBtnSoft}
        >
          <Eye size={16} color={colors.brand.primary} strokeWidth={2.25} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          hitSlop={8}
          onPress={onEdit}
          style={styles.iconBtnSoft}
        >
          <Pencil size={16} color={colors.brand.primary} strokeWidth={2.25} />
        </Pressable>
      </View>
      <View style={styles.headerCenter}>
        <Avatar uri={profile.avatar} size={120} bordered />
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
          ) : profile.proBadge === 'pending' ? (
            <Tag tone="warning" size="sm" leadingDot label="Pro review pending" />
          ) : null}
          {profile.proMember ? (
            <Tag tone="info" size="sm" label="Pro Member" />
          ) : null}
        </View>
      </View>
    </Card>
  );
}

function SportSummaryCard({
  sportProfile,
  user,
}: {
  sportProfile: SportPlayerProfile;
  user: ProfileUser;
}) {
  const meta = SPORT_META_BY_KEY[sportProfile.sportKey];
  const Icon = meta.Icon;
  const secondary = sportProfile.secondaryPositions ?? [];
  const attributeEntries = Object.entries(sportProfile.attributes ?? {}).filter(
    ([, v]) => v.trim().length > 0,
  );

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
            <Tag tone="brand" size="sm" label={sportProfile.position} />
            {secondary.slice(0, 2).map((p) => (
              <Tag key={p} tone="neutral" size="sm" label={p} />
            ))}
            {sportProfile.jerseyNumber ? (
              <Tag tone="info" size="sm" label={`#${sportProfile.jerseyNumber}`} />
            ) : null}
          </View>
        </View>
      </View>
      {sportProfile.yearsPlaying || attributeEntries.length > 0 ? (
        <View style={styles.sportSummaryMeta}>
          {sportProfile.yearsPlaying ? (
            <Tag tone="neutral" size="sm" label={`${sportProfile.yearsPlaying} yrs`} />
          ) : null}
          {attributeEntries.map(([key, value]) => (
            <Tag key={key} tone="neutral" size="sm" label={value} />
          ))}
        </View>
      ) : null}
      {user.physical.heightIn || user.physical.weightLb || user.physical.wingspanIn ? (
        <View style={styles.physicalRow}>
          {user.physical.heightIn ? (
            <Text variant="caption" color={colors.text.secondary}>
              HT {formatFeetInches(user.physical.heightIn)}
            </Text>
          ) : null}
          {user.physical.weightLb ? (
            <Text variant="caption" color={colors.text.secondary}>
              WT {user.physical.weightLb} lb
            </Text>
          ) : null}
          {user.physical.wingspanIn ? (
            <Text variant="caption" color={colors.text.secondary}>
              WS {formatFeetInches(user.physical.wingspanIn)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

function StatCard({
  stat,
  style,
}: {
  stat: ProfileStat;
  style?: StyleProp<ViewStyle>;
}) {
  const Icon = stat.Icon;
  return (
    <Card padded style={[styles.statCard, style]}>
      <IconBadge size={40} tone={stat.highlight ? 'brand' : 'soft'}>
        <Icon
          size={18}
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
}

function FollowingCard({
  onViewAll,
  onFindMore,
}: {
  onViewAll: () => void;
  onFindMore: () => void;
}) {
  const followingIds = useFollowStore((s) => s.followingIds);
  const followedProfiles = followingIds
    .map((id) => getPublicProfile(id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <Card style={styles.followingCard}>
      <View style={styles.followingHeader}>
        <Text variant="h2" color={colors.text.primary}>
          Following
        </Text>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onFindMore}>
          <Text variant="button" color={colors.brand.primary}>
            Find players
          </Text>
        </Pressable>
      </View>
      {followedProfiles.length === 0 ? (
        <Text variant="bodySm" color={colors.text.secondary}>
          You aren't following anyone yet. Follow players to get notified when
          they post highlights or join teams.
        </Text>
      ) : (
        <>
          <AvatarStack
            uris={followedProfiles.map((p) => p.avatar)}
            size={48}
            max={4}
          />
          <View style={styles.followingFooter}>
            <Text variant="bodySm" color={colors.text.secondary}>
              {followingIds.length} player{followingIds.length === 1 ? '' : 's'} ·
              visible on your public profile
            </Text>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={onViewAll}>
              <View style={styles.viewAllBtn}>
                <Text variant="button" color={colors.brand.deep}>
                  View all
                </Text>
              </View>
            </Pressable>
          </View>
        </>
      )}
    </Card>
  );
}

function ActivityPreview({
  notification,
  onAction,
}: {
  notification: AppNotification;
  onAction: (action: string) => void;
}) {
  const Icon = notification.Icon;
  return (
    <View style={styles.activityRow}>
      <View
        style={[
          styles.activityIcon,
          notification.type === 'invite' ? styles.activityInvite : null,
        ]}
      >
        <Icon
          size={20}
          color={
            notification.type === 'invite'
              ? colors.text.inverse
              : colors.brand.primary
          }
          strokeWidth={2.25}
        />
      </View>
      <View style={styles.activityBody}>
        <View style={styles.activityHeaderRow}>
          <Text
            variant="button"
            color={colors.text.primary}
            style={styles.activityTitle}
          >
            {notification.title}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {notification.timestamp}
          </Text>
        </View>
        <Text variant="bodySm" color={colors.text.secondary}>
          {notification.body}
        </Text>
        {notification.actions ? (
          <View style={styles.activityActions}>
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                label={action.label}
                size="sm"
                variant={action.primary ? 'gradient' : 'soft'}
                onPress={() => onAction(action.id)}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function MoreLinksCard({
  onLink,
  onLogout,
  bookmarkCount,
}: {
  onLink: (route: ProfileMoreRoute) => void;
  onLogout: () => void;
  bookmarkCount: number;
}) {
  return (
    <Card style={styles.moreCard}>
      <Text variant="h2" color={colors.text.primary}>
        More
      </Text>
      <View style={styles.linksGroup}>
        {PROFILE_MORE_LINKS.map((link, index) => {
          const Icon = link.Icon;
          const isLast = index === PROFILE_MORE_LINKS.length - 1;
          const isBookmarks = link.route === 'BookmarkedHighlights';
          return (
            <Pressable
              key={link.id}
              accessibilityRole="button"
              accessibilityLabel={link.label}
              accessibilityHint={link.description}
              onPress={() => onLink(link.route)}
              hitSlop={4}
              style={[styles.linkRow, isLast ? null : styles.linkDivider]}
            >
              <IconBadge size={40}>
                <Icon
                  size={18}
                  color={colors.brand.primary}
                  strokeWidth={2.25}
                />
              </IconBadge>
              <View style={styles.linkText}>
                <Text variant="button" color={colors.text.primary}>
                  {link.label}
                </Text>
                <Text variant="caption" color={colors.text.secondary}>
                  {link.description}
                </Text>
              </View>
              {isBookmarks && bookmarkCount > 0 ? (
                <Tag
                  tone="brand"
                  size="sm"
                  label={String(bookmarkCount)}
                  style={styles.linkBadge}
                />
              ) : null}
              <ChevronRight
                size={18}
                color={colors.text.secondary}
                strokeWidth={2.25}
              />
            </Pressable>
          );
        })}
      </View>
      <Button
        label="Sign Out"
        variant="ghost"
        onPress={onLogout}
        leadingIcon={
          <LogOut size={16} color={colors.status.live} strokeWidth={2.25} />
        }
        style={styles.logoutBtn}
      />
    </Card>
  );
}

export function ProfileTabScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const bookmarkCount = useSavedHighlights((s) => s.bookmarkedIds.size);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  // PROFILE_USER is the canonical mock; the auth user only contributes its
  // display name once the user has signed in.
  const profile: ProfileUser = useMemo(
    () =>
      user
        ? { ...PROFILE_USER, name: user.name ?? PROFILE_USER.name }
        : PROFILE_USER,
    [user],
  );

  const sportProfiles = profile.sportProfiles;
  const [activeSport, setActiveSport] = useState<SportKey>(
    sportProfiles[0]?.sportKey ?? 'soccer',
  );
  const activeSportProfile =
    sportProfiles.find((sp) => sp.sportKey === activeSport) ??
    sportProfiles[0]!;

  const sportTabItems = sportProfiles.map((sp) => ({
    key: sp.sportKey,
    label: SPORT_META_BY_KEY[sp.sportKey].short,
  }));

  const previewActivity = NOTIFICATIONS.slice(0, 3);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleLink = (route: ProfileMoreRoute) => {
    navigation.navigate(route as never);
  };

  const handleActivityAction = (notificationId: string, actionId: string) => {
    toast.show({
      variant: actionId === 'accept' || actionId === 'pay' ? 'success' : 'info',
      title:
        actionId === 'accept'
          ? 'Invite accepted'
          : actionId === 'decline'
          ? 'Invite declined'
          : actionId === 'pay'
          ? 'Opening payment'
          : 'Done',
    });
    if (actionId === 'pay') {
      navigation.navigate('TeamPayment', { teamId: 'avalanche-fc' });
    }
  };

  return (
    <View style={styles.root}>
      {/* Profile is a pushed stack screen (Schedule owns its old tab slot),
          so the header carries an explicit back affordance. The notifications
          bell stays hidden — the center is reachable via More → Notifications. */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => navigation.goBack()}
          style={styles.topBarBtn}
        >
          <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
        <Text variant="h2" color={colors.text.primary}>
          Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={8}
          onPress={() => navigation.navigate('Settings')}
          style={styles.topBarBtn}
        >
          <Settings size={20} color={colors.text.primary} strokeWidth={2.25} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          profile={profile}
          onEdit={() => navigation.navigate('ProfileEdit')}
          onPreview={() =>
            navigation.navigate('PlayerProfile', { playerId: profile.playerId })
          }
        />

        {!profile.proMember ? (
          <Card style={styles.upsell}>
            <View style={styles.upsellRow}>
              <IconBadge size={40} tone="brand">
                <Sparkles
                  size={18}
                  color={colors.brand.deep}
                  strokeWidth={2.25}
                />
              </IconBadge>
              <View style={styles.upsellBody}>
                <Text variant="h3" color={colors.text.primary}>
                  Go Pro
                </Text>
                <Text variant="bodySm" color={colors.text.secondary}>
                  Unlimited highlights, unlimited history.
                </Text>
              </View>
            </View>
            <Button
              label="Upgrade"
              variant="gradient"
              fullWidth
              onPress={() => navigation.navigate('Settings')}
            />
          </Card>
        ) : null}

        <View style={styles.sportSection}>
          <View style={styles.sportSectionHead}>
            <Text variant="h2" color={colors.text.primary}>
              My Sports
            </Text>
            <Button
              label="Edit"
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('ProfileEdit')}
            />
          </View>
          {sportTabItems.length > 1 ? (
            <Tabs
              variant="pill"
              scrollable
              items={sportTabItems}
              value={activeSport}
              onChange={(k) => setActiveSport(k as SportKey)}
            />
          ) : null}
          <SportSummaryCard
            sportProfile={activeSportProfile}
            user={profile}
          />
          {profile.showStats ? (
            <View style={styles.statsRow}>
              {getParticipationForSport(profile, activeSport).map((stat) => (
                <StatCard key={stat.id} stat={stat} style={styles.statHalf} />
              ))}
            </View>
          ) : (
            <Card style={styles.statsHidden}>
              <Text variant="bodySm" color={colors.text.secondary} align="center">
                Activity is hidden. Toggle "Show activity" in Edit Profile to
                share it with others.
              </Text>
            </Card>
          )}
        </View>

        <FollowingCard
          onViewAll={() =>
            navigation.navigate('FollowingList', { playerId: profile.playerId })
          }
          onFindMore={() => navigation.navigate('PlayerDirectory')}
        />

        <View style={styles.activityBlock}>
          <View style={styles.activityHeader}>
            <Text variant="h2" color={colors.text.primary}>
              Recent Activity
            </Text>
            <Button
              label={unreadCount > 0 ? `Mark ${unreadCount} read` : 'See all'}
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
          <Card style={styles.activityCard}>
            {previewActivity.map((notification, idx) => (
              <View
                key={notification.id}
                style={[
                  styles.activityWrapper,
                  idx > 0 ? styles.activityWrapperDivider : null,
                ]}
              >
                <ActivityPreview
                  notification={notification}
                  onAction={(actionId) =>
                    handleActivityAction(notification.id, actionId)
                  }
                />
              </View>
            ))}
          </Card>
        </View>

        <MoreLinksCard
          onLink={handleLink}
          onLogout={() => setConfirmSignOut(true)}
          bookmarkCount={bookmarkCount}
        />
      </ScrollView>

      <Modal
        visible={confirmSignOut}
        onRequestClose={() => setConfirmSignOut(false)}
        variant="destructive"
        title="Sign out?"
        description="You'll need to log in again to see your games and squads."
        primaryAction={{
          label: 'Sign out',
          onPress: () => {
            setConfirmSignOut(false);
            logout();
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onPress: () => setConfirmSignOut(false),
        }}
      />
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
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface.card,
    ...shadows.soft,
  },
  topBarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: colors.brand.soft,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerEditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtnSoft: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
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
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  headerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  upsell: {
    gap: spacing.md,
  },
  upsellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  upsellBody: {
    flex: 1,
    gap: 2,
  },
  sportSection: {
    gap: spacing.md,
  },
  sportSectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    gap: spacing.xs,
  },
  physicalRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statCard: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  statHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  statsHidden: {
    paddingVertical: spacing.lg,
  },
  followingCard: {
    gap: spacing.lg,
  },
  followingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  followingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  viewAllBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.soft,
  },
  activityBlock: {
    gap: spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityCard: {
    gap: 0,
    padding: spacing.lg,
  },
  activityWrapper: {
    paddingVertical: spacing.md,
  },
  activityWrapperDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  activityRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInvite: {
    backgroundColor: colors.brand.primary,
  },
  activityBody: {
    flex: 1,
    gap: 4,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  activityTitle: {
    flex: 1,
  },
  activityActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  moreCard: {
    gap: spacing.lg,
  },
  linksGroup: {
    gap: 0,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  linkDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  linkText: {
    flex: 1,
    gap: 2,
  },
  linkBadge: {
    marginRight: spacing.xs,
  },
  logoutBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
});
