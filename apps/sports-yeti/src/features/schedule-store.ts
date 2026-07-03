import { useMemo } from 'react';
import { create } from 'zustand';
import {
  MY_SCHEDULE,
  addDays,
  hoursBefore,
  type ScheduledCamp,
  type ScheduledEvent,
  type ScheduledScrimmage,
} from '../mocks/schedule';
import {
  GAME_HOSTS,
  SARAH_HOST,
  type DiscoverGame,
  type GameTimeBucket,
} from '../mocks/games';
import type { DiscoverCamp } from '../mocks/camps';

/**
 * Session-level "my schedule" on top of the seeded `MY_SCHEDULE` fixture.
 *
 * Joining a game, registering for a camp, or hosting a game adds entries
 * here; cancelling hides seeded or added entries. Every schedule surface
 * (Schedule tab, GameDetail, CampDetail, ScheduledEventDetail) reads
 * through this store so a commitment made on one screen is visible on all
 * of them. Resets on app restart — mock data only, by design.
 */
interface ScheduleState {
  /** Ids (seeded or added) the user cancelled this session. */
  cancelledIds: Record<string, true>;
  /** Events committed to this session (joins, registrations, hosted games). */
  added: ScheduledEvent[];
  addEvents: (events: ScheduledEvent[]) => void;
  cancelEvent: (id: string) => void;
  /** Re-commit to an event cancelled earlier in the session. */
  restoreEvent: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  cancelledIds: {},
  added: [],
  addEvents: (events) =>
    set((state) => {
      const nextCancelled = { ...state.cancelledIds };
      for (const event of events) delete nextCancelled[event.id];
      const incoming = events.filter(
        (e) => !state.added.some((a) => a.id === e.id),
      );
      return {
        cancelledIds: nextCancelled,
        added: [...state.added, ...incoming],
      };
    }),
  cancelEvent: (id) =>
    set((state) => ({
      cancelledIds: { ...state.cancelledIds, [id]: true },
    })),
  restoreEvent: (id) =>
    set((state) => {
      const next = { ...state.cancelledIds };
      delete next[id];
      return { cancelledIds: next };
    }),
}));

/** Merged seeded + session events, minus cancellations. */
export function useMySchedule(): ScheduledEvent[] {
  const cancelledIds = useScheduleStore((s) => s.cancelledIds);
  const added = useScheduleStore((s) => s.added);
  return useMemo(
    () =>
      [...MY_SCHEDULE, ...added].filter((e) => !cancelledIds[e.id]),
    [cancelledIds, added],
  );
}

export interface GameScheduleEntry {
  /** The schedule entry (seeded or session-added), if any exists. */
  entry: ScheduledEvent | undefined;
  /** True when an entry exists and is not cancelled — the user is going. */
  isCommitted: boolean;
  /** True when the only entry was cancelled this session (can re-join). */
  wasCancelled: boolean;
}

/** The player's commitment to a specific Discover game listing. */
export function useGameScheduleEntry(gameId: string): GameScheduleEntry {
  const cancelledIds = useScheduleStore((s) => s.cancelledIds);
  const added = useScheduleStore((s) => s.added);
  return useMemo(() => {
    const entry = [...MY_SCHEDULE, ...added].find((e) => e.gameId === gameId);
    if (!entry) return { entry, isCommitted: false, wasCancelled: false };
    const cancelled = !!cancelledIds[entry.id];
    return { entry, isCommitted: !cancelled, wasCancelled: cancelled };
  }, [gameId, cancelledIds, added]);
}

/** All schedule entries derived from a camp registration this session. */
export function useCampScheduleEntries(campId: string): ScheduledEvent[] {
  const cancelledIds = useScheduleStore((s) => s.cancelledIds);
  const added = useScheduleStore((s) => s.added);
  return useMemo(
    () =>
      added.filter(
        (e) => e.id.startsWith(campEntryPrefix(campId)) && !cancelledIds[e.id],
      ),
    [campId, cancelledIds, added],
  );
}

// ---------------------------------------------------------------------------
// Discover → schedule mapping
// ---------------------------------------------------------------------------

/**
 * Seeded Discover fixtures carry fixed demo dates that may be in the past,
 * but their `timeBucket` copy ("LIVE NOW", "TOMORROW", …) is what the
 * player saw when committing. Future dates (e.g. games created in the
 * Host-a-game wizard) are trusted as-is; stale ones are re-derived from
 * the bucket so the schedule entry lands where the player expects it.
 */
