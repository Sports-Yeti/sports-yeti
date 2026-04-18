import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Dumbbell,
  Volleyball,
  Trophy,
} from 'lucide-react-native';
import { PLAYER_AVATARS } from './avatars';

export type SportKey =
  | 'allSports'
  | 'soccer'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'baseball';

export interface SportFilter {
  key: SportKey;
  label: string;
}

export const SPORT_FILTERS: SportFilter[] = [
  { key: 'allSports', label: 'All Sports' },
  { key: 'soccer', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'volleyball', label: 'Volleyball' },
  { key: 'tennis', label: 'Tennis' },
  { key: 'baseball', label: 'Baseball' },
];

export type GameStatusEyebrow =
  | 'LIVE NOW'
  | 'TOMORROW'
  | 'THIS WEEKEND'
  | 'NEXT WEEK';

export interface DiscoverGame {
  id: string;
  title: string;
  status: GameStatusEyebrow;
  isLive: boolean;
  featured: boolean;
  sport: SportKey;
  Icon: ComponentType<LucideProps>;
  price: 'Free' | string;
  distance: string;
  time: string;
  location: string;
  spotsLeft: number;
  spotsLeftTone?: 'brand' | 'warning';
  attendees: string[];
  attendeeTotal: number;
}

export const DISCOVER_GAMES: DiscoverGame[] = [
  {
    id: 'friday-night-scrimmage',
    title: 'Friday Night Scrimmage',
    status: 'LIVE NOW',
    isLive: true,
    featured: true,
    sport: 'soccer',
    Icon: Trophy,
    price: 'Free',
    distance: '1.2 mi',
    time: '7:00 PM - 9:00 PM',
    location: 'Alpine Community Turf',
    spotsLeft: 4,
    spotsLeftTone: 'brand',
    attendees: PLAYER_AVATARS.slice(0, 3),
    attendeeTotal: 15,
  },
  {
    id: 'open-gym-5v5',
    title: 'Open Gym 5v5',
    status: 'TOMORROW',
    isLive: false,
    featured: false,
    sport: 'basketball',
    Icon: Dumbbell,
    price: '$5',
    distance: '3.5 mi',
    time: '9:00 AM - 12:00 PM',
    location: 'Downtown Rec Center',
    spotsLeft: 10,
    spotsLeftTone: 'brand',
    attendees: PLAYER_AVATARS.slice(2, 5),
    attendeeTotal: 9,
  },
  {
    id: 'beach-volley-coed',
    title: 'Beach Volley Co-ed',
    status: 'THIS WEEKEND',
    isLive: false,
    featured: false,
    sport: 'volleyball',
    Icon: Volleyball,
    price: 'Free',
    distance: '5.2 mi',
    time: 'Sat, 2:00 PM',
    location: 'Sunny Sands Park',
    spotsLeft: 2,
    spotsLeftTone: 'warning',
    attendees: PLAYER_AVATARS.slice(5, 6),
    attendeeTotal: 4,
  },
];
