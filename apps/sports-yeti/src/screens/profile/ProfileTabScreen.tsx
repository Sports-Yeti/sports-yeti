import React from 'react';
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
import { ChevronRight, LogOut, Pencil, Settings } from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  AvatarStack,
  Button,
  Card,
  IconBadge,
  ScreenHeader,
  Text,
} from '../../ui';
import {
  PROFILE_ACTIVITY,
  PROFILE_FRIENDS,
  PROFILE_MORE_LINKS,
  PROFILE_MUTUAL_COUNT,
  PROFILE_STATS,
  PROFILE_USER,
  type ActivityItem,
  type ProfileStat,
} from '../../mocks/profile';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function ProfileHeader({
  name,
  handle,
  avatarUri,
  proMember,
}: {
  name: string;
  handle: string;
  avatarUri: string;
  proMember: boolean;
}) {
  return (
    <Card style={styles.headerCard}>
      <View style={styles.headerEditRow}>
        <View />
        <Pressable
          accessibilityRole="button"
          style={styles.editBtn}
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
      <Text variant="eyebrow" color={colors.text.muted}>
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
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text variant="button" color={colors.brand.primary}>
            Find More
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
        <Pressable accessibilityRole="button" onPress={onPress}>
          <View style={styles.viewAllBtn}>
            <Text variant="button" color={colors.brand.deep}>
              View All
            </Text>
          </View>
        </Pressable>
      </View>
    </Card>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = item.Icon;
  return (
    <View style={styles.activityRow}>
      <View
        style={[
          styles.activityIcon,
          item.type === 'invite' ? styles.activityInvite : null,
        ]}
      >
        <Icon
          size={20}
          color={
            item.type === 'invite' ? colors.text.inverse : colors.brand.primary
          }
          strokeWidth={2.25}
        />
      </View>
      <View style={styles.activityBody}>
        <View style={styles.activityHeaderRow}>
          <Text variant="button" color={colors.text.primary} style={styles.activityTitle}>
            {item.title}
          </Text>
          <Text variant="caption" color={colors.text.muted}>
            {item.timestamp}
          </Text>
        </View>
        <Text variant="bodySm" color={colors.text.secondary}>
          {item.body}
        </Text>
        {item.actions ? (
          <View style={styles.activityActions}>
            {item.actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                size="sm"
                variant={action.primary ? 'gradient' : 'soft'}
                onPress={() => undefined}
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
}: {
  onLink: (route: keyof RootStackParamList) => void;
  onLogout: () => void;
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
          return (
            <Pressable
              key={link.id}
              accessibilityRole="button"
              onPress={() => onLink(link.route)}
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
              <ChevronRight
                size={18}
                color={colors.text.muted}
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

  const profile = {
    name: user?.name ?? PROFILE_USER.name,
    handle: PROFILE_USER.handle,
    avatar: PROFILE_USER.avatar,
    proMember: PROFILE_USER.proMember,
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        avatarUri={profile.avatar}
        title="Profile"
        hasNotifications
      />
      <View style={styles.settingsBtnWrap} pointerEvents="box-none">
        <Pressable
          style={[styles.settingsBtn, { top: insets.top + 14 }]}
          accessibilityRole="button"
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
          name={profile.name}
          handle={profile.handle}
          avatarUri={profile.avatar}
          proMember={profile.proMember}
        />

        <View style={styles.statsRow}>
          <StatCard stat={PROFILE_STATS[0]!} style={styles.statHalf} />
          <StatCard stat={PROFILE_STATS[1]!} style={styles.statHalf} />
        </View>
        <StatCard stat={PROFILE_STATS[2]!} style={styles.statFull} />

        <FriendsCard
          onPress={() => navigation.navigate('PlayerDirectory')}
        />

        <View style={styles.activityBlock}>
          <View style={styles.activityHeader}>
            <Text variant="h2" color={colors.text.primary}>
              Recent Activity
            </Text>
            <Pressable accessibilityRole="button">
              <Text variant="button" color={colors.brand.primary}>
                Mark all read
              </Text>
            </Pressable>
          </View>
          <Card style={styles.activityCard}>
            {PROFILE_ACTIVITY.map((activity, idx) => (
              <View
                key={activity.id}
                style={[
                  styles.activityWrapper,
                  idx > 0 ? styles.activityWrapperDivider : null,
                ]}
              >
                <ActivityRow item={activity} />
              </View>
            ))}
          </Card>
        </View>

        <MoreLinksCard
          onLink={(route) => navigation.navigate(route as never)}
          onLogout={logout}
        />
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
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  settingsBtnWrap: {
    position: 'absolute',
    top: 0,
    right: 24,
    zIndex: 10,
  },
  settingsBtn: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  headerCenter: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  proChip: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.card,
    borderRadius: radii.pill,
    ...shadows.soft,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statCard: {
    gap: spacing.md,
    padding: spacing.xl,
  },
  statHalf: {
    flex: 1,
  },
  statFull: {
    width: '100%',
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
  },
  linkDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  linkText: {
    flex: 1,
    gap: 2,
  },
  logoutBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
});