function resolveStartDate(bucket: GameTimeBucket, sourceISO: string): Date {
  const source = new Date(sourceISO);
  if (source.getTime() > Date.now()) return source;
  const next = new Date();
  next.setHours(source.getHours(), source.getMinutes(), 0, 0);
  switch (bucket) {
    case 'live':
    case 'today':
      return next;
    case 'tomorrow':
      return addDays(next, 1);
    case 'weekend': {
      // Next Saturday (or today if it is Saturday).
      const daysUntilSaturday = (6 - next.getDay() + 7) % 7;
      return addDays(next, daysUntilSaturday);
    }
    case 'later':
      return addDays(next, 5);
  }
}

export const HOSTED_GAME_CHAT_PREFIX = 'chat-locker-';

/** Locker-room chat id for a discover game without a seeded chat. */
export function lockerRoomChatIdForGame(gameId: string): string {
  return `${HOSTED_GAME_CHAT_PREFIX}${gameId}`;
}

/** Build the schedule entry for a Discover game the player just joined. */
export function scheduledEventFromGame(game: DiscoverGame): ScheduledScrimmage {
  const starts = resolveStartDate(game.timeBucket, game.startsAt);
  const isPaid = game.priceCents > 0;
  const host = GAME_HOSTS[game.hostId] ?? SARAH_HOST;
  // Seeded schedule entries already cover some games (e.g. the Friday
  // scrimmage). This mapper is only used for fresh joins.
  return {
    id: `sched-${game.id}`,
    kind: 'scrimmage',
    eventType: game.eventType,
    time: starts.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }),
    startsAt: starts.toISOString(),
    durationMinutes: game.durationMinutes,
    location: game.location,
    Icon: game.Icon,
    sportLabel: game.title.toLowerCase().includes('pickup')
      ? game.title
      : `Pickup ${game.sport === 'allSports' ? 'sports' : game.sport}`,
    commitment: isPaid ? 'paid' : 'committed',
    cancelByISO: hoursBefore(starts, isPaid ? 24 : 2).toISOString(),
    cancelPolicyLabel: isPaid
      ? 'Cancel up to 24h before kickoff — no refund after'
      : 'Cancel free up to 2h before kickoff',
    lockerRoomChatId: lockerRoomChatIdForGame(game.id),
    gameId: game.id,
    title: game.title,
    hostName: host.name,
    hostAvatar: host.avatar,
    attendees: game.attendees,
    attendeeTotal: game.attendeeTotal + 1,
    spotsTotal: game.spotsTotal,
  };
}

/** Id prefix for a camp's schedule entries (used for store lookups). */
function campEntryPrefix(campId: string): string {
  return `sched-camp-${campId}-day`;
}

/** Build one schedule entry per camp session the player registered for. */
export function scheduledEventsFromCamp(camp: DiscoverCamp): ScheduledCamp[] {
  const campStart = new Date(camp.startsAt);
  const now = new Date();
  // Past-dated demo camps register "starting tomorrow" so the sessions are
  // actually visible in the schedule the player lands on.
  const base =
    campStart.getTime() > now.getTime() ? campStart : addDays(now, 1);
  const totalDays = Math.max(camp.schedule.length, 1);
  return camp.schedule.map((session, index) => {
    const starts = addDays(base, index);
    starts.setHours(campStart.getHours() || 9, campStart.getMinutes(), 0, 0);
    return {
      id: `${campEntryPrefix(camp.id)}${index + 1}`,
      kind: 'camp',
      time: starts.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }),
      startsAt: starts.toISOString(),
      durationMinutes: 120,
      location: camp.venueName,
      Icon: camp.Icon,
      sportLabel: `${camp.sport} camp`,
      commitment: camp.feeCents > 0 ? 'paid' : 'committed',
      // Rebased camps can start within 48h of registering — clamp so a
      // fresh registration is never instantly non-cancellable.
      cancelByISO: new Date(
        Math.max(
          hoursBefore(starts, 48).getTime(),
          Date.now() + 60 * 60 * 1000,
        ),
      ).toISOString(),
      cancelPolicyLabel: 'Cancel up to 48h before each session',
      lockerRoomChatId: lockerRoomChatIdForGame(camp.id),
      campTitle: camp.title,
      sessionLabel: `Day ${index + 1} of ${totalDays} · ${session.focus}`,
      coachName: camp.organizer,
      coachAvatar: camp.organizerAvatar,
      programDay: index + 1,
      programTotalDays: totalDays,
      attendees: camp.registrants.slice(0, 4).map((r) => r.avatar),
      attendeeTotal: camp.registered + 1,
    };
  });
}
