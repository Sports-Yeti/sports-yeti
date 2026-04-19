import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type WebPressableState } from '../../lib/pressable';
import { useNavigation } from '@react-navigation/native';
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GripVertical,
} from 'lucide-react-native';
import {
  PageHeader,
  PageScroll,
  type AdminRouteName,
} from '../../admin';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  Select,
  Tabs,
  Tag,
  Text,
  useToast,
} from '../../ui';
import { colors, radii, spacing } from '../../theme';
import { BOOKINGS, STATUS_LABEL, type Booking, type BookingStatus } from '../../mocks/bookings';
import { FACILITIES } from '../../mocks/facilities';
import { formatDate, formatTime } from '../../lib/format';
import {
  moveDateInIso,
  useCalendarDrag,
  type DragItem,
} from '../../lib/dragReschedule';

interface ScreenNavigation {
  navigate: (route: AdminRouteName, params?: { id?: string }) => void;
}

const STATUS_TONE: Record<BookingStatus, 'success' | 'warning' | 'live' | 'neutral'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'live',
  completed: 'neutral',
};

const TABS = [
  { key: 'week', label: 'Week' },
  { key: 'list', label: 'List' },
];

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

interface PendingMove {
  booking: Booking;
  fromYmd: string;
  toYmd: string;
}

