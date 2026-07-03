import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { CircleDot, Target, Trophy } from 'lucide-react-native';
import { PLAYER_AVATARS } from './avatars';

// ---------------------------------------------------------------------------
// Date helpers (local-time, day-level). The schedule mock is generated
// relative to "today" so the week pager always has data to show, no matter
// when the app is launched.
// ---------------------------------------------------------------------------

/** Local-timezone day key, e.g. "2026-07-02". */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday-anchored start of week (matches the day strip layout). */
export function startOfWeek(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const dow = next.getDay(); // 0 = Sun
  const sinceMonday = (dow + 6) % 7;
  return addDays(next, -sinceMonday);
}

function eventDate(daysFromToday: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return addDays(d, daysFromToday);
}

function timeLabel(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function hoursBefore(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScheduleEventKind = 'game' | 'camp' | 'scrimmage';

/** Player's commitment + payment lifecycle on a scheduled event. */
export type CommitmentStatus = 'paid' | 'committed';

export interface ScheduledEventTeam {
  id: string;
  name: string;
  abbreviation: string;
  /** Direct route to that team's chat (for the player's own team only). */
  chatId?: string;
}

interface ScheduledEventBase {
  id: string;
  /** Display label, e.g. "6:30 PM". */
  time: string;
  /** ISO timestamp — drives week/day placement and the cancel countdown. */
  startsAt: string;
  durationMinutes: number;
  location: string;
  /** Lucide icon used in the kind badge. */
  Icon: ComponentType<LucideProps>;
  sportLabel: string;
  /** Player's RSVP status. */
  commitment: CommitmentStatus;
  /**
   * ISO deadline. Players can cancel up until this moment (typically 24h
   * before kickoff for paid games, 2h for free scrimmages). After this,
   * the cancel CTA flips to a disabled "Cancellation window closed" state.
   */
  cancelByISO: string;
  /** Human label paired with `cancelByISO` (shown in the cancel card). */
  cancelPolicyLabel: string;
  /** Locker-room (event-wide) chat available to every committed attendee. */
  lockerRoomChatId: string;
  /** Optional cross-link into the underlying Discover game record. */
  gameId?: string;
}

export interface ScheduledGame extends ScheduledEventBase {
  kind: 'game';
  title: string;
  league: string;
  isLive: boolean;
  homeTeam: ScheduledEventTeam;
  awayTeam: ScheduledEventTeam;
  /** Which side the player is on — drives the "Chat with your team" CTA. */
  userTeamId: string;
}

export interface ScheduledCamp extends ScheduledEventBase {
  kind: 'camp';
  campTitle: string;
  /** "Day 3 of 5", "Week 2 — Footwork", etc. */
  sessionLabel: string;
  coachName: string;
  coachAvatar: string;
  programDay: number;
  programTotalDays: number;
  attendees: string[];
  attendeeTotal: number;
}

export interface ScheduledScrimmage extends ScheduledEventBase {
  kind: 'scrimmage';
  title: string;
  hostName: string;
  hostAvatar: string;
  attendees: string[];
  attendeeTotal: number;
  spotsTotal: number;
}

export type ScheduledEvent = ScheduledGame | ScheduledCamp | ScheduledScrimmage;

export const KIND_LABEL: Record<ScheduleEventKind, string> = {
  game: 'GAME',
  camp: 'CAMP',
  scrimmage: 'SCRIMMAGE',
};

// ---------------------------------------------------------------------------
// Mock data — everything the logged-in player (Sarah Jenkins) has paid for
// or committed to, spread across ~5 weeks so future-week browsing has
// content. Offsets are days from today.
// ---------------------------------------------------------------------------

const AVALANCHE: ScheduledEventTeam = {
  id: 'avalanche-fc',
  name: 'Avalanche FC',
  abbreviation: 'AVA',
  chatId: 'chat-avalanche-fc',
};

function makeGame(input: {
  id: string;
  daysOut: number;
  hour: number;
  minute?: number;
  location: string;
  league: string;
  opponent: ScheduledEventTeam;
  userIsHome: boolean;
  commitment: CommitmentStatus;
  lockerRoomChatId: string;
}): ScheduledGame {
  const starts = eventDate(input.daysOut, input.hour, input.minute ?? 0);
  return {
    id: input.id,
    kind: 'game',
    time: timeLabel(starts),
    startsAt: starts.toISOString(),
    durationMinutes: 90,
    location: input.location,
    Icon: CircleDot,
    sportLabel: 'Soccer',
    commitment: input.commitment,
    // League games refund up to 24h before kickoff.
    cancelByISO: hoursBefore(starts, 24).toISOString(),
    cancelPolicyLabel: 'Full refund up to 24h before kickoff',
    lockerRoomChatId: input.lockerRoomChatId,
    title: input.userIsHome
      ? `Avalanche FC vs ${input.opponent.name}`
      : `${input.opponent.name} vs Avalanche FC`,
    league: input.league,
    isLive: false,
    homeTeam: input.userIsHome ? AVALANCHE : input.opponent,
    awayTeam: input.userIsHome ? input.opponent : AVALANCHE,
    userTeamId: AVALANCHE.id,
  };
}

function makeCampSession(input: {
  id: string;
  daysOut: number;
  programDay: number;
  sessionFocus: string;
}): ScheduledCamp {
  const starts = eventDate(input.daysOut, 18, 30);
  return {
    id: input.id,
    kind: 'camp',
    time: timeLabel(starts),
    startsAt: starts.toISOString(),
    durationMinutes: 75,
    location: 'Yeti Indoor · Studio B',
    Icon: Target,
    sportLabel: 'Soccer skills',
    commitment: 'paid',
    // Camps lock 48h before each session — operations needs to plan staff.
    cancelByISO: hoursBefore(starts, 48).toISOString(),
    cancelPolicyLabel: 'Cancel up to 48h before each session',
    lockerRoomChatId: 'chat-locker-spring-camp',
    campTitle: 'Summer Soccer Skills Camp',
    sessionLabel: `Day ${input.programDay} of 5 · ${input.sessionFocus}`,
    coachName: 'Coach Priya S.',
    coachAvatar: PLAYER_AVATARS[5]!,
    programDay: input.programDay,
    programTotalDays: 5,
    attendees: PLAYER_AVATARS.slice(0, 4),
    attendeeTotal: 14,
  };
}

function makeScrimmage(input: {
  id: string;
  daysOut: number;
  title: string;
  gameId?: string;
}): ScheduledScrimmage {
  const starts = eventDate(input.daysOut, 19, 0);
  return {
    id: input.id,
    kind: 'scrimmage',
    time: timeLabel(starts),
    startsAt: starts.toISOString(),
    durationMinutes: 90,
    location: 'Alpine Community Turf',
    Icon: Trophy,
    sportLabel: 'Pickup soccer',
    commitment: 'committed',
    // Free scrimmage — short window so the host can backfill from waitlist.
    cancelByISO: hoursBefore(starts, 2).toISOString(),
    cancelPolicyLabel: 'Cancel free up to 2h before kickoff',
    lockerRoomChatId: 'chat-locker-friday-pickup',
    gameId: input.gameId,
    title: input.title,
    hostName: 'Marcus L.',
    hostAvatar: PLAYER_AVATARS[0]!,
    attendees: PLAYER_AVATARS.slice(0, 5),
    attendeeTotal: 12,
    spotsTotal: 16,
  };
}

export const MY_SCHEDULE: ScheduledEvent[] = [
  // This week
  makeCampSession({
    id: 'sched-camp-day3',
    daysOut: 0,
    programDay: 3,
    sessionFocus: 'Finishing & first touch',
  }),
  makeScrimmage({
    id: 'sched-scrimmage-pickup',
    daysOut: 2,
    title: 'Friday Night Pickup',
    gameId: 'friday-night-scrimmage',
  }),
  makeGame({
    id: 'sched-game-rsu',
    daysOut: 5,
    hour: 10,
    location: 'Riverside Pitch 2',
    league: 'Mile High Summer · Match Day 5',
    opponent: {
      id: 'riverside-united',
      name: 'Riverside United',
      abbreviation: 'RSU',
    },
    userIsHome: true,
    commitment: 'paid',
    lockerRoomChatId: 'chat-locker-sun-rsu',
  }),
  // Next week
  makeCampSession({
    id: 'sched-camp-day4',
    daysOut: 7,
    programDay: 4,
    sessionFocus: 'Pressing triggers',
  }),
  makeGame({
    id: 'sched-game-frg',
    daysOut: 12,
    hour: 9,
    minute: 30,
    location: 'Field B · Yeti Center',
    league: 'Mile High Summer · Match Day 6',
    opponent: {
      id: 'front-range-fc',
      name: 'Front Range FC',
      abbreviation: 'FRG',
    },
    userIsHome: false,
    commitment: 'paid',
    lockerRoomChatId: 'chat-locker-frg',
  }),
  // Two weeks out
  makeScrimmage({
    id: 'sched-scrimmage-rematch',
    daysOut: 16,
    title: 'Pickup Rematch Night',
  }),
  // Three weeks out
  makeCampSession({
    id: 'sched-camp-day5',
    daysOut: 21,
    programDay: 5,
    sessionFocus: 'Small-sided finale',
  }),
  // Five weeks out
  makeGame({
    id: 'sched-game-playoff',
    daysOut: 33,
    hour: 11,
    location: 'Field A · Yeti Center',
    league: 'Mile High Summer · Quarterfinal',
    opponent: {
      id: 'glacier-knights',
      name: 'Glacier Knights',
      abbreviation: 'GLA',
    },
    userIsHome: true,
    commitment: 'committed',
    lockerRoomChatId: 'chat-locker-playoff',
  }),
];

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function eventById(id: string): ScheduledEvent | undefined {
  return MY_SCHEDULE.find((e) => e.id === id);
}

/** Events on a given calendar day, soonest first. */
export function eventsOnDay(key: string): ScheduledEvent[] {
  return MY_SCHEDULE.filter((e) => dayKey(new Date(e.startsAt)) === key).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

/** Day keys that have at least one committed event — for day-strip dots. */
export function eventDayKeys(events: ScheduledEvent[] = MY_SCHEDULE): Set<string> {
  return new Set(events.map((e) => dayKey(new Date(e.startsAt))));
}

/** All events from the start of today onward, soonest first. */
export function upcomingEvents(): ScheduledEvent[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return MY_SCHEDULE.filter(
    (e) => new Date(e.startsAt).getTime() >= startOfToday.getTime(),
  ).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}
