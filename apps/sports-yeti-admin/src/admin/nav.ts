import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Activity,
  CalendarRange,
  ChartBarBig,
  ClipboardList,
  CreditCard,
  FileText,
  Flag,
  Goal,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  ShoppingBag,
  Tent,
  Trophy,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react-native';

export type AdminRouteName =
  | 'Dashboard'
  | 'Leagues'
  | 'LeagueDetail'
  | 'Teams'
  | 'TeamDetail'
  | 'Schedule'
  | 'GameDetail'
  | 'Players'
  | 'Referees'
  | 'Camps'
  | 'CampDetail'
  | 'Waivers'
  | 'WaiverDetail'
  | 'Facilities'
  | 'FacilityDetail'
  | 'Bookings'
  | 'BookingDetail'
  | 'Payments'
  | 'PaymentDetail'
  | 'Finance'
  | 'Analytics'
  | 'Stats'
  | 'AuditLog'
  | 'Marketplace'
  | 'News'
  | 'Settings';

export interface NavItem {
  id: string;
  label: string;
  route: AdminRouteName;
  icon: ComponentType<LucideProps>;
  badgeKey?: 'pendingTeams' | 'pendingBookings' | 'failedPayments';
}

export interface NavGroup {
  id: string;
  label: string;
  collapsed?: boolean;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: 'Dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'competition',
    label: 'Competition',
    items: [
      { id: 'leagues', label: 'Leagues', route: 'Leagues', icon: Trophy },
      {
        id: 'teams',
        label: 'Teams',
        route: 'Teams',
        icon: Users,
        badgeKey: 'pendingTeams',
      },
      {
        id: 'schedule',
        label: 'Schedule',
        route: 'Schedule',
        icon: CalendarRange,
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      { id: 'players', label: 'Players', route: 'Players', icon: Goal },
      { id: 'referees', label: 'Referees', route: 'Referees', icon: Flag },
      { id: 'camps', label: 'Camps', route: 'Camps', icon: Tent },
      { id: 'waivers', label: 'Waivers', route: 'Waivers', icon: FileText },
    ],
  },
  {
    id: 'venues',
    label: 'Venues',
    items: [
      {
        id: 'facilities',
        label: 'Facilities',
        route: 'Facilities',
        icon: Warehouse,
      },
      {
        id: 'bookings',
        label: 'Bookings',
        route: 'Bookings',
        icon: ClipboardList,
        badgeKey: 'pendingBookings',
      },
    ],
  },
  {
    id: 'money',
    label: 'Money',
    items: [
      {
        id: 'payments',
        label: 'Payments',
        route: 'Payments',
        icon: CreditCard,
        badgeKey: 'failedPayments',
      },
      { id: 'finance', label: 'Finance', route: 'Finance', icon: Wallet },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      {
        id: 'analytics',
        label: 'Analytics',
        route: 'Analytics',
        icon: ChartBarBig,
      },
      { id: 'stats', label: 'Stats', route: 'Stats', icon: Activity },
      { id: 'audit', label: 'Audit log', route: 'AuditLog', icon: ScrollText },
      {
        id: 'marketplace',
        label: 'Marketplace',
        route: 'Marketplace',
        icon: ShoppingBag,
      },
      { id: 'news', label: 'News & ads', route: 'News', icon: Megaphone },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  id: 'settings',
  label: 'Settings',
  route: 'Settings',
  icon: Settings,
};

// Map route -> active item id for sidebar highlighting (deep routes
// inherit their parent item).
export const ROUTE_TO_ITEM: Record<AdminRouteName, string> = {
  Dashboard: 'dashboard',
  Leagues: 'leagues',
  LeagueDetail: 'leagues',
  Teams: 'teams',
  TeamDetail: 'teams',
  Schedule: 'schedule',
  GameDetail: 'schedule',
  Players: 'players',
  Referees: 'referees',
  Camps: 'camps',
  CampDetail: 'camps',
  Waivers: 'waivers',
  WaiverDetail: 'waivers',
  Facilities: 'facilities',
  FacilityDetail: 'facilities',
  Bookings: 'bookings',
  BookingDetail: 'bookings',
  Payments: 'payments',
  PaymentDetail: 'payments',
  Finance: 'finance',
  Analytics: 'analytics',
  Stats: 'stats',
  AuditLog: 'audit',
  Marketplace: 'marketplace',
  News: 'news',
  Settings: 'settings',
};

export interface BreadcrumbCrumb {
  label: string;
  route?: AdminRouteName;
}

export const ROUTE_LABELS: Record<AdminRouteName, string> = {
  Dashboard: 'Dashboard',
  Leagues: 'Leagues',
  LeagueDetail: 'League',
  Teams: 'Teams',
  TeamDetail: 'Team',
  Schedule: 'Schedule',
  GameDetail: 'Game',
  Players: 'Players',
  Referees: 'Referees',
  Camps: 'Camps',
  CampDetail: 'Camp',
  Waivers: 'Waivers',
  WaiverDetail: 'Waiver',
  Facilities: 'Facilities',
  FacilityDetail: 'Facility',
  Bookings: 'Bookings',
  BookingDetail: 'Booking',
  Payments: 'Payments',
  PaymentDetail: 'Payment',
  Finance: 'Finance',
  Analytics: 'Analytics',
  Stats: 'Stats',
  AuditLog: 'Audit log',
  Marketplace: 'Marketplace',
  News: 'News & ads',
  Settings: 'Settings',
};
