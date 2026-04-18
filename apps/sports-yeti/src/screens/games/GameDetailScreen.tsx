import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  CalendarPlus,
  ChevronLeft,
  Clock,
  MapPin,
  Share2,
  Shield,
  Users,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  Avatar,
  AvatarStack,
  Button,
  Card,
  EmptyState,
  IconBadge,
  Modal,
  Tag,
  Text,
  useToast,
} from '../../ui';
import {
  COMMON_GAME_RULES,
  DISCOVER_GAMES,
  GAME_HOSTS,
  SARAH_HOST,
  SKILL_LABELS,
} from '../../mocks/games';
import { FACILITIES } from '../../mocks/facilities';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'GameDetails'>;
type Route = RouteProp<RootStackParamList, 'GameDetails'>;

export function GameDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const game = DISCOVER_GAMES.find((g) => g.id === route.params.id);
  const [joined, setJoined] = useState(false);
  const [confirmJoin, setConfirmJoin] = useState(false);

  if (!game) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Game not found"
          description="It may have been cancelled or you opened a stale link."
          primaryAction={{
            label: 'Back to Discover',
            onPress: () => navigation.goBack(),
          }}
        />
      </View>
    );
  }

  const host = GAME_HOSTS[game.hostId] ?? SARAH_HOST;
  const venue = FACILITIES.find((f) => f.id === game.venueId);
  const Icon = game.Icon;
  const spotsTone = game.spotsLeft <= 2 ? 'warning' : 'brand';

  const handleJoin = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setJoined(true);
    setConfirmJoin(false);
    toast.show({
      variant: 'success',
      title: `You're in for ${game.title}`,
      description: `${game.time} · ${game.location}`,
      action: {
        label: 'Add to schedule',
        onPress: () => navigation.navigate('Schedule' as never),
      },
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share game"
            hitSlop={8}
            onPress={() => {
              Haptics.selectionAsync();
              toast.show({ variant: 'info', title: 'Share link copied' });
            }}
            style={styles.shareBtn}
          >
            <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        </View>

        <View style={styles.heroBlock}>
          <View style={styles.heroTop}>
            {game.isLive ? (
              <Tag tone="live" leadingDot label="Live now" />
            ) : (
              <Tag tone="brand" label={game.status} />
            )}
            <Text variant="bodySm" color={colors.text.secondary}>
              {game.distance} away
            </Text>
          </View>
          <View style={styles.heroRow}>
            <IconBadge size={64} tone="brand">
              <Icon size={28} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.heroText}>
              <Text variant="h1" color={colors.text.primary}>
                {game.title}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {SKILL_LABELS[game.skillLevel]} · {Math.round(game.durationMinutes / 60 * 10) / 10}h
              </Text>
            </View>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {game.priceCents === 0 ? 'Free' : formatCurrency(game.priceCents)}
            </Text>
          </View>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Clock size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {game.time}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {new Date(game.startsAt).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <MapPin size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {game.location}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {venue ? `${venue.city} · ${venue.distanceMiles} mi away` : game.distance}
              </Text>
            </View>
            {venue ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${venue.name}`}
                hitSlop={8}
                onPress={() =>
                  navigation.navigate('FacilityDetails', { id: venue.id })
                }
              >
                <Text variant="button" color={colors.brand.primary}>
                  Venue
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Users size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {game.attendeeTotal}/{game.spotsTotal} going
              </Text>
              <Text variant="bodySm" color={spotsTone === 'warning' ? colors.status.live : colors.text.secondary}>
                {game.spotsLeft} spot{game.spotsLeft === 1 ? '' : 's'} left
              </Text>
            </View>
            <AvatarStack uris={game.attendees} totalCount={game.attendeeTotal} size={28} />
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Hosted by
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${host.name}'s profile`}
            style={styles.hostRow}
            onPress={() => toast.show({ variant: 'info', title: `${host.name}'s profile` })}
          >
            <Avatar uri={host.avatar} initials={host.name.charAt(0)} size={56} />
            <View style={styles.hostBody}>
              <Text variant="h3" color={colors.text.primary}>
                {host.name}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {host.hosted} games hosted · ★ {host.rating.toFixed(1)}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            About this game
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {game.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            House rules
          </Text>
          <View style={styles.rulesList}>
            {COMMON_GAME_RULES.map((rule) => (
              <Card key={rule.id} style={styles.ruleCard}>
                <View style={styles.ruleHead}>
                  <Shield size={18} color={colors.brand.primary} strokeWidth={2.25} />
                  <Text variant="button" color={colors.text.primary}>
                    {rule.label}
                  </Text>
                </View>
                <Text variant="bodySm" color={colors.text.secondary}>
                  {rule.detail}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {joined ? (
          <View style={styles.joinedRow}>
            <Tag tone="success" leadingDot label="You're in" />
            <Button
              label="View in Schedule"
              variant="ghost"
              size="md"
              leadingIcon={
                <CalendarPlus
                  size={16}
                  color={colors.brand.primary}
                  strokeWidth={2.5}
                />
              }
              onPress={() => navigation.navigate('Schedule' as never)}
            />
          </View>
        ) : (
          <Button
            label={
              game.priceCents === 0
                ? `Join ${game.title}`
                : `Join · ${formatCurrency(game.priceCents)}`
            }
            variant="gradient"
            size="lg"
            fullWidth
            onPress={() => setConfirmJoin(true)}
          />
        )}
      </View>

      <Modal
        visible={confirmJoin}
        onRequestClose={() => setConfirmJoin(false)}
        variant="info"
        title={`Confirm spot at ${game.title}`}
        description={
          game.priceCents === 0
            ? `${game.time} at ${game.location}. You can cancel up to 2 hours before kickoff.`
            : `${formatCurrency(game.priceCents)} will be charged when you confirm. Refundable up to 24 hours before.`
        }
        primaryAction={{ label: 'Confirm', onPress: handleJoin }}
        secondaryAction={{
          label: 'Not now',
          onPress: () => setConfirmJoin(false),
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
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroBlock: {
    gap: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  detailsCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailBody: {
    flex: 1,
    gap: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  section: {
    gap: spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  hostBody: {
    flex: 1,
    gap: 2,
  },
  rulesList: {
    gap: spacing.md,
  },
  ruleCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  ruleHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
