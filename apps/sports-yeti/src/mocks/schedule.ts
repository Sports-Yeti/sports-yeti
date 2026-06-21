import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Dumbbell,
  CircleDot,
  Tent,
  Trophy,
  Volleyball,
  Target,
} from 'lucide-react-native';
import { PLAYER_AVATARS } from './avatars';

export interface DayCell {
  id: string;
  weekday: string;
  day: number;
  isToday?: boolean;
  isPast?: boolean;
}

export const WEEK_DAYS: DayCell[] = [
  { id: 'mon', weekday: 'MON', day: 20, isPast: true },
  { id: 'tue', weekday: 'TUE', day: 21, isToday: true },
  { id: 'wed', weekday: 'WED', day: 22 },
  { id: 'thu', weekday: 'THU', day: 23 },
  { id: 'fri', weekday: 'FRI', day: 24 },
  { id: 'sat', weekday: 'SAT', day: 25 },
  { id: 'sun', weekday: 'SUN', day: 26 },
];

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
  dayId: string;
  /** Display label, e.g. "Sat 6:00 PM". */
  time: string;
  /** ISO timestamp used to compute the cancellation countdown. */
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

/**
 * The logged-in player ("Sarah Jenkins" — see `mocks/profile.ts`) has
 * paid for or committed to one of each event type. These are the only
 * items the Schedule tab should render.
 *
 * Times are anchored to the WEEK_DAYS strip above so the UI stays
 * deterministic for screenshots.
 */
export const MY_SCHEDULE: ScheduledEvent[] = [
  {
    id: 'sched-game-rsu-sun',
    kind: 'game',
    dayId: 'sun',
    time: '10:00 AM',
    startsAt: '2026-04-26T10:00:00-06:00',
    durationMinutes: 90,
    location: 'Riverside Pitch 2',
    Icon: CircleDot,
    sportLabel: 'Soccer',
    commitment: 'paid',
    // 24-hour refund window for league games.
    cancelByISO: '2026-04-25T10:00:00-06:00',
    cancelPolicyLabel: 'Full refund up to 24h before kickoff',
    lockerRoomChatId: 'chat-locker-sun-rsu',
    title: 'Avalanche FC vs Riverside United',
    league: 'Mile High Spring · Match Day 5',
    isLive: false,
    homeTeam: {
      id: 'avalanche-fc',
      name: 'Avalanche FC',
      abbreviation: 'AVA',
      chatId: 'chat-avalanche-fc',
    },
    awayTeam: {
      id: 'riverside-united',
      name: 'Riverside United',
      abbreviation: 'RSU',
    },
    userTeamId: 'avalanche-fc',
  },
  {
    id: 'sched-camp-spring-day3',
    kind: 'camp',
    dayId: 'thu',
    time: '6:30 PM',
    startsAt: '2026-04-23T18:30:00-06:00',
    durationMinutes: 75,
    location: 'Yeti Indoor · Studio B',
    Icon: Target,
    sportLabel: 'Soccer skills',
    commitment: 'paid',
    // Camps lock 48h before the session — operations needs to plan staff.
    cancelByISO: '2026-04-21T18:30:00-06:00',
    cancelPolicyLabel: 'Cancel up to 48h before each session',
    lockerRoomChatId: 'chat-locker-spring-camp',
    campTitle: 'Spring Soccer Skills Camp',
    sessionLabel: 'Day 3 of 5 · Finishing & first touch',
    coachName: 'Coach Priya S.',
    coachAvatar: PLAYER_AVATARS[5]!,
    programDay: 3,
    programTotalDays: 5,
    attendees: PLAYER_AVATARS.slice(0, 4),
    attendeeTotal: 14,
  },
  {
    id: 'sched-scrimmage-fri-pickup',
    kind: 'scrimmage',
    dayId: 'fri',
    time: '7:00 PM',
    startsAt: '2026-04-24T19:00:00-06:00',
    durationMinutes: 90,
    location: 'Alpine Community Turf',
    Icon: Trophy,
    sportLabel: 'Pickup soccer',
    commitment: 'committed',
    // Free scrimmage — short cancellation window so the host can
    // backfill from the waitlist.
    cancelByISO: '2026-04-24T17:00:00-06:00',
    cancelPolicyLabel: 'Cancel free up to 2h before kickoff',
    lockerRoomChatId: 'chat-locker-friday-pickup',
    gameId: 'friday-night-scrimmage',
    title: 'Friday Night Pickup',
    hostName: 'Marcus L.',
    hostAvatar: PLAYER_AVATARS[0]!,
    attendees: PLAYER_AVATARS.slice(0, 5),
    attendeeTotal: 12,
    spotsTotal: 16,
  },
];

export function eventsForDay(dayId: string): ScheduledEvent[] {
  return MY_SCHEDULE.filter((e) => e.dayId === dayId);
}

export function eventById(id: string): ScheduledEvent | undefined {
  return MY_SCHEDULE.find((e) => e.id === id);
}

/** Days that have at least one committed event — used for the day picker. */
export function daysWithEvents(): Set<string> {
  return new Set(MY_SCHEDULE.map((e) => e.dayId));
}

// Re-exported icons retained so legacy imports keep working.
export const FEATURED_TROPHY_ICON = Trophy;
export const SCHEDULE_ICONS = { Dumbbell, CircleDot, Tent, Trophy, Volleyball, Target };
