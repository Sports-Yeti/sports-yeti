import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
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
  Chip,
  EmptyState,
  IconBadge,
  ScreenHeader,
  Tabs,
  Tag,
  Text,
} from '../../ui';
import {
  KIND_LABEL,
  addDays,
  dayKey,
  eventDayKeys,
  scheduleKindLabel,
  startOfWeek,
  upcomingEvents,
  type ScheduleEventKind,
  type ScheduledCamp,
  type ScheduledEvent,
  type ScheduledGame,
  type ScheduledScrimmage,
} from '../../mocks/schedule';
import { useMySchedule } from '../../features/schedule-store';
import type { RootStackParamList } from '../../navigation/MainNavigator';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type ViewMode = 'week' | 'upcoming';
type KindFilter = 'all' | ScheduleEventKind;

const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'upcoming', label: 'Upcoming' },
];

const KIND_CHIPS: { key: KindFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'game', label: 'Games' },
  { key: 'camp', label: 'Camps' },
  { key: 'scrimmage', label: 'Scrimmages' },
];

/** How far into the future the week pager can go. */
const MAX_WEEKS_AHEAD = 12;

// ---------- date formatting ----------

function monthDay(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function weekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${monthDay(weekStart)} – ${weekEnd.getDate()}`;
  }
  return `${monthDay(weekStart)} – ${monthDay(weekEnd)}`;
}

function weekRelativeLabel(offset: number): string {
  if (offset === 0) return 'This week';
  if (offset === 1) return 'Next week';
  return `In ${offset} weeks`;
}

function dayHeading(date: Date, todayKey: string): string {
  const key = dayKey(date);
  const base = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  if (key === todayKey) return `Today · ${base}`;
  if (key === dayKey(addDays(new Date(), 1))) return `Tomorrow · ${base}`;
  return base;
}

// ---------- week pager ----------

function WeekPager({
  weekStart,
  offset,
  onStep,
  onToday,
  eventCount,
}: {
  weekStart: Date;
  offset: number;
  onStep: (delta: 1 | -1) => void;
  onToday: () => void;
  eventCount: number;
}) {
  const atStart = offset === 0;
  const atEnd = offset === MAX_WEEKS_AHEAD;
  return (
    <View style={pagerStyles.root}>
      <View style={pagerStyles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous week"
          accessibilityState={{ disabled: atStart }}
          disabled={atStart}
          hitSlop={8}
          onPress={() => onStep(-1)}
          style={[pagerStyles.arrow, atStart ? pagerStyles.arrowDisabled : null]}
        >
          <ChevronLeft
            size={20}
            color={atStart ? colors.text.muted : colors.text.primary}
            strokeWidth={2.25}
          />
        </Pressable>
        <View style={pagerStyles.center} accessibilityLiveRegion="polite">
          <Text variant="h2" color={colors.text.primary} align="center">
            {weekRangeLabel(weekStart)}
          </Text>
          <Text variant="caption" color={colors.text.secondary} align="center">
            {weekRelativeLabel(offset)} ·{' '}
            {eventCount === 0
              ? 'no events'
              : `${eventCount} event${eventCount === 1 ? '' : 's'}`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next week"
          accessibilityState={{ disabled: atEnd }}
          disabled={atEnd}
          hitSlop={8}
          onPress={() => onStep(1)}
          style={[pagerStyles.arrow, atEnd ? pagerStyles.arrowDisabled : null]}
        >
          <ChevronRight
            size={20}
            color={atEnd ? colors.text.muted : colors.text.primary}
            strokeWidth={2.25}
          />
        </Pressable>
      </View>
      {offset > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jump back to today"
          hitSlop={6}
          onPress={onToday}
          style={pagerStyles.todayBtn}
        >
          <Text variant="button" color={colors.brand.primary}>
            Back to today
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const pagerStyles = StyleSheet.create({
  root: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  arrowDisabled: {
    opacity: 0.45,
  },
  center: {
    flex: 1,
    gap: 2,
  },
  todayBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});

// ---------- day strip ----------

function DayPill({
  date,
  selected,
  hasEvent,
  isPast,
  isToday,
  onPress,
}: {
  date: Date;
  selected: boolean;
  hasEvent: boolean;
  isPast: boolean;
  isToday: boolean;
  onPress: () => void;
}) {
  const weekday = date
    .toLocaleDateString(undefined, { weekday: 'short' })
    .toUpperCase();
  const eyebrowColor = selected
    ? colors.text.inverse
    : isPast
    ? colors.text.muted
    : colors.text.secondary;
  const dayColor = selected
    ? colors.text.inverse
    : isPast
    ? colors.text.muted
    : colors.text.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}${isToday ? ', today' : ''}${hasEvent ? ', has events' : ''}`}
      accessibilityState={{ selected }}
      style={[
        dayStyles.pill,
        selected ? dayStyles.pillSelected : dayStyles.pillIdle,
        selected ? shadows.soft : null,
        isToday && !selected ? dayStyles.pillToday : null,
        isPast && !selected ? dayStyles.pillPast : null,
      ]}
    >
      <Text variant="eyebrow" color={eyebrowColor}>
        {weekday}
      </Text>
      <Text variant="h3" color={dayColor} align="center">
        {date.getDate()}
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

