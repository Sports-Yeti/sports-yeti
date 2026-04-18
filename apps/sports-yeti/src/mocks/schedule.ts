import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import { Dumbbell, Trophy } from 'lucide-react-native';
import { PLAYER_AVATARS } from './avatars';

export interface DayCell {
  id: string;
  weekday: string;
  day: number;
  isToday?: boolean;
}

export const WEEK_DAYS: DayCell[] = [
  { id: 'mon', weekday: 'MON', day: 12 },
  { id: 'tue', weekday: 'TUE', day: 13 },
  { id: 'wed', weekday: 'WED', day: 14, isToday: true },
  { id: 'thu', weekday: 'THU', day: 15 },
  { id: 'fri', weekday: 'FRI', day: 16 },
  { id: 'sat', weekday: 'SAT', day: 17 },
  { id: 'sun', weekday: 'SUN', day: 18 },
];

export interface ScheduleMatch {
  id: string;
  time: string;
  location: string;
  league: string;
  isLive: boolean;
  homeTeam: { name: string; abbreviation: string };
  awayTeam: { name: string; abbreviation: string };
}

export interface DropInSession {
  id: string;
  time: string;
  location: string;
  label: string;
  Icon: ComponentType<LucideProps>;
  attendees: string[];
  attendeeTotal: number;
}

export const TODAYS_LIVE_MATCH: ScheduleMatch = {
  id: 'live-match-1',
  time: '6:00 PM',
  location: 'Field A, Yeti Center',
  league: 'LEAGUE MATCH',
  isLive: true,
  homeTeam: { name: 'Avalanche FC', abbreviation: 'AVA' },
  awayTeam: { name: 'Glacier Knights', abbreviation: 'GLA' },
};

export const TODAYS_DROP_IN: DropInSession = {
  id: 'drop-in-1',
  time: '8:30 PM',
  location: 'Court 2, Summit Rec',
  label: 'Drop-in Hoops',
  Icon: Dumbbell,
  attendees: PLAYER_AVATARS.slice(0, 3),
  attendeeTotal: 8,
};

export const FEATURED_TROPHY_ICON = Trophy;
