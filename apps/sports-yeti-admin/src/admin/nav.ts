import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Activity,
  Building2,
  CalendarDays,
  CalendarRange,
  ChartBarBig,
  ClipboardList,
  CreditCard,
  FileText,
  Flag,
  Goal,
  Inbox,
  LayoutDashboard,
  Layers,
  ListChecks,
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
  | 'Operations'
  | 'Approvals'
  | 'Organizations'
  | 'OrganizationDetail'
  | 'Leagues'
  | 'LeagueDetail'
  | 'LeagueForm'
  | 'Seasons'
  | 'SeasonDetail'
  | 'SeasonForm'
  | 'Divisions'
  | 'DivisionDetail'
  | 'DivisionForm'
  | 'Teams'
  | 'TeamDetail'
  | 'TeamForm'
  | 'Schedule'
  | 'GameDetail'
  | 'GameForm'
  | 'FixtureGenerator'
  | 'Players'
  | 'Referees'
  | 'InvitePeople'
  | 'Camps'
  | 'CampDetail'
  | 'CampForm'
  | 'Waivers'
  | 'WaiverDetail'
  | 'WaiverForm'
  | 'Facilities'
  | 'FacilityDetail'
  | 'FacilityForm'
  | 'SpaceForm'
  | 'FacilityAvailability'
  | 'ExternalRentalListing'
  | 'ExternalBookingRequest'
  | 'FmDashboard'
  | 'FmAnalytics'
  | 'OrgPulse'
  | 'OrgMoney'
  | 'OrgPeople'
  | 'OrgIntegrations'
  | 'OrgBranding'
  | 'Bookings'
  | 'BookingDetail'
  | 'BookingForm'
  | 'Payments'
  | 'PaymentDetail'
  | 'Finance'
  | 'Analytics'
  | 'Stats'
  | 'AuditLog'
  | 'Marketplace'
  | 'News'
  | 'NewsComposer'
  | 'Settings'
  | 'FormControls'
  | 'UIGallery';

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
      {
        id: 'operations',
        label: 'Operations',
        route: 'Operations',
        icon: ListChecks,
        badgeKey: 'pendingTeams',
      },
      {
        id: 'approvals',
        label: 'Approvals',
        route: 'Approvals',
        icon: Inbox,
        badgeKey: 'pendingTeams',
      },
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    items: [
      {
        id: 'organizations',
        label: 'Organizations',
        route: 'Organizations',
        icon: Building2,
      },
      {
        id: 'org-pulse',
        label: 'Org pulse',
        route: 'OrgPulse',
        icon: Activity,
      },
      {
        id: 'org-money',
        label: 'Org money',
        route: 'OrgMoney',
        icon: Wallet,
      },
      {
        id: 'org-people',
        label: 'Org people',
        route: 'OrgPeople',
        icon: Users,
      },
      {
        id: 'org-integrations',
        label: 'Integrations',
        route: 'OrgIntegrations',
        icon: ClipboardList,
      },
      {
        id: 'org-branding',
        label: 'Branding',
        route: 'OrgBranding',
        icon: Megaphone,
      },
    ],
  },
  {
    id: 'competition',
    label: 'Competition',
    items: [
      { id: 'leagues', label: 'Leagues', route: 'Leagues', icon: Trophy },
      {
        id: 'seasons',
        label: 'Seasons',
        route: 'Seasons',
        icon: CalendarDays,
      },
      {
        id: 'divisions',
        label: 'Divisions',
        route: 'Divisions',
        icon: Layers,
      },
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
      {
        id: 'fm-dashboard',
        label: 'FM dashboard',
        route: 'FmDashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'fm-analytics',
        label: 'FM analytics',
        route: 'FmAnalytics',
        icon: ChartBarBig,
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
  {
    id: 'system',
    label: 'System',
    collapsed: true,
    items: [
      {
        id: 'form-controls',
        label: 'Form controls',
        route: 'FormControls',
        icon: ClipboardList,
      },
      {
        id: 'ui-gallery',
        label: 'UI gallery',
        route: 'UIGallery',
        icon: ChartBarBig,
      },
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
  Operations: 'operations',
  Approvals: 'approvals',
  Organizations: 'organizations',
  OrganizationDetail: 'organizations',
  Leagues: 'leagues',
  LeagueDetail: 'leagues',
  LeagueForm: 'leagues',
  Seasons: 'seasons',
  SeasonDetail: 'seasons',
  SeasonForm: 'seasons',
  Divisions: 'divisions',
  DivisionDetail: 'divisions',
  DivisionForm: 'divisions',
  Teams: 'teams',
  TeamDetail: 'teams',
  TeamForm: 'teams',
  Schedule: 'schedule',
  GameDetail: 'schedule',
  GameForm: 'schedule',
  FixtureGenerator: 'schedule',
  Players: 'players',
  Referees: 'referees',
  InvitePeople: 'players',
  Camps: 'camps',
  CampDetail: 'camps',
  CampForm: 'camps',
  Waivers: 'waivers',
  WaiverDetail: 'waivers',
  WaiverForm: 'waivers',
  Facilities: 'facilities',
  FacilityDetail: 'facilities',
  FacilityForm: 'facilities',
  SpaceForm: 'facilities',
  FacilityAvailability: 'facilities',
  ExternalRentalListing: 'facilities',
  ExternalBookingRequest: 'facilities',
  FmDashboard: 'fm-dashboard',
  FmAnalytics: 'fm-analytics',
  OrgPulse: 'org-pulse',
  OrgMoney: 'org-money',
  OrgPeople: 'org-people',
  OrgIntegrations: 'org-integrations',
  OrgBranding: 'org-branding',
  Bookings: 'bookings',
  BookingDetail: 'bookings',
  BookingForm: 'bookings',
  Payments: 'payments',
  PaymentDetail: 'payments',
  Finance: 'finance',
  Analytics: 'analytics',
  Stats: 'stats',
  AuditLog: 'audit',
  Marketplace: 'marketplace',
  News: 'news',
  NewsComposer: 'news',
  Settings: 'settings',
  FormControls: 'form-controls',
  UIGallery: 'ui-gallery',
};

export interface BreadcrumbCrumb {
  label: string;
  route?: AdminRouteName;
}

export const ROUTE_LABELS: Record<AdminRouteName, string> = {
  Dashboard: 'Dashboard',
  Operations: 'Operations',
  Approvals: 'Approvals',
  Organizations: 'Organizations',
  OrganizationDetail: 'Organization',
  Leagues: 'Leagues',
  LeagueDetail: 'League',
  LeagueForm: 'League editor',
  Seasons: 'Seasons',
  SeasonDetail: 'Season',
  SeasonForm: 'Season editor',
  Divisions: 'Divisions',
  DivisionDetail: 'Division',
  DivisionForm: 'Division editor',
  Teams: 'Teams',
  TeamDetail: 'Team',
  TeamForm: 'Team editor',
  Schedule: 'Schedule',
  GameDetail: 'Game',
  GameForm: 'Game editor',
  FixtureGenerator: 'Generate fixtures',
  Players: 'Players',
  Referees: 'Referees',
  InvitePeople: 'Invite people',
  Camps: 'Camps',
  CampDetail: 'Camp',
  CampForm: 'Camp editor',
  Waivers: 'Waivers',
  WaiverDetail: 'Waiver',
  WaiverForm: 'Waiver editor',
  Facilities: 'Facilities',
  FacilityDetail: 'Facility',
  FacilityForm: 'Facility editor',
  SpaceForm: 'Space editor',
  FacilityAvailability: 'Availability',
  ExternalRentalListing: 'External listing',
  ExternalBookingRequest: 'Rental request',
  FmDashboard: 'FM dashboard',
  FmAnalytics: 'FM analytics',
  OrgPulse: 'Org pulse',
  OrgMoney: 'Org money',
  OrgPeople: 'Org people',
  OrgIntegrations: 'Integrations',
  OrgBranding: 'Branding',
  Bookings: 'Bookings',
  BookingDetail: 'Booking',
  BookingForm: 'Booking editor',
  Payments: 'Payments',
  PaymentDetail: 'Payment',
  Finance: 'Finance',
  Analytics: 'Analytics',
  Stats: 'Stats',
  AuditLog: 'Audit log',
  Marketplace: 'Marketplace',
  News: 'News & ads',
  NewsComposer: 'Compose announcement',
  Settings: 'Settings',
  FormControls: 'Form controls',
  UIGallery: 'UI gallery',
};
