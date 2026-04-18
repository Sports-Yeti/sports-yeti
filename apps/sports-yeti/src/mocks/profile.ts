import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Bell,
  CalendarCheck,
  Clapperboard,
  FileText,
  Mail,
  MapPin,
  Settings,
  Star,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react-native';
import { PLAYER_AVATARS, SARAH_AVATAR } from './avatars';

export interface ProfileUser {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  city: string;
  proMember: boolean;
  position: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  availability: 'available' | 'looking_for_team' | 'busy';
  availableToSub: boolean;
  certifications: string;
  privateProfile: boolean;
  showStats: boolean;
  showHighlights: boolean;
  showTeams: boolean;
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
  name: string;
  handle: string;
  avatar: string;
  position: string;
}

export const PROFILE_USER: ProfileUser = {
  name: 'Sarah Jenkins',
  handle: '@jenkins_yeti',
  avatar: SARAH_AVATAR,
  bio: 'Center mid for Avalanche FC. Casual baller. Always up for a Sunday scrimmage.',
  city: 'Denver, CO',
  proMember: true,
  position: 'Center Midfielder',
  experience: 'intermediate',
  availability: 'available',
  availableToSub: true,
  certifications: 'CPR (2025), USSF Grade 8',
  privateProfile: false,
  showStats: true,
  showHighlights: true,
  showTeams: true,
};

export const PROFILE_STATS: ProfileStat[] = [
  { id: 'games', value: 42, label: 'GAMES', Icon: CalendarCheck },
  { id: 'mvp', value: 12, label: 'MVP', Icon: Star },
  { id: 'goals', value: 87, label: 'GOALS', Icon: Trophy, highlight: true },
];

export const PROFILE_FRIENDS: ProfileFriend[] = PLAYER_AVATARS.slice(0, 6).map(
  (avatar, idx) => ({
    id: `friend-${idx}`,
    name: ['Marcus L.', 'Rio T.', 'Jamie R.', 'Coast Squad', 'Leo P.', 'Priya S.'][idx]!,
    handle: ['@marcus_strikes', '@rio_t', '@jamie_r', '@coast_squad', '@leo_p', '@priya_serves'][idx]!,
    avatar,
    position: ['Striker', 'Center Back', 'Point Guard', 'Setter', 'Left Wing', 'Setter'][idx]!,
  }),
);

export const PROFILE_MUTUAL_COUNT = 14;

// Routes that the More section can deep-link into.
export type ProfileMoreRoute =
  | 'ProfileEdit'
  | 'Settings'
  | 'Notifications'
  | 'Waivers'
  | 'MyHighlights'
  | 'Bookings'
  | 'Facilities'
  | 'Messages'
  | 'PlayerDirectory';

export interface MoreLink {
  id: string;
  label: string;
  description: string;
  Icon: ComponentType<LucideProps>;
  route: ProfileMoreRoute;
}

export const PROFILE_MORE_LINKS: MoreLink[] = [
  {
    id: 'edit',
    label: 'Edit Profile',
    description: 'Bio, position, photo, certifications.',
    Icon: UserCog,
    route: 'ProfileEdit',
  },
  {
    id: 'highlights',
    label: 'Highlights Studio',
    description: 'Manage your reels and AI clips.',
    Icon: Clapperboard,
    route: 'MyHighlights',
  },
  {
    id: 'bookings',
    label: 'My Bookings',
    description: 'Court and field reservations.',
    Icon: CalendarCheck,
    route: 'Bookings',
  },
  {
    id: 'facilities',
    label: 'Facilities',
    description: 'Discover venues near you.',
    Icon: MapPin,
    route: 'Facilities',
  },
  {
    id: 'directory',
    label: 'Player Directory',
    description: 'Find players to invite to your squad.',
    Icon: Users,
    route: 'PlayerDirectory',
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'Chat with teammates and league members.',
    Icon: Mail,
    route: 'Messages',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Activity, invites, and reminders.',
    Icon: Bell,
    route: 'Notifications',
  },
  {
    id: 'waivers',
    label: 'Waivers & Documents',
    description: 'Sign and review participation waivers.',
    Icon: FileText,
    route: 'Waivers',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Privacy, payments, and account.',
    Icon: Settings,
    route: 'Settings',
  },
];

// Notifications (replaces inline activity feed; ProfileTab still surfaces a preview)
export type NotificationType =
  | 'invite'
  | 'reminder'
  | 'highlight'
  | 'payment'
  | 'mention';

export interface AppNotification {
  id: string;
  type: NotificationType;
  Icon: ComponentType<LucideProps>;
  title: string;
  body: string;
  timestamp: string;
  unread: boolean;
  actions?: { id: string; label: string; primary?: boolean }[];
  // For navigation when the row itself is tapped.
  link?:
    | { kind: 'team'; id: string }
    | { kind: 'game'; id: string }
    | { kind: 'highlight'; id: string }
    | { kind: 'payment'; teamId: string }
    | { kind: 'chat'; chatId: string };
}

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'team-invite-strikers',
    type: 'invite',
    Icon: Users,
    title: 'Team Invite: Alpine Strikers',
    body: "You've been invited to join the upcoming winter league. Accept by Friday.",
    timestamp: '2h ago',
    unread: true,
    actions: [
      { id: 'accept', label: 'Accept', primary: true },
      { id: 'decline', label: 'Decline' },
    ],
    link: { kind: 'team', id: 'alpine-strikers' },
  },
  {
    id: 'payment-due-avalanche',
    type: 'payment',
    Icon: Trophy,
    title: 'Payment due — Avalanche FC',
    body: 'Your share of the Mile High Spring fee is $120. Captain has nudged you.',
    timestamp: '5h ago',
    unread: true,
    actions: [{ id: 'pay', label: 'Pay $120', primary: true }],
    link: { kind: 'payment', teamId: 'avalanche-fc' },
  },
  {
    id: 'game-reminder-yetifc',
    type: 'reminder',
    Icon: Bell,
    title: 'Game Reminder',
    body: 'Match against Yeti FC tomorrow at 18:00. Location: Summit Pitch.',
    timestamp: 'Yesterday',
    unread: false,
    link: { kind: 'game', id: 'friday-night-scrimmage' },
  },
  {
    id: 'new-highlight-april-7',
    type: 'highlight',
    Icon: Clapperboard,
    title: 'Highlight Ready',
    body: 'Your Apr 7 game produced 5 clips. Review and post to feed.',
    timestamp: '3d ago',
    unread: false,
    link: { kind: 'highlight', id: 'proj-april-7' },
  },
  {
    id: 'mention-jamie',
    type: 'mention',
    Icon: Mail,
    title: '@jamie_r mentioned you',
    body: '"@jenkins_yeti can you cover Sunday morning?"',
    timestamp: '4d ago',
    unread: false,
    link: { kind: 'chat', chatId: 'chat-summit-hoops' },
  },
];
