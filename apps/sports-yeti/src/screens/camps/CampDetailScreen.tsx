import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  MapPin,
  Share2,
  ShieldCheck,
  UserRound,
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
  ProgressBar,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { SKILL_LABELS, sportLabel } from '../../mocks/games';
import { campById, type CampSession } from '../../mocks/camps';
import { formatCurrency } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CampDetails'>;
type Route = RouteProp<RootStackParamList, 'CampDetails'>;

export function CampDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const camp = campById(route.params.id);
  const [registered, setRegistered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!camp) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Camp not found"
          description="It may have been removed or you opened a stale link."
          primaryAction={{ label: 'Back to Discover', onPress: () => navigation.goBack() }}
        />
      </View>
    );
  }

  const Icon = camp.Icon;
  const sport = sportLabel(camp.sport);
  const isClosed = camp.status === 'closed';
  const spotsLeft = Math.max(0, camp.capacity - camp.registered);
  const fillRatio = camp.capacity > 0 ? camp.registered / camp.capacity : 0;
  const org = camp.organization;
  const shownRegistrants = camp.registrants.slice(0, 5);

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmOpen(false);
    setRegistered(true);
    toast.show({
      variant: 'success',
      title: isClosed ? 'Added to waitlist' : `Registered for ${camp.title}`,
      description: isClosed
        ? "We'll notify you if a spot opens."
        : `${camp.dateLabel} · ${camp.venueName}`,
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
            style={styles.iconBtn}
          >
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share camp"
            hitSlop={8}
            onPress={() => {
              Haptics.selectionAsync();
              toast.show({ variant: 'info', title: 'Share link copied' });
            }}
            style={styles.iconBtn}
          >
            <Share2 size={20} color={colors.text.primary} strokeWidth={2.25} />
          </Pressable>
        </View>

        <Image source={{ uri: camp.cover }} style={styles.cover} contentFit="cover" />

        <View style={styles.heroBlock}>
          <View style={styles.heroTags}>
            <Tag tone="brand" leadingDot label="Camp" />
            {sport ? <Tag tone="info" size="sm" label={sport} /> : null}
            <Tag tone="neutral" size="sm" label={SKILL_LABELS[camp.skillLevel]} />
            {isClosed ? <Tag tone="neutral" size="sm" label="Full" /> : null}
          </View>
          <View style={styles.heroRow}>
            <IconBadge size={64} tone="brand">
              <Icon size={28} color={colors.brand.deep} strokeWidth={2.25} />
            </IconBadge>
            <View style={styles.heroText}>
              <Text variant="h1" color={colors.text.primary}>
                {camp.title}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {camp.ageGroup} · {camp.city}
              </Text>
            </View>
            <Text variant="h2" color={colors.brand.primary} align="right">
              {camp.feeCents === 0 ? 'Free' : formatCurrency(camp.feeCents)}
            </Text>
          </View>
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <CalendarDays size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {camp.dateLabel}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {camp.sessionsLabel}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <MapPin size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {camp.venueName}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                {camp.address}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <CircleDollarSign size={18} color={colors.brand.primary} strokeWidth={2.25} />
            <View style={styles.detailBody}>
              <Text variant="button" color={colors.text.primary}>
                {camp.feeCents === 0 ? 'Free' : `${formatCurrency(camp.feeCents)} per athlete`}
              </Text>
              <Text variant="bodySm" color={colors.text.secondary}>
                Includes all {camp.schedule.length} sessions
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            About this camp
          </Text>
          <Text variant="body" color={colors.text.primary}>
            {camp.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Organization
          </Text>
          <Card style={styles.orgCard}>
            <View style={styles.orgHead}>
              <View style={styles.orgIcon}>
                <Building2 size={22} color={colors.brand.deep} strokeWidth={2.25} />
              </View>
              <View style={styles.orgHeadBody}>
                <View style={styles.orgNameRow}>
                  <Text variant="h3" color={colors.text.primary}>
                    {org.name}
                  </Text>
                  {org.verified ? (
                    <ShieldCheck size={16} color={colors.brand.primary} strokeWidth={2.5} />
                  ) : null}
                </View>
                <Text variant="caption" color={colors.text.secondary}>
                  Est. {org.foundedYear} · {org.campsRun} camps · ★ {org.rating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Text variant="bodySm" color={colors.text.secondary}>
              {org.tagline}
            </Text>
            <View style={styles.orgDivider} />
            <View style={styles.coachRow}>
              <Avatar uri={camp.organizerAvatar} initials={camp.organizer.charAt(0)} size={44} />
              <View style={styles.coachBody}>
                <View style={styles.coachNameRow}>
                  <UserRound size={14} color={colors.text.secondary} strokeWidth={2.25} />
                  <Text variant="button" color={colors.text.primary}>
                    {camp.organizer}
                  </Text>
                </View>
                <Text variant="caption" color={colors.text.secondary}>
                  {camp.organizerBio}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text variant="h2" color={colors.text.primary}>
            Schedule
          </Text>
          <Card style={styles.scheduleCard}>
            {camp.schedule.map((session, idx) => (
              <SessionRow
                key={session.id}
                session={session}
                showDivider={idx < camp.schedule.length - 1}
              />
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.registrantsHead}>
            <Text variant="h2" color={colors.text.primary}>
              Registrants
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {camp.registered}/{camp.capacity} registered
            </Text>
          </View>
          <Card style={styles.registrantsCard}>
            <ProgressBar
              value={fillRatio}
              tone={camp.spotsTone === 'warning' ? 'warning' : 'brand'}
              size="md"
            />
            <View style={styles.registrantsRow}>
              <AvatarStack
                uris={camp.registrants.map((r) => r.avatar)}
                totalCount={camp.registered}
                size={32}
              />
              <View style={styles.spotsPill}>
                <Users
                  size={13}
                  color={camp.spotsTone === 'warning' ? colors.status.live : colors.brand.primary}
                  strokeWidth={2.5}
                />
                <Text
                  variant="caption"
                  color={camp.spotsTone === 'warning' ? colors.status.live : colors.brand.primary}
                >
                  {isClosed ? 'Waitlist only' : `${spotsLeft} spots left`}
                </Text>
              </View>
            </View>
            <View style={styles.registrantList}>
              {shownRegistrants.map((r) => (
                <View key={r.id} style={styles.registrantItem}>
                  <Avatar uri={r.avatar} initials={r.name.charAt(0)} size={28} />
                  <Text variant="bodySm" color={colors.text.primary}>
                    {r.name}
                  </Text>
                </View>
              ))}
              {camp.registered > shownRegistrants.length ? (
                <Text variant="caption" color={colors.text.muted}>
                  +{camp.registered - shownRegistrants.length} more registered
                </Text>
              ) : null}
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {registered ? (
          <View style={styles.registeredRow}>
            <Tag tone="success" leadingDot label={isClosed ? 'On the waitlist' : "You're registered"} />
            <Button
              label="View in Schedule"
              variant="ghost"
              size="md"
              leadingIcon={
                <CalendarDays size={16} color={colors.brand.primary} strokeWidth={2.5} />
              }
              onPress={() => navigation.navigate('Schedule')}
            />
          </View>
        ) : (
          <Button
            label={
              isClosed
                ? 'Join waitlist'
                : camp.feeCents === 0
                ? 'Register'
                : `Register · ${formatCurrency(camp.feeCents)}`
            }
            variant="gradient"
            size="lg"
            fullWidth
            onPress={() => setConfirmOpen(true)}
          />
        )}
      </View>

      <Modal
        visible={confirmOpen}
        onRequestClose={() => setConfirmOpen(false)}
        variant={isClosed ? 'info' : 'success'}
        title={isClosed ? 'Join the waitlist?' : `Register for ${camp.title}`}
        description={
          isClosed
            ? "This camp is full. We'll notify you the moment a spot frees up."
            : camp.feeCents === 0
            ? `${camp.dateLabel} at ${camp.venueName}. You can cancel up to 48 hours before it starts.`
            : `${formatCurrency(camp.feeCents)} will be charged when you confirm. Refundable up to 48 hours before the first session.`
        }
        primaryAction={{
          label: isClosed ? 'Join waitlist' : 'Confirm',
          onPress: handleConfirm,
        }}
        secondaryAction={{ label: 'Not now', onPress: () => setConfirmOpen(false) }}
      />
    </View>
  );
}

function SessionRow({
  session,
  showDivider,
}: {
  session: CampSession;
  showDivider: boolean;
}) {
  return (
    <View>
      <View style={styles.sessionRow}>
        <View style={styles.sessionDayBadge}>
          <Text variant="caption" color={colors.brand.deep}>
            {session.label}
          </Text>
        </View>
        <View style={styles.sessionBody}>
          <Text variant="button" color={colors.text.primary}>
            {session.focus}
          </Text>
          <View style={styles.sessionMeta}>
            <CalendarDays size={13} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="caption" color={colors.text.secondary}>
              {session.date}
            </Text>
            <Clock size={13} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="caption" color={colors.text.secondary}>
              {session.time}
            </Text>
          </View>
        </View>
      </View>
      {showDivider ? <View style={styles.sessionDivider} /> : null}
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
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.lg,
    backgroundColor: colors.surface.chip,
  },
  heroBlock: {
    gap: spacing.lg,
  },
  heroTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  orgCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  orgHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orgIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgHeadBody: {
    flex: 1,
    gap: 2,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orgDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  coachBody: {
    flex: 1,
    gap: 2,
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scheduleCard: {
    padding: spacing.md,
    gap: 0,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  sessionDayBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    backgroundColor: colors.brand.soft,
    minWidth: 52,
    alignItems: 'center',
  },
  sessionBody: {
    flex: 1,
    gap: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  sessionDivider: {
    height: 1,
    backgroundColor: colors.border.soft,
  },
  registrantsHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  registrantsCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  registrantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  spotsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registrantList: {
    gap: spacing.sm,
  },
  registrantItem: {
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
  registeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
