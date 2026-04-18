import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Bell,
  CalendarCheck,
  Clapperboard,
  Mail,
  Star,
  Trophy,
  Users,
} from 'lucide-react-native';
import { PLAYER_AVATARS, SARAH_AVATAR } from './avatars';

export interface ProfileUser {
  name: string;
  handle: string;
  avatar: string;
  proMember: boolean;
}

export interface ProfileStat {
  id: string;
  value: number;
  label: string;
  Icon: ComponentType<LucideProps>;
  highlight?: boolean;
}

export interface ProfileFriend {
  id: string;
  avatar: string;
}

export type ActivityType = 'invite' | 'reminder' | 'highlight';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  Icon: ComponentType<LucideProps>;
  title: string;
  body: string;
  timestamp: string;
  actions?: { label: string; primary?: boolean }[];
}

export const PROFILE_USER: ProfileUser = {
  name: 'Sarah Jenkins',
  handle: '@jenkins_yeti',
  avatar: SARAH_AVATAR,
  proMember: true,
};

export const PROFILE_STATS: ProfileStat[] = [
  { id: 'games', value: 42, label: 'GAMES', Icon: CalendarCheck },
  { id: 'mvp', value: 12, label: 'MVP', Icon: Star },
  { id: 'goals', value: 87, label: 'GOALS', Icon: Trophy, highlight: true },
];

export const PROFILE_FRIENDS: ProfileFriend[] = PLAYER_AVATARS.slice(0, 4).map(
  (avatar, idx) => ({ id: `friend-${idx}`, avatar }),
);

export const PROFILE_MUTUAL_COUNT = 14;

export const PROFILE_ACTIVITY: ActivityItem[] = [
  {
    id: 'team-invite',
    type: 'invite',
    Icon: Users,
    title: 'Team Invite: Alpine Strikers',
    body: 'You\'ve been invited to join the upcoming winter league. Accept by Friday.',
    timestamp: '2h ago',
    actions: [
      { label: 'Accept', primary: true },
      { label: 'Decline' },
    ],
  },
  {
    id: 'game-reminder',
    type: 'reminder',
    Icon: Bell,
    title: 'Game Reminder',
    body: 'Match against Yeti FC tomorrow at 18:00. Location: Summit Pitch.',
    timestamp: 'Yesterday',
  },
  {
    id: 'new-highlight',
    type: 'highlight',
    Icon: Clapperboard,
    title: 'New Highlight Available',
    body: 'Your game highlights from last weekend have been compiled.',
    timestamp: '3d ago',
  },
];

export interface MoreLink {
  id: string;
  label: string;
  description: string;
  Icon: ComponentType<LucideProps>;
  route:
    | 'Marketplace'
    | 'Messages'
    | 'Camps'
    | 'Bookings'
    | 'Facilities'
    | 'Waivers'
    | 'PlayerDirectory'
    | 'LeagueBrowse'
    | 'Highlights'
    | 'Games'
    | 'RefereeAvailableGames';
}

export const PROFILE_MORE_LINKS: MoreLink[] = [
  {
    id: 'games',
    label: 'Games',
    description: 'Your upcoming, past, and joined games.',
    Icon: Trophy,
    route: 'Games',
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'Chat with teammates and league members.',
    Icon: Mail,
    route: 'Messages',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    description: 'Buy and sell gear with the community.',
    Icon: Star,
    route: 'Marketplace',
  },
  {
    id: 'camps',
    label: 'Training Camps',
    description: 'Browse skills clinics and academies.',
    Icon: CalendarCheck,
    route: 'Camps',
  },
  {
    id: 'bookings',
    label: 'My Bookings',
    description: 'Court and field reservations in one place.',
    Icon: CalendarCheck,
    route: 'Bookings',
  },
  {
    id: 'facilities',
    label: 'Facilities',
    description: 'Find local courts, fields, and rinks.',
    Icon: Trophy,
    route: 'Facilities',
  },
  {
    id: 'highlights-studio',
    label: 'Highlights Studio',
    description: 'Manage your uploaded reels.',
    Icon: Clapperboard,
    route: 'Highlights',
  },
  {
    id: 'referee',
    label: 'Referee Hub',
    description: 'Available games, assignments, and earnings.',
    Icon: Bell,
    route: 'RefereeAvailableGames',
  },
  {
    id: 'waivers',
    label: 'Waivers & Documents',
    description: 'Sign and review participation waivers.',
    Icon: Star,
    route: 'Waivers',
  },
];
