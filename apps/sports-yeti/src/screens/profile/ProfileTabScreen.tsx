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
  ChevronRight,
  Eye,
  LogOut,
  Pencil,
  Settings,
  Sparkles,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { useSavedHighlights } from '../../features/saved-highlights-store';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  AvatarStack,
  Button,
  Card,
  IconBadge,
  Modal,
  ScreenHeader,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  NOTIFICATIONS,
  PROFILE_FRIENDS,
  PROFILE_MORE_LINKS,
  PROFILE_MUTUAL_COUNT,
  PROFILE_USER,
  SPORT_META_BY_KEY,
  getStatsForSport,
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
  name,
  handle,
  bio,
  avatarUri,
  proMember,
  onEdit,
  onPreview,
}: {
  name: string;
  handle: string;
  bio: string;
  avatarUri: string;
  proMember: boolean;
  onEdit: () => void;
  onPreview: () => void;
}) {
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
        <Avatar uri={avatarUri} size={120} bordered />
        <Text variant="h1" color={colors.text.primary} align="center">
          {name}
        </Text>
        <Text variant="body" color={colors.text.secondary} align="center">
          {handle}
        </Text>
        <Text variant="bodySm" color={colors.text.secondary} align="center" style={styles.bio}>
          {bio}
        </Text>
        {proMember ? (
          <View style={styles.proChip}>
            <Text variant="eyebrow" color={colors.brand.tint}>
              Pro Member
            </Text>
          </View>
        ) : null}
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
  const stats = getStatsForSport(user, sportProfile.sportKey);
  const primary = stats.find((s) => s.highlight);
  const others = stats.filter((s) => !s.highlight);
  const PrimaryIcon = primary?.Icon ?? Icon;
  const secondary = sportProfile.secondaryPositions ?? [];

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
              <Tag
                tone="info"
                size="sm"
                label={`#${sportProfile.jerseyNumber}`}
              />
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.sportSummaryStats}>
        {primary ? (
          <View style={styles.sportSummaryPrimary}>
            <IconBadge size={40} tone="brand">
              <PrimaryIcon
                size={18}
                color={colors.brand.deep}
                strokeWidth={2.25}
              />
            </IconBadge>
            <View style={styles.sportSummaryPrimaryText}>
              <Text variant="display" color={colors.text.primary}>
                {primary.value}
              </Text>
              <Text variant="eyebrow" color={colors.text.secondary}>
                {primary.label}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.sportSummarySecondary}>
          {others.map((stat) => {
            const StatIcon = stat.Icon;
            return (
              <View key={stat.id} style={styles.sportSecondaryStat}>
                <StatIcon
                  size={14}
                  color={colors.brand.primary}
                  strokeWidth={2.25}
                />
                <Text variant="button" color={colors.text.primary}>
                  {stat.value}
                </Text>
                <Text variant="caption" color={colors.text.secondary}>
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
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

function FriendsCard({ onPress }: { onPress: () => void }) {
  return (
    <Card style={styles.friendsCard}>
      <View style={styles.friendsHeader}>
        <Text variant="h2" color={colors.text.primary}>
          Friends
        </Text>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}>
          <Text variant="button" color={colors.brand.primary}>
            Find more
          </Text>
        </Pressable>
      </View>
      <AvatarStack
        uris={PROFILE_FRIENDS.map((f) => f.avatar)}
        size={48}
        max={4}
      />
      <View style={styles.friendsFooter}>
        <Text variant="bodySm" color={colors.text.secondary}>
          {PROFILE_MUTUAL_COUNT} Mutual Connections
        </Text>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}>
          <View style={styles.viewAllBtn}>
            <Text variant="button" color={colors.brand.deep}>
              View all
            </Text>
          </View>
        </Pressable>
      </View>
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
      <ScreenHeader
        avatarUri={profile.avatar}
        title="Profile"
        hasNotifications={unreadCount > 0}
        onBellPress={() => navigation.navigate('Notifications')}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        hitSlop={8}
        onPress={() => navigation.navigate('Settings')}
        style={[styles.settingsBtn, { top: insets.top + 14 }]}
      >
        <Settings size={20} color={colors.text.primary} strokeWidth={2.25} />
      </Pressable>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={profile.name}
          handle={profile.handle}
          bio={profile.bio}
          avatarUri={profile.avatar}
          proMember={profile.proMember}
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
                  Unlimited highlights, unlimited stats history.
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
              {getStatsForSport(profile, activeSport).slice(0, 4).map((stat, idx) => (
                <StatCard
                  key={stat.id}
                  stat={stat}
                  style={[
                    styles.statHalf,
                    idx > 1 ? styles.statSpacedTop : null,
                  ]}
                />
              ))}
            </View>
          ) : (
            <Card style={styles.statsHidden}>
              <Text variant="bodySm" color={colors.text.secondary} align="center">
                Stats are hidden. Toggle "Show stats" in Edit Profile to share
                them with others.
              </Text>
            </Card>
          )}
        </View>

        <FriendsCard
          onPress={() => navigation.navigate('PlayerDirectory')}
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
  settingsBtn: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  bio: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
  },
  proChip: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.card,
    borderRadius: radii.pill,
    ...shadows.soft,
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
  sportSummaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.soft,
  },
  sportSummaryPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sportSummaryPrimaryText: {
    gap: 2,
  },
  sportSummarySecondary: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  sportSecondaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  statSpacedTop: {
    // gap on the parent already handles vertical rhythm; this style is a
    // placeholder for future per-row tweaks if a tablet breakpoint lands.
  },
  statsHidden: {
    paddingVertical: spacing.lg,
  },
  friendsCard: {
    gap: spacing.lg,
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  friendsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