const dayStyles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pillIdle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  pillToday: {
    borderColor: colors.brand.primary,
  },
  pillPast: {
    opacity: 0.7,
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

// ---------- event cards ----------

function CommitmentTag({ status }: { status: ScheduledEvent['commitment'] }) {
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Game: ${event.title}, ${event.time}, ${event.location}, ${event.commitment}`}
    >
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Camp: ${event.campTitle}, ${event.sessionLabel}, ${event.time}, ${event.location}, ${event.commitment}`}
    >
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Scrimmage: ${event.title}, ${event.time}, ${event.location}, ${event.commitment}`}
    >
      <Card style={styles.eventCard}>
        <View style={styles.kindHeader}>
          <View style={styles.kindLeft}>
            <Tag tone="warning" size="sm" label={scheduleKindLabel(event)} />
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

// ---------- screen ----------

function filterByKind(
  events: ScheduledEvent[],
  kind: KindFilter,
): ScheduledEvent[] {
  if (kind === 'all') return events;
  return events.filter((e) => e.kind === kind);
}

/**
 * Best day to preselect when landing on a week: today (current week), else
 * the first day with events, else the first day of the week.
 */
function defaultDayForWeek(
  weekStart: Date,
  eventDays: Set<string>,
  todayKey: string,
): string {
  const keys = Array.from({ length: 7 }, (_, i) => dayKey(addDays(weekStart, i)));
  if (keys.includes(todayKey) && eventDays.has(todayKey)) return todayKey;
  const firstEventDay = keys.find((k) => eventDays.has(k) && k >= todayKey);
  if (firstEventDay) return firstEventDay;
  if (keys.includes(todayKey)) return todayKey;
  return keys[0]!;
}

export function ScheduleScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const initials = (user?.name?.charAt(0) || 'S').toUpperCase();

  // Computed per render (keyed by the day string) so the Today highlight and
  // past-day dimming survive the tab staying mounted across midnight.
  const todayKey = dayKey(new Date());
  const currentWeekStart = useMemo(() => startOfWeek(new Date()), [todayKey]);

  const [view, setView] = useState<ViewMode>('week');
  const [kind, setKind] = useState<KindFilter>('all');
  const [weekOffset, setWeekOffset] = useState(0);

  // Seeded fixture + everything joined/registered/cancelled this session.
  const events = useMySchedule();
  const filteredAll = useMemo(
    () => filterByKind(events, kind),
    [events, kind],
  );
  const eventDays = useMemo(() => eventDayKeys(filteredAll), [filteredAll]);

  const weekStart = useMemo(
    () => addDays(currentWeekStart, weekOffset * 7),
    [currentWeekStart, weekOffset],
  );
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const [selectedDayKey, setSelectedDayKey] = useState<string>(() =>
    defaultDayForWeek(currentWeekStart, eventDayKeys(events), todayKey),
  );

  const goToWeek = (offset: number) => {
    const clamped = Math.max(0, Math.min(MAX_WEEKS_AHEAD, offset));
    setWeekOffset(clamped);
    setSelectedDayKey(
      defaultDayForWeek(
        addDays(currentWeekStart, clamped * 7),
        eventDays,
        todayKey,
      ),
    );
  };

  const changeKind = (next: KindFilter) => {
    setKind(next);
    // Keep the user's day selection unless the new filter empties it out.
    const nextDays = eventDayKeys(filterByKind(events, next));
    setSelectedDayKey((prev) =>
      nextDays.has(prev) ? prev : defaultDayForWeek(weekStart, nextDays, todayKey),
    );
  };

  const weekEvents = useMemo(() => {
    const startMs = weekStart.getTime();
    const endMs = addDays(weekStart, 7).getTime();
    return filteredAll.filter((e) => {
      const t = new Date(e.startsAt).getTime();
      return t >= startMs && t < endMs;
    });
  }, [filteredAll, weekStart]);

  const dayEvents = useMemo(
    () =>
      filteredAll
        .filter((e) => dayKey(new Date(e.startsAt)) === selectedDayKey)
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        ),
    [filteredAll, selectedDayKey],
  );

  const upcoming = useMemo(
    () => filterByKind(upcomingEvents(events), kind),
    [events, kind],
  );
  const upcomingGroups = useMemo(() => {
    const groups: { key: string; date: Date; events: ScheduledEvent[] }[] = [];
    for (const event of upcoming) {
      const date = new Date(event.startsAt);
      const key = dayKey(date);
      const existing = groups.find((g) => g.key === key);
      if (existing) existing.events.push(event);
      else groups.push({ key, date, events: [event] });
    }
    return groups;
  }, [upcoming]);

  const selectedDate = useMemo(
    () => weekDates.find((d) => dayKey(d) === selectedDayKey),
    [weekDates, selectedDayKey],
  );
  const lineupTitle = selectedDate
    ? selectedDayKey === todayKey
      ? "Today's Lineup"
      : `${selectedDate.toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
        })} Lineup`
    : 'Lineup';

  const openEvent = (event: ScheduledEvent) =>
    navigation.navigate('ScheduledEventDetail', { id: event.id });

  const emptyLineup =
    weekEvents.length === 0 ? (
      <EmptyState
        icon={
          <CalendarPlus size={28} color={colors.brand.primary} strokeWidth={2.25} />
        }
        title="Nothing scheduled this week"
        description="Browse Discover to find games, camps, and scrimmages to join — or host your own."
        primaryAction={{
          label: 'Find a game',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Discover' }),
        }}
        secondaryAction={{
          label: 'Host one',
          onPress: () => navigation.navigate('CreateGame'),
        }}
      />
    ) : (
      <EmptyState
        icon={
          <CalendarPlus size={28} color={colors.brand.primary} strokeWidth={2.25} />
        }
        title="Nothing on this day"
        description="Pick a highlighted day to see what you've committed to."
      />
    );

  return (
    <View style={styles.root}>
      <ScreenHeader
        initials={initials}
        title="Schedule"
        hasNotifications
        onAvatarPress={() => navigation.navigate('Profile')}
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
        <Tabs
          variant="segmented"
          items={VIEW_TABS.map((t) =>
            t.key === 'upcoming'
              ? {
                  ...t,
                  badge: String(upcoming.length),
                  accessibilityLabel: `Upcoming, ${upcoming.length} event${upcoming.length === 1 ? '' : 's'}`,
                }
              : t,
          )}
          value={view}
          onChange={(k) => setView(k as ViewMode)}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {KIND_CHIPS.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              selected={kind === chip.key}
              onPress={() => changeKind(chip.key)}
            />
          ))}
        </ScrollView>

        {view === 'week' ? (
          <>
            <WeekPager
              weekStart={weekStart}
              offset={weekOffset}
              onStep={(delta) => goToWeek(weekOffset + delta)}
              onToday={() => goToWeek(0)}
              eventCount={weekEvents.length}
            />

            <View style={styles.dayStrip}>
              {weekDates.map((date) => {
                const key = dayKey(date);
                return (
                  <DayPill
                    key={key}
                    date={date}
                    selected={key === selectedDayKey}
                    hasEvent={eventDays.has(key)}
                    isPast={key < todayKey}
                    isToday={key === todayKey}
                    onPress={() => setSelectedDayKey(key)}
                  />
                );
              })}
            </View>

            <View style={styles.section}>
              <Text variant="h1" color={colors.text.primary}>
                {lineupTitle}
              </Text>
              <View style={styles.cardsColumn}>
                {dayEvents.length === 0
                  ? emptyLineup
                  : dayEvents.map((event) => (
                      <EventCardSwitch
                        key={event.id}
                        event={event}
                        onPress={() => openEvent(event)}
                      />
                    ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            {upcomingGroups.length === 0 ? (
              <EmptyState
                icon={
                  <CalendarPlus
                    size={28}
                    color={colors.brand.primary}
                    strokeWidth={2.25}
                  />
                }
                title={
                  kind === 'all'
                    ? 'Nothing coming up'
                    : `No upcoming ${KIND_CHIPS.find((c) => c.key === kind)?.label.toLowerCase() ?? 'events'}`
                }
                description="Browse Discover to find something to join — or host your own game."
                primaryAction={{
                  label: 'Find a game',
                  onPress: () =>
                    navigation.navigate('MainTabs', { screen: 'Discover' }),
                }}
                secondaryAction={
                  kind !== 'all'
                    ? { label: 'Show all kinds', onPress: () => changeKind('all') }
                    : {
                        label: 'Host one',
                        onPress: () => navigation.navigate('CreateGame'),
                      }
                }
              />
            ) : (
              upcomingGroups.map((group) => (
                <View key={group.key} style={styles.agendaGroup}>
                  <Text variant="h2" color={colors.text.primary}>
                    {dayHeading(group.date, todayKey)}
                  </Text>
                  <View style={styles.cardsColumn}>
                    {group.events.map((event) => (
                      <EventCardSwitch
                        key={event.id}
                        event={event}
                        onPress={() => openEvent(event)}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
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
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  dayStrip: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  section: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  agendaGroup: {
    gap: spacing.md,
    marginBottom: spacing.md,
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
