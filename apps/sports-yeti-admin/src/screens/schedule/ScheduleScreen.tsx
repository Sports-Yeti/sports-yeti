import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { type WebPressableState } from '../../lib/pressable';
import { useNavigation } from '@react-navigation/native';
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Wand2,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import { Button, Card, EmptyState, Tabs, Tag, Text, useToast } from '../../ui';
import { colors, radii, spacing } from '../../theme';
import {
  GAMES,
  STATUS_LABEL,
  type Game,
  type GameStatus,
} from '../../mocks/games';
import { LEAGUES } from '../../mocks/leagues';
import { formatDate, formatTime } from '../../lib/format';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<GameStatus, 'live' | 'success' | 'warning' | 'brand' | 'neutral'> = {
  live: 'live',
  scheduled: 'brand',
  completed: 'success',
  cancelled: 'neutral',
  postponed: 'warning',
};

const TABS = [
  { key: 'week', label: 'Week' },
  { key: 'list', label: 'List' },
];

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day + 6) % 7; // Monday-first
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function ScheduleScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [view, setView] = useState('week');
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date('2026-04-19')));
  const [leagueFilter, setLeagueFilter] = useState<string>('all');

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const visibleGames = useMemo(() => {
    return GAMES.filter((g) =>
      leagueFilter === 'all' ? true : g.leagueId === leagueFilter,
    );
  }, [leagueFilter]);

  const gamesByDay = useMemo(() => {
    const map = new Map<string, Game[]>();
    for (const g of visibleGames) {
      const ymd = g.startsAtIso.slice(0, 10);
      const list = map.get(ymd) ?? [];
      list.push(g);
      map.set(ymd, list);
    }
    return map;
  }, [visibleGames]);

  return (
    <PageScroll>
      <PageHeader
        title="Schedule"
        subtitle="Drag fixtures into open slots, surface conflicts, and publish your week."
        meta={`Week of ${formatDate(weekStart.toISOString())}`}
        trailing={
          <>
            <Button
              label="Generate fixtures"
              variant="ghost"
              size="sm"
              leadingIcon={<Wand2 size={14} color={colors.brand.primary} strokeWidth={2.25} />}
              onPress={() =>
                toast.show({ variant: 'info', title: 'Fixture generator coming soon' })
              }
            />
            <Button
              label="New game"
              variant="solid"
              size="sm"
              leadingIcon={
                <CalendarPlus size={14} color={colors.text.inverse} strokeWidth={2.5} />
              }
              onPress={() =>
                toast.show({ variant: 'info', title: 'Game creator coming soon' })
              }
            />
          </>
        }
      />

      <View style={styles.toolbar}>
        <Tabs items={TABS} value={view} onChange={setView} variant="segmented" />
        <View style={styles.toolbarRight}>
          <Pressable
            onPress={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() - 7);
              setWeekStart(d);
            }}
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            style={styles.iconBtn}
          >
            <ChevronLeft size={14} color={colors.text.secondary} strokeWidth={2.25} />
          </Pressable>
          <Pressable
            onPress={() => setWeekStart(startOfWeek(new Date()))}
            accessibilityRole="button"
            accessibilityLabel="This week"
            style={styles.todayBtn}
          >
            <Text variant="bodySm" color={colors.text.primary}>
              Today
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + 7);
              setWeekStart(d);
            }}
            accessibilityRole="button"
            accessibilityLabel="Next week"
            style={styles.iconBtn}
          >
            <ChevronRight size={14} color={colors.text.secondary} strokeWidth={2.25} />
          </Pressable>
        </View>
      </View>

      {view === 'week' ? (
        <View style={styles.weekRow}>
          {days.map((d) => {
            const ymd = d.toISOString().slice(0, 10);
            const dayGames = gamesByDay.get(ymd) ?? [];
            const isToday =
              new Date().toISOString().slice(0, 10) === ymd;
            return (
              <Card key={ymd} style={[styles.dayCol, isToday ? styles.dayColToday : null]}>
                <View style={styles.dayHead}>
                  <Text variant="caption" color={colors.text.muted}>
                    {d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
                  </Text>
                  <Text
                    variant="h2"
                    color={isToday ? colors.brand.primary : colors.text.primary}
                  >
                    {d.getDate()}
                  </Text>
                </View>
                {dayGames.length === 0 ? (
                  <Text variant="caption" color={colors.text.muted} style={styles.dayEmpty}>
                    No games
                  </Text>
                ) : (
                  dayGames.map((g) => <GameTile key={g.id} game={g} onPress={() => navigation.navigate('GameDetail', { id: g.id })} />)
                )}
              </Card>
            );
          })}
        </View>
      ) : (
        <Card>
          <View style={styles.cardHead}>
            <Text variant="h3" color={colors.text.primary}>
              All games ({visibleGames.length})
            </Text>
          </View>
          {visibleGames.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={20} color={colors.brand.primary} strokeWidth={2.25} />}
              title="No games scheduled"
              description="Use Generate fixtures or create one manually."
            />
          ) : (
            visibleGames
              .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso))
              .map((g) => (
                <Pressable
                  key={g.id}
                  onPress={() => navigation.navigate('GameDetail', { id: g.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${g.homeTeamName} vs ${g.awayTeamName}`}
                  style={({ hovered }: WebPressableState) => [
                    styles.listRow,
                    hovered ? styles.listRowHover : null,
                  ]}
                >
                  <View style={styles.listTime}>
                    <Text variant="caption" color={colors.text.muted}>
                      {formatDate(g.startsAtIso, { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text variant="h4" color={colors.text.primary}>
                      {formatTime(g.startsAtIso)}
                    </Text>
                  </View>
                  <View style={styles.listBody}>
                    <Text variant="bodySm" color={colors.text.primary} weight="600">
                      {g.homeTeamName} vs {g.awayTeamName}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {g.facilityName} · {g.spaceName} · {g.leagueName}
                    </Text>
                  </View>
                  <Tag size="sm" tone={STATUS_TONE[g.status]} label={STATUS_LABEL[g.status]} leadingDot />
                </Pressable>
              ))
          )}
        </Card>
      )}
    </PageScroll>
  );
}

function GameTile({ game, onPress }: { game: Game; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${game.homeAbbreviation} vs ${game.awayAbbreviation} at ${formatTime(game.startsAtIso)}`}
      style={({ hovered }: WebPressableState) => [
        styles.gameTile,
        game.status === 'live' ? styles.gameTileLive : null,
        hovered ? styles.gameTileHover : null,
      ]}
    >
      <Text variant="caption" color={colors.text.muted}>
        {formatTime(game.startsAtIso)}
      </Text>
      <Text variant="bodySm" color={colors.text.primary} weight="600">
        {game.homeAbbreviation} · {game.awayAbbreviation}
      </Text>
      <Text variant="caption" color={colors.text.muted} numberOfLines={1}>
        {game.spaceName}
      </Text>
      {game.status === 'live' ? (
        <Tag size="sm" tone="live" leadingDot label="Live" />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  todayBtn: {
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  weekRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dayCol: {
    flex: 1,
    minWidth: 140,
    gap: spacing.sm,
    minHeight: 200,
  },
  dayColToday: {
    borderColor: colors.brand.primary,
  },
  dayHead: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  dayEmpty: {
    paddingTop: spacing.lg,
    textAlign: 'center',
  },
  gameTile: {
    backgroundColor: colors.surface.bg,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  gameTileLive: {
    borderColor: colors.status.live,
    backgroundColor: '#FDE7E2',
  },
  gameTileHover: {
    backgroundColor: colors.brand.soft,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.soft,
  },
  listRowHover: {
    backgroundColor: colors.surface.bg,
  },
  listTime: {
    width: 64,
    gap: 2,
  },
  listBody: {
    flex: 1,
    gap: 2,
  },
});