export function BookingCalendarScreen() {
  const navigation = useNavigation() as unknown as ScreenNavigation;
  const toast = useToast();
  const [view, setView] = useState('week');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date('2026-04-19')));
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const drag = useCalendarDrag<DragItem>();

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }), [weekStart]);

  const visible = useMemo<Booking[]>(() => {
    const filtered =
      facilityFilter === 'all'
        ? BOOKINGS
        : BOOKINGS.filter((b) => b.facilityId === facilityFilter);
    return filtered.map((b) => {
      const newStart = overrides[b.id];
      if (!newStart) return b;
      const duration = new Date(b.endsAtIso).getTime() - new Date(b.startsAtIso).getTime();
      return {
        ...b,
        startsAtIso: newStart,
        endsAtIso: new Date(new Date(newStart).getTime() + duration).toISOString(),
      };
    });
  }, [facilityFilter, overrides]);

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of visible) {
      const ymd = b.startsAtIso.slice(0, 10);
      const list = map.get(ymd) ?? [];
      list.push(b);
      map.set(ymd, list);
    }
    return map;
  }, [visible]);

  const handleDrop = (booking: Booking, fromYmd: string, toYmd: string) => {
    setPendingMove({ booking, fromYmd, toYmd });
  };

  const confirmMove = () => {
    if (!pendingMove) return;
    const { booking, toYmd } = pendingMove;
    const previousIso = booking.startsAtIso;
    const nextIso = moveDateInIso(booking.startsAtIso, toYmd);
    setOverrides((prev) => ({ ...prev, [booking.id]: nextIso }));
    setPendingMove(null);
    toast.show({
      variant: 'success',
      title: `${booking.spaceName} rescheduled`,
      description: `${formatDate(nextIso, { weekday: 'short', month: 'short', day: 'numeric' })} · ${formatTime(nextIso)}`,
      action: {
        label: 'Undo',
        onPress: () =>
          setOverrides((prev) => {
            const next = { ...prev };
            const original = BOOKINGS.find((x) => x.id === booking.id)?.startsAtIso;
            if (previousIso === original) {
              delete next[booking.id];
            } else {
              next[booking.id] = previousIso;
            }
            return next;
          }),
      },
    });
  };

  const conflictForPending = useMemo(() => {
    if (!pendingMove) return null;
    const { booking, toYmd } = pendingMove;
    const candidateStart = new Date(moveDateInIso(booking.startsAtIso, toYmd)).getTime();
    const duration = new Date(booking.endsAtIso).getTime() - new Date(booking.startsAtIso).getTime();
    const candidateEnd = candidateStart + duration;
    return (
      visible.find((other) => {
        if (other.id === booking.id) return false;
        if (other.spaceId !== booking.spaceId) return false;
        if (other.startsAtIso.slice(0, 10) !== toYmd) return false;
        const otherStart = new Date(other.startsAtIso).getTime();
        const otherEnd = new Date(other.endsAtIso).getTime();
        return candidateStart < otherEnd && otherStart < candidateEnd;
      }) ?? null
    );
  }, [pendingMove, visible]);

  return (
    <PageScroll>
      <PageHeader
        title="Bookings"
        subtitle="Reservations across every facility, with conflicts highlighted."
        meta={`Week of ${days[0]!.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
        trailing={
          <Button
            label="New booking"
            variant="solid"
            size="sm"
            leadingIcon={<CalendarPlus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
            onPress={() =>
              toast.show({ variant: 'info', title: 'Booking creator coming soon' })
            }
          />
        }
      />

      <View style={styles.toolbar}>
        <Tabs items={TABS} value={view} onChange={setView} variant="segmented" />
        <Select
          options={[
            { value: 'all', label: 'All facilities' },
            ...FACILITIES.map((f) => ({ value: f.id, label: f.name })),
          ]}
          value={facilityFilter}
          onChange={setFacilityFilter}
          width={220}
        />
        <View style={styles.weekNav}>
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
            const dayBookings = byDay.get(ymd) ?? [];
            const isToday = new Date().toISOString().slice(0, 10) === ymd;
            const isHovered = drag.hoveredYmd === ymd;
            const dropProps = drag.targetProps(ymd, (item) => {
              const booking = visible.find((b) => b.id === item.id);
              if (booking) handleDrop(booking, item.ymd, ymd);
            });
            return (
              <View key={ymd} {...dropProps} style={styles.dayWrap}>
                <Card
                  style={[
                    styles.dayCol,
                    isToday ? styles.dayColToday : null,
                    isHovered ? styles.dayColHover : null,
                  ]}
                >
                  <View style={styles.dayHead}>
                    <Text variant="caption" color={colors.text.muted}>
                      {d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}
                    </Text>
                    <Text variant="h2" color={isToday ? colors.brand.primary : colors.text.primary}>
                      {d.getDate()}
                    </Text>
                  </View>
                  {dayBookings.length === 0 ? (
                    <Text variant="caption" color={colors.text.muted} style={styles.dayEmpty}>
                      {isHovered ? 'Drop here' : 'No bookings'}
                    </Text>
                  ) : (
                    dayBookings.map((b) => {
                      const sourceProps = drag.sourceProps({ id: b.id, ymd });
                      const isDragging = drag.draggingId === b.id;
                      return (
                        <Pressable
                          key={b.id}
                          {...sourceProps}
                          onPress={() => navigation.navigate('BookingDetail', { id: b.id })}
                          accessibilityRole="button"
                          accessibilityLabel={`${b.facilityName} ${b.spaceName} at ${formatTime(b.startsAtIso)}. Drag to reschedule.`}
                          style={({ hovered }: WebPressableState) => [
                            styles.bookingTile,
                            hovered ? styles.bookingTileHover : null,
                            isDragging ? styles.bookingTileDragging : null,
                          ]}
                        >
                          <View style={styles.tileTopRow}>
                            <Text variant="caption" color={colors.text.muted}>
                              {formatTime(b.startsAtIso)} – {formatTime(b.endsAtIso)}
                            </Text>
                            <GripVertical size={12} color={colors.text.muted} strokeWidth={2.25} />
                          </View>
                          <Text variant="bodySm" color={colors.text.primary} weight="600" numberOfLines={1}>
                            {b.spaceName}
                          </Text>
                          <Text variant="caption" color={colors.text.muted} numberOfLines={1}>
                            {b.hostName}
                          </Text>
                          <Tag size="sm" tone={STATUS_TONE[b.status]} label={STATUS_LABEL[b.status]} />
                        </Pressable>
                      );
                    })
                  )}
                </Card>
              </View>
            );
          })}
        </View>
      ) : (
        <Card>
          {visible.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={20} color={colors.brand.primary} strokeWidth={2.25} />}
              title="No bookings yet"
            />
          ) : (
            visible
              .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso))
              .map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => navigation.navigate('BookingDetail', { id: b.id })}
                  accessibilityRole="button"
                  accessibilityLabel={b.facilityName}
                  style={({ hovered }: WebPressableState) => [
                    styles.listRow,
                    hovered ? styles.listRowHover : null,
                  ]}
                >
                  <View style={styles.listTime}>
                    <Text variant="caption" color={colors.text.muted}>
                      {new Date(b.startsAtIso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text variant="h4" color={colors.text.primary}>
                      {formatTime(b.startsAtIso)}
                    </Text>
                  </View>
                  <View style={styles.listBody}>
                    <Text variant="bodySm" color={colors.text.primary} weight="600">
                      {b.facilityName} · {b.spaceName}
                    </Text>
                    <Text variant="caption" color={colors.text.muted}>
                      {b.hostName} · {b.partySize} players
                    </Text>
                  </View>
                  <Tag size="sm" tone={STATUS_TONE[b.status]} label={STATUS_LABEL[b.status]} leadingDot />
                </Pressable>
              ))
          )}
        </Card>
      )}

      <Modal
        visible={!!pendingMove}
        onRequestClose={() => setPendingMove(null)}
        variant={conflictForPending ? 'destructive' : 'info'}
        title="Reschedule booking?"
        description={
          pendingMove
            ? `Move ${pendingMove.booking.spaceName} from ${formatDate(pendingMove.booking.startsAtIso, { weekday: 'short', month: 'short', day: 'numeric' })} to ${formatDate(moveDateInIso(pendingMove.booking.startsAtIso, pendingMove.toYmd), { weekday: 'short', month: 'short', day: 'numeric' })} at ${formatTime(pendingMove.booking.startsAtIso)}?`
            : ''
        }
        primaryAction={{
          label: conflictForPending ? 'Reschedule anyway' : 'Reschedule',
          onPress: confirmMove,
        }}
        secondaryAction={{ label: 'Cancel', onPress: () => setPendingMove(null) }}
      >
        {conflictForPending ? (
          <View style={styles.conflictBanner}>
            <Text variant="caption" color={colors.status.error}>
              Conflict detected
            </Text>
            <Text variant="bodySm" color={colors.text.primary}>
              {conflictForPending.spaceName} is already booked by {conflictForPending.hostName} at{' '}
              {formatTime(conflictForPending.startsAtIso)}.
            </Text>
          </View>
        ) : null}
      </Modal>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: 'auto',
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
  dayWrap: {
    flex: 1,
    minWidth: 140,
  },
  dayCol: {
    gap: spacing.sm,
    minHeight: 200,
  },
  dayColToday: {
    borderColor: colors.brand.primary,
  },
  dayColHover: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.soft,
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
  bookingTile: {
    backgroundColor: colors.surface.bg,
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border.soft,
  },
  bookingTileHover: {
    backgroundColor: colors.brand.soft,
  },
  bookingTileDragging: {
    opacity: 0.4,
  },
  tileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conflictBanner: {
    width: '100%',
    backgroundColor: '#FDE7E2',
    borderRadius: radii.sm,
    padding: spacing.sm,
    gap: 4,
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
