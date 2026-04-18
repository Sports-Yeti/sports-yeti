import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { Dumbbell, Trophy, CircleDot, Volleyball, Target } from 'lucide-react-native';
import { PLAYER_AVATARS } from './avatars';

export interface DayCell {
  id: string;
  weekday: string;
  day: number;
  isToday?: boolean;
  isPast?: boolean;
}

export const WEEK_DAYS: DayCell[] = [
  { id: 'mon', weekday: 'MON', day: 12, isPast: true },
  { id: 'tue', weekday: 'TUE', day: 13, isPast: true },
  { id: 'wed', weekday: 'WED', day: 14, isToday: true },
  { id: 'thu', weekday: 'THU', day: 15 },
  { id: 'fri', weekday: 'FRI', day: 16 },
  { id: 'sat', weekday: 'SAT', day: 17 },
  { id: 'sun', weekday: 'SUN', day: 18 },
];

export type ScheduleEventKind = 'match' | 'dropIn' | 'practice';

export interface ScheduleMatch {
  id: string;
  kind: 'match';
  dayId: string;
  time: string;
  location: string;
  league: string;
  isLive: boolean;
  homeTeam: { name: string; abbreviation: string };
  awayTeam: { name: string; abbreviation: string };
  gameId?: string; // Discover game id for cross-link
}

export interface DropInSession {
  id: string;
  kind: 'dropIn';
  dayId: string;
  time: string;
  location: string;
  label: string;
  Icon: ComponentType<LucideProps>;
  attendees: string[];
  attendeeTotal: number;
  gameId?: string;
}

export interface PracticeSession {
  id: string;
  kind: 'practice';
  dayId: string;
  time: string;
  location: string;
  label: string;
  Icon: ComponentType<LucideProps>;
  team: string;
  attendees: string[];
  attendeeTotal: number;
}

export type ScheduleEvent = ScheduleMatch | DropInSession | PracticeSession;

export const SCHEDULE_EVENTS: ScheduleEvent[] = [
  // Wed (today)
  {
    id: 'live-match-1',
    kind: 'match',
    dayId: 'wed',
    time: '6:00 PM',
    location: 'Field A, Yeti Center',
    league: 'LEAGUE MATCH',
    isLive: true,
    homeTeam: { name: 'Avalanche FC', abbreviation: 'AVA' },
    awayTeam: { name: 'Glacier Knights', abbreviation: 'GLA' },
    gameId: 'friday-night-scrimmage',
  },
  {
    id: 'drop-in-1',
    kind: 'dropIn',
    dayId: 'wed',
    time: '8:30 PM',
    location: 'Court 2, Summit Rec',
    label: 'Drop-in Hoops',
    Icon: Dumbbell,
    attendees: PLAYER_AVATARS.slice(0, 3),
    attendeeTotal: 8,
    gameId: 'open-gym-5v5',
  },
  // Thu
  {
    id: 'practice-thu',
    kind: 'practice',
    dayId: 'thu',
    time: '7:00 PM',
    location: 'Yeti Indoor',
    label: 'Squad Practice',
    Icon: CircleDot,
    team: 'Avalanche FC',
    attendees: PLAYER_AVATARS.slice(0, 4),
    attendeeTotal: 9,
  },
  // Fri
  {
    id: 'fri-friendly',
    kind: 'match',
    dayId: 'fri',
    time: '7:00 PM',
    location: 'Alpine Community Turf',
    league: 'FRIENDLY',
    isLive: false,
    homeTeam: { name: 'Avalanche FC', abbreviation: 'AVA' },
    awayTeam: { name: 'Riverside United', abbreviation: 'RSU' },
    gameId: 'friday-night-scrimmage',
  },
  // Sat
  {
    id: 'sat-open-gym',
    kind: 'dropIn',
    dayId: 'sat',
    time: '9:00 AM',
    location: 'Downtown Rec Center',
    label: 'Open Gym 5v5',
    Icon: Dumbbell,
    attendees: PLAYER_AVATARS.slice(2, 5),
    attendeeTotal: 10,
    gameId: 'open-gym-5v5',
  },
  {
    id: 'sat-volley',
    kind: 'dropIn',
    dayId: 'sat',
    time: '2:00 PM',
    location: 'Sunny Sands Park',
    label: 'Beach Volley Co-ed',
    Icon: Volleyball,
    attendees: PLAYER_AVATARS.slice(5, 6),
    attendeeTotal: 10,
    gameId: 'beach-volley-coed',
  },
  // Sun
  {
    id: 'sun-softball',
    kind: 'dropIn',
    dayId: 'sun',
    time: '10:00 AM',
    location: 'Riverside Diamonds',
    label: 'Sunday Softball',
    Icon: Trophy,
    attendees: PLAYER_AVATARS.slice(0, 4),
    attendeeTotal: 12,
    gameId: 'sunday-softball-league',
  },
  // Tue (next week, but tue id repeats — for demo, treat as past + future tease)
  {
    id: 'tue-tennis',
    kind: 'dropIn',
    dayId: 'tue',
    time: '6:00 PM',
    location: 'Highland Tennis Club',
    label: 'Tennis Doubles',
    Icon: Target,
    attendees: PLAYER_AVATARS.slice(1, 4),
    attendeeTotal: 4,
    gameId: 'tuesday-tennis-doubles',
  },
];

export function eventsForDay(dayId: string): ScheduleEvent[] {
  return SCHEDULE_EVENTS.filter((e) => e.dayId === dayId);
}

export const FEATURED_TROPHY_ICON = Trophy;
