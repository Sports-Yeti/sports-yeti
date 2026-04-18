import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CalendarPlus,
  Clock,
  MapPin,
  Plus,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  AvatarStack,
  Button,
  Card,
  EmptyState,
  IconBadge,
  ScreenHeader,
  Tag,
  Text,
} from '../../ui';
import {
  WEEK_DAYS,
  eventsForDay,
  type DayCell,
  type DropInSession,
  type PracticeSession,
  type ScheduleEvent,
  type ScheduleMatch,
} from '../../mocks/schedule';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function DayPill({
  day,
  selected,
  onPress,
}: {
  day: DayCell;
  selected: boolean;
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
      accessibilityLabel={`${day.weekday} ${day.day}${day.isToday ? ', today' : ''}`}
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
    </Pressable>
  );
}

function TeamCrest({ abbreviation }: { abbreviation: string }) {
  return (
    <View style={styles.crest}>
      <Text variant="h3" color={colors.brand.primary} align="center">
        {abbreviation}
      </Text>
    </View>
  );
}

function MatchEventCard({
  event,
  onPress,
}: {
  event: ScheduleMatch;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card glow={event.isLive} style={styles.matchCard}>
        <View style={styles.matchHeaderRow}>
          {event.isLive ? (
            <Tag tone="live" leadingDot label="Live now" size="sm" />
          ) : (
            <Text variant="eyebrow" color={colors.brand.primary}>
              {event.league}
            </Text>
          )}
          <Text variant="bodySm" color={colors.text.secondary}>
            {event.time}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <MapPin size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="bodySm" color={colors.text.secondary}>
            {event.location}
          </Text>
        </View>
        <View style={styles.matchupRow}>
          <View style={styles.teamColumn}>
            <TeamCrest abbreviation={event.homeTeam.abbreviation} />
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
            <TeamCrest abbreviation={event.awayTeam.abbreviation} />
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
      </Card>
    </Pressable>
  );
}

function DropInEventCard({
  event,
  onPress,
}: {
  event: DropInSession;
  onPress: () => void;
}) {
  const Icon = event.Icon;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.dropInCard}>
        <View style={styles.matchHeaderRow}>
          <View style={styles.metaRow}>
            <Clock size={14} color={colors.text.secondary} strokeWidth={2.25} />
            <Text variant="button" color={colors.text.primary}>
              {event.time}
            </Text>
          </View>
          <Text variant="bodySm" color={colors.text.secondary}>
            {event.location}
          </Text>
        </View>
        <Text variant="eyebrow" color={colors.brand.primary}>
          DROP-IN
        </Text>
        <View style={styles.dropInRow}>
          <View style={styles.dropInLeft}>
            <IconBadge size={48}>
              <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
            </IconBadge>
            <Text variant="h3" color={colors.text.primary}>
              {event.label}
            </Text>
          </View>
          <AvatarStack
            uris={event.attendees}
            totalCount={event.attendeeTotal}
            size={32}
          />
        </View>
      </Card>
    </Pressable>
  );
}

function PracticeEventCard({ event }: { event: PracticeSession }) {
  const Icon = event.Icon;
  return (
    <Card style={styles.dropInCard}>
      <View style={styles.matchHeaderRow}>
        <View style={styles.metaRow}>
          <Clock size={14} color={colors.text.secondary} strokeWidth={2.25} />
          <Text variant="button" color={colors.text.primary}>
            {event.time}
          </Text>
        </View>
        <Text variant="bodySm" color={colors.text.secondary}>
          {event.location}
        </Text>
      </View>
      <Text variant="eyebrow" color={colors.brand.primary}>
        PRACTICE · {event.team.toUpperCase()}
      </Text>
      <View style={styles.dropInRow}>
        <View style={styles.dropInLeft}>
          <IconBadge size={48}>
            <Icon size={22} color={colors.brand.primary} strokeWidth={2.25} />
          </IconBadge>
          <Text variant="h3" color={colors.text.primary}>
            {event.label}
          </Text>
        </View>
        <AvatarStack
          uris={event.attendees}
          totalCount={event.attendeeTotal}
          size={32}
        />
      </View>
    </Card>
  );
}

function NeedMatchCta({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <LinearGradient
        colors={[...colors.gradient.cta]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cta, shadows.card]}
      >
        <Text variant="h2" color={colors.text.inverse}>
          Need a Match?
        </Text>
        <Text
          variant="bodySm"
          color={colors.text.inverse}
          style={styles.ctaCopy}
        >
          Book a facility, invite players, and request a ref. Let's get the
          game going.
        </Text>
        <Button
          label="Create Scrimmage"
          variant="soft"
          size="md"
          onPress={onPress}
          leadingIcon={
            <Plus size={16} color={colors.brand.deep} strokeWidth={2.5} />
          }
          style={styles.ctaButton}
        />
      </LinearGradient>
    </Pressable>
  );
}

export function ScheduleScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const todayId = WEEK_DAYS.find((d) => d.isToday)?.id ?? WEEK_DAYS[0]!.id;
  const [selectedDayId, setSelectedDayId] = useState<string>(todayId);

  const initials = (user?.name?.charAt(0) ?? 'S').toUpperCase();
  const events = useMemo(() => eventsForDay(selectedDayId), [selectedDayId]);
  const selectedDay = WEEK_DAYS.find((d) => d.id === selectedDayId);
  const sectionTitle =
    selectedDayId === todayId
      ? "Today's Lineup"
      : `${selectedDay?.weekday ?? ''} ${selectedDay?.day ?? ''} Lineup`;

  const handleEventPress = (event: ScheduleEvent) => {
    if (event.kind === 'practice') return;
    if (event.gameId) {
      navigation.navigate('GameDetails', { id: event.gameId });
    }
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
            Your upcoming matches, practices, and drop-ins.
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
                description="Find a pickup game, host one of your own, or book a facility."
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
              <>
                {events.map((event) => {
                  if (event.kind === 'match') {
                    return (
                      <MatchEventCard
                        key={event.id}
                        event={event}
                        onPress={() => handleEventPress(event)}
                      />
                    );
                  }
                  if (event.kind === 'dropIn') {
                    return (
                      <DropInEventCard
                        key={event.id}
                        event={event}
                        onPress={() => handleEventPress(event)}
                      />
                    );
                  }
                  return <PracticeEventCard key={event.id} event={event} />;
                })}
                <NeedMatchCta onPress={() => navigation.navigate('CreateGame')} />
              </>
            )}
          </View>
        </View>
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
  matchCard: {
    gap: spacing.md,
  },
  matchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
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
  dropInCard: {
    gap: spacing.md,
  },
  dropInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  cta: {
    borderRadius: radii.cardLg,
    padding: spacing.xxl,
    gap: spacing.md,
    overflow: 'hidden',
  },
  ctaCopy: {
    opacity: 0.9,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
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
});
