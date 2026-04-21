import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarPlus,
  Clock,
  MapPin,
  Plus,
  Users,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  AvatarStack,
  Card,
  EmptyState,
  IconBadge,
  ScreenHeader,
  Tag,
  Text,
} from '../../ui';
import {
  KIND_LABEL,
  WEEK_DAYS,
  daysWithEvents,
  eventsForDay,
  type DayCell,
  type ScheduledCamp,
  type ScheduledEvent,
  type ScheduledGame,
  type ScheduledScrimmage,
} from '../../mocks/schedule';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function DayPill({
  day,
  selected,
  hasEvent,
  onPress,
}: {
  day: DayCell;
  selected: boolean;
  hasEvent: boolean;
  onPress: () => void;
}) {
  const eyebrowColor = selected
    ? colors.text.inverse
    : day.isPast
    ? colors.text.muted
    : colors.text.secondary;
  const dayColor = selected
    ? colors.text.inverse
    : day.isPast
    ? colors.text.muted
    : colors.text.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${day.weekday} ${day.day}${day.isToday ? ', today' : ''}${hasEvent ? ', has events' : ''}`}
      accessibilityState={{ selected }}
      style={[
        dayStyles.pill,
        selected ? dayStyles.pillSelected : dayStyles.pillIdle,
        selected ? shadows.soft : null,
        day.isPast && !selected ? dayStyles.pillPast : null,
      ]}
    >
      <Text variant="eyebrow" color={eyebrowColor}>
        {day.weekday}
      </Text>
      <Text variant="h2" color={dayColor} align="center">
        {day.day}
      </Text>
      <View
        style={[
          dayStyles.dot,
          {
            backgroundColor: hasEvent
              ? selected
                ? colors.text.inverse
                : colors.brand.primary
              : 'transparent',
          },
        ]}
      />
    </Pressable>
  );
}

function CommitmentTag({
  status,
}: {
  status: ScheduledEvent['commitment'];
}) {
  return status === 'paid' ? (
    <Tag tone="success" size="sm" leadingDot label="Paid" />
  ) : (
    <Tag tone="brand" size="sm" leadingDot label="Committed" />
  );
}

function EventMetaRow({ event }: { event: ScheduledEvent }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Clock size={14} color={colors.text.secondary} strokeWidth={2.25} />
        <Text variant="bodySm" color={colors.text.primary}>
          {event.time}
        </Text>
      </View>
      <View style={styles.metaItem}>
        <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
        <Text
          variant="bodySm"
          color={colors.text.primary}
          numberOfLines={1}
          style={styles.metaText}
        >
          {event.location}
        </Text>
      </View>
    </View>
  );
}

function GameCard({
  event,
  onPress,
}: {
  event: ScheduledGame;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card glow={event.isLive} style={styles.eventCard}>
        <View style={styles.kindHeader}>
          <View style={styles.kindLeft}>
            <Tag tone="brand" size="sm" label={KIND_LABEL.game} />
            {event.isLive ? (
              <Tag tone="live" size="sm" leadingDot label="Live now" />
            ) : null}
          </View>
          <CommitmentTag status={event.commitment} />
        </View>
        <Text variant="eyebrow" color={colors.brand.primary}>
          {event.league}
        </Text>
        <View style={styles.matchupRow}>
          <View style={styles.teamColumn}>
            <View style={styles.crest}>
              <Text variant="h3" color={colors.brand.primary} align="center">
                {event.homeTeam.abbreviation}
              </Text>
            </View>
            <Text
              variant="button"
              color={colors.text.primary}
              align="center"
              numberOfLines={2}
            >
              {event.homeTeam.name}
            </Text>
          </View>
          <Text variant="h1" color={colors.text.secondary}>
            VS
          </Text>
          <View style={styles.teamColumn}>
            <View style={styles.crest}>
              <Text variant="h3" color={colors.brand.primary} align="center">
                {event.awayTeam.abbreviation}
              </Text>
            </View>
            <Text
              variant="button"
              color={colors.text.primary}
              align="center"
              numberOfLines={2}
            >
              {event.awayTeam.name}
            </Text>
          </View>
        </View>
        <EventMetaRow event={event} />
      </Card>
    </Pressable>
  );
}

function CampCard({
  event,
  onPress,
}: {
  event: ScheduledCamp;
  onPress: () => void;
}) {
  const Icon = event.Icon;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.eventCard}>
        <View style={styles.kindHeader}>
          <View style={styles.kindLeft}>
            <Tag tone="info" size="sm" label={KIND_LABEL.camp} />
            <Text variant="eyebrow" color={colors.text.secondary}>
              {event.sportLabel.toUpperCase()}
            </Text>
          </View>
          <CommitmentTag status={event.commitment} />
        </View>
        <View style={styles.titleBlock}>
          <IconBadge size={48}>
            <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
          </IconBadge>
          <View style={styles.titleColumn}>
            <Text variant="h3" color={colors.text.primary}>
              {event.campTitle}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              {event.sessionLabel}
            </Text>
          </View>
        </View>
        <EventMetaRow event={event} />
        <View style={styles.attendeeRow}>
          <AvatarStack
            uris={event.attendees}
            totalCount={event.attendeeTotal}
            size={28}
          />
          <View style={styles.attendeeMeta}>
            <Users size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="bodySm" color={colors.text.secondary}>
              {event.attendeeTotal} athletes
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

function ScrimmageCard({
  event,
  onPress,
}: {
  event: ScheduledScrimmage;
  onPress: () => void;
}) {
  const Icon = event.Icon;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.eventCard}>
        <View style={styles.kindHeader}>
          <View style={styles.kindLeft}>
            <Tag tone="warning" size="sm" label={KIND_LABEL.scrimmage} />
            <Text variant="eyebrow" color={colors.text.secondary}>
              {event.sportLabel.toUpperCase()}
            </Text>
          </View>
          <CommitmentTag status={event.commitment} />
        </View>
        <View style={styles.titleBlock}>
          <IconBadge size={48}>
            <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
          </IconBadge>
          <View style={styles.titleColumn}>
            <Text variant="h3" color={colors.text.primary}>
              {event.title}
            </Text>
            <Text variant="bodySm" color={colors.text.secondary}>
              Hosted by {event.hostName}
            </Text>
          </View>
        </View>
        <EventMetaRow event={event} />
        <View style={styles.attendeeRow}>
          <AvatarStack
            uris={event.attendees}
            totalCount={event.attendeeTotal}
            size={28}
          />
          <Text variant="bodySm" color={colors.text.secondary}>
            {event.attendeeTotal}/{event.spotsTotal} going
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

function EventCardSwitch({
  event,
  onPress,
}: {
  event: ScheduledEvent;
  onPress: () => void;
}) {
  switch (event.kind) {
    case 'game':
      return <GameCard event={event} onPress={onPress} />;
    case 'camp':
      return <CampCard event={event} onPress={onPress} />;
    case 'scrimmage':
      return <ScrimmageCard event={event} onPress={onPress} />;
  }
}

export function ScheduleScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const todayId = WEEK_DAYS.find((d) => d.isToday)?.id ?? WEEK_DAYS[0]!.id;
  const eventDays = useMemo(() => daysWithEvents(), []);
  // Default to today, but if today has no events fall back to the first
  // upcoming day that does — gives the user immediate signal on launch.
  const initialDayId = useMemo(() => {
    if (eventDays.has(todayId)) return todayId;
    const upcoming = WEEK_DAYS.find(
      (d) => !d.isPast && eventDays.has(d.id),
    );
    return upcoming?.id ?? todayId;
  }, [eventDays, todayId]);
  const [selectedDayId, setSelectedDayId] = useState<string>(initialDayId);

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();
  const events = useMemo(() => eventsForDay(selectedDayId), [selectedDayId]);
  const selectedDay = WEEK_DAYS.find((d) => d.id === selectedDayId);
  const sectionTitle =
    selectedDayId === todayId
      ? "Today's Lineup"
      : `${selectedDay?.weekday ?? ''} ${selectedDay?.day ?? ''} Lineup`;

  const handleEventPress = (event: ScheduledEvent) => {
    navigation.navigate('ScheduledEventDetail', { id: event.id });
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        initials={initials}
        hasNotifications
        onAvatarPress={() => navigation.navigate('Profile' as never)}
        onBellPress={() => navigation.navigate('Notifications')}
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
          <Text variant="displaySm" color={colors.brand.primary}>
            Schedule
          </Text>
          <Text
            variant="body"
            color={colors.text.secondary}
            style={styles.heroSubtitle}
          >
            Games, camp sessions, and scrimmages you’re committed to.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekRow}
        >
          {WEEK_DAYS.map((day) => (
            <DayPill
              key={day.id}
              day={day}
              selected={day.id === selectedDayId}
              hasEvent={eventDays.has(day.id)}
              onPress={() => setSelectedDayId(day.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.section}>
          <Text variant="h1" color={colors.text.primary}>
            {sectionTitle}
          </Text>
          <View style={styles.cardsColumn}>
            {events.length === 0 ? (
              <EmptyState
                icon={
                  <CalendarPlus
                    size={28}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                }
                title="Nothing on this day"
                description="You haven’t committed to any games, camps, or scrimmages on this day."
                primaryAction={{
                  label: 'Find a game',
                  onPress: () => navigation.navigate('Discover' as never),
                }}
                secondaryAction={{
                  label: 'Host one',
                  onPress: () => navigation.navigate('CreateGame'),
                }}
              />
            ) : (
              events.map((event) => (
                <EventCardSwitch
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Host a new game"
        onPress={() => navigation.navigate('CreateGame')}
        style={[styles.fab, shadows.card, { bottom: insets.bottom + 110 }]}
      >
        <Plus size={20} color={colors.text.inverse} strokeWidth={2.5} />
        <Text variant="button" color={colors.text.inverse}>
          Host a game
        </Text>
      </Pressable>
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
  weekRow: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  section: {
    gap: spacing.lg,
  },
  cardsColumn: {
    gap: spacing.lg,
  },
  eventCard: {
    gap: spacing.md,
  },
  kindHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  kindLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  teamColumn: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 110,
  },
  crest: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  attendeeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.brand.primary,
  },
});

const dayStyles = StyleSheet.create({
  pill: {
    width: 56,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pillIdle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  pillPast: {
    opacity: 0.55,
  },
  pillSelected: {
    backgroundColor: colors.brand.primary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
});
