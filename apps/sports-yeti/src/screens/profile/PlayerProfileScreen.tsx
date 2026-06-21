import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MessageCircle, ShieldOff, UserPlus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
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
  PROFILE_USER,
  SPORT_META_BY_KEY,
  getPublicProfile,
  type PublicPlayerProfile,
  type SportPlayerProfile,
} from '../../mocks/profile';
import { SPORT_STAT_TEMPLATES } from '../../mocks/profile';
import type { SportKey } from '../../mocks/teams';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PlayerProfile'>;
type Route = RouteProp<RootStackParamList, 'PlayerProfile'>;

function SportStatsPanel({
  profile,
  sportKey,
}: {
  profile: PublicPlayerProfile;
  sportKey: SportKey;
}) {
  const template = SPORT_STAT_TEMPLATES[sportKey];
  const values = profile.statsBySport[sportKey] ?? {};
  return (
    <View style={styles.statsGrid}>
      {template.map((field) => {
        const Icon = field.Icon;
        const value = values[field.id] ?? 0;
        return (
          <Card
            key={field.id}
            padded
            style={[
              styles.statCard,
              field.primary ? styles.statCardPrimary : null,
            ]}
          >
            <IconBadge size={36} tone={field.primary ? 'brand' : 'soft'}>
              <Icon
                size={16}
                color={
                  field.primary ? colors.brand.deep : colors.brand.primary
                }
                strokeWidth={2.25}
              />
            </IconBadge>
            <Text variant="display" color={colors.text.primary}>
              {value}
            </Text>
            <Text variant="eyebrow" color={colors.text.secondary}>
              {field.label.toUpperCase()}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}

function SportProfileSummary({
  sportProfile,
}: {
  sportProfile: SportPlayerProfile;
}) {
  const meta = SPORT_META_BY_KEY[sportProfile.sportKey];
  const Icon = meta.Icon;
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
            <Tag tone="brand" size="sm" label={`${sportProfile.position} · Primary`} />
            {secondary.map((pos) => (
              <Tag key={pos} tone="neutral" size="sm" label={pos} />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.sportSummaryMeta}>
        {sportProfile.yearsPlaying ? (
          <Tag
            tone="info"
            size="sm"
            label={`${sportProfile.yearsPlaying} yrs playing`}
          />
        ) : null}
        {sportProfile.jerseyNumber ? (
          <Tag
            tone="info"
            size="sm"
            label={`Jersey #${sportProfile.jerseyNumber}`}
          />
        ) : null}
      </View>
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

  const sportProfiles = profile?.sportProfiles ?? [];
  const [activeSport, setActiveSport] = useState<SportKey>(
    sportProfiles[0]?.sportKey ?? 'soccer',
  );
  const activeSportProfile =
    sportProfiles.find((sp) => sp.sportKey === activeSport) ??
    sportProfiles[0];

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

  const tabs = sportProfiles.map((sp) => ({
    key: sp.sportKey,
    label: SPORT_META_BY_KEY[sp.sportKey].short,
  }));

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
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerCenter}>
            <Avatar uri={profile.avatar} initials={profile.name.charAt(0)} size={104} bordered />
            <Text variant="h1" color={colors.text.primary} align="center">
              {profile.name}
            </Text>
            <Text variant="body" color={colors.text.secondary} align="center">
              {profile.handle} · {profile.city}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary} align="center" style={styles.bio}>
              {profile.bio}
            </Text>
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
          <SportProfileSummary sportProfile={activeSportProfile} />
        ) : null}

        {profile.showStats ? (
          <View style={styles.statsBlock}>
            <View style={styles.sectionHeader}>
              <Text variant="h2" color={colors.text.primary}>
                Stats
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                Lifetime · {SPORT_META_BY_KEY[activeSport].label}
              </Text>
            </View>
            <SportStatsPanel profile={profile} sportKey={activeSport} />
          </View>
        ) : (
          <Card style={styles.statsHidden}>
            <Text variant="bodySm" color={colors.text.secondary} align="center">
              {isMe
                ? 'You hid your stats. Toggle "Show stats" in Edit Profile.'
                : 'This player hides their stats from public view.'}
            </Text>
          </Card>
        )}

        {!isMe ? (
          <View style={styles.actionRow}>
            <Button
              label="Message"
              variant="soft"
              size="lg"
              fullWidth
              leadingIcon={
                <MessageCircle size={16} color={colors.brand.primary} strokeWidth={2.25} />
              }
              onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate('Chat', {
                  chatId: `dm-${profile.playerId}`,
                  title: profile.name,
                });
              }}
            />
            <Button
              label="Invite"
              variant="gradient"
              size="lg"
              fullWidth
              leadingIcon={
                <UserPlus size={16} color={colors.text.inverse} strokeWidth={2.25} />
              }
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                toast.show({
                  variant: 'success',
                  title: `Invited ${profile.name}`,
                  description: 'They got an in-app notification.',
                });
              }}
            />
          </View>
        ) : null}
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
  bio: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
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
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
