import { ADMIN_TEAMMATES } from './org';

// ----- Audit log -----

export type AuditEventKind =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'approved'
  | 'rejected'
  | 'refunded'
  | 'invited';

export type AuditSubjectKind =
  | 'league'
  | 'team'
  | 'player'
  | 'facility'
  | 'booking'
  | 'payment'
  | 'waiver'
  | 'camp'
  | 'referee'
  | 'settings';

export interface AuditEvent {
  id: string;
  kind: AuditEventKind;
  subjectKind: AuditSubjectKind;
  subjectId: string;
  subjectLabel: string;
  causerId: string;
  causerName: string;
  causerAvatar: string;
  description: string;
  occurredAtIso: string;
  details?: Record<string, string | number>;
}

const ALEX = ADMIN_TEAMMATES[0]!;
const PRIYA = ADMIN_TEAMMATES[1]!;
const SAM = ADMIN_TEAMMATES[2]!;

function audit(
  id: string,
  kind: AuditEventKind,
  subjectKind: AuditSubjectKind,
  subjectId: string,
  subjectLabel: string,
  causer: typeof ALEX,
  description: string,
  hoursAgo: number,
  details?: Record<string, string | number>,
): AuditEvent {
  return {
    id,
    kind,
    subjectKind,
    subjectId,
    subjectLabel,
    causerId: causer.id,
    causerName: causer.name,
    causerAvatar: causer.avatar ?? '',
    description,
    occurredAtIso: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
    details,
  };
}

export const AUDIT_LOG: AuditEvent[] = [
  audit('audit-1', 'approved', 'team', 'team-frosty-flames', 'Frosty Flames', PRIYA, 'Approved Frosty Flames into Mile High Spring', 0.4, { league: 'Mile High Spring' }),
  audit('audit-2', 'refunded', 'payment', 'pay-11', 'Aurora Ice booking', ALEX, 'Refunded Aurora Ice booking ($320.00)', 1.2, { amount: '$320.00', reason: 'Weather cancel' }),
  audit('audit-3', 'created', 'camp', 'camp-mission-volley', 'Mission Beach Volley Bootcamp', SAM, 'Created Mission Beach Volley Bootcamp draft', 3.4),
  audit('audit-4', 'updated', 'facility', 'facility-yeti-center', 'Yeti Center', ALEX, 'Updated Yeti Center hours and lighting fee', 5.5),
  audit('audit-5', 'invited', 'referee', 'p-referee-50', 'Marcus L.', PRIYA, 'Invited Marcus L. as referee for Spring 2026', 22),
  audit('audit-6', 'rejected', 'team', 'team-rejected-1', 'Mountain Lions B', ALEX, 'Rejected Mountain Lions B (incomplete roster)', 27),
  audit('audit-7', 'updated', 'league', 'league-coastal-volley', 'Coastal Volley Open', SAM, 'Lifted registration cap from 12 to 16', 30),
  audit('audit-8', 'created', 'waiver', 'waiver-coastal-photo', 'Photo & Video Release', SAM, 'Created Photo & Video Release waiver', 35),
  audit('audit-9', 'approved', 'team', 'team-coastal-cruisers', 'Coastal Cruisers', ALEX, 'Approved Coastal Cruisers into Coastal Volley Open', 50),
  audit('audit-10', 'refunded', 'payment', 'pay-7', 'Glacier Knights share', PRIYA, 'Issued partial refund of $100 to player', 80),
  audit('audit-11', 'updated', 'settings', 'org-yeti-co', 'Org settings', ALEX, 'Enabled SSO for Yeti Athletic Co.', 120),
];

export function recentAudit(limit = 6): AuditEvent[] {
  return AUDIT_LOG.slice(0, limit);
}

// ----- Notifications -----

export type NotificationKind =
  | 'team_pending'
  | 'payment_failed'
  | 'booking_pending'
  | 'waiver_expiring'
  | 'system';

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  occurredAtIso: string;
  unread: boolean;
}

export const NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'n-1',
    kind: 'team_pending',
    title: '2 team applications waiting',
    body: 'Frosty Flames and Mountain Lions are awaiting review.',
    occurredAtIso: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: 'n-2',
    kind: 'payment_failed',
    title: 'Payment failed — Avalanche FC',
    body: "Ash D.'s share of the Spring fee was declined.",
    occurredAtIso: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: 'n-3',
    kind: 'booking_pending',
    title: '3 bookings awaiting payment',
    body: 'Confirm or auto-cancel within 24h to free the slot.',
    occurredAtIso: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    unread: true,
  },
  {
    id: 'n-4',
    kind: 'waiver_expiring',
    title: 'Concussion waiver expires Aug 12',
    body: '24 players will need to re-sign before Fall season.',
    occurredAtIso: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    unread: false,
  },
  {
    id: 'n-5',
    kind: 'system',
    title: 'Stripe payout scheduled',
    body: 'Net $4,210.00 will arrive in your bank Apr 22.',
    occurredAtIso: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    unread: false,
  },
];

// ----- Dashboard alerts (top of dashboard) -----

export interface DashboardAlert {
  id: string;
  tone: 'warning' | 'live' | 'info';
  title: string;
  body: string;
  cta: { label: string; route: string };
}

export const DASHBOARD_ALERTS: DashboardAlert[] = [
  {
    id: 'a-1',
    tone: 'warning',
    title: '2 team applications need a decision',
    body: 'Frosty Flames and Mountain Lions are waiting on Mile High Spring approval.',
    cta: { label: 'Review now', route: 'Teams' },
  },
  {
    id: 'a-2',
    tone: 'live',
    title: '2 games are live right now',
    body: 'Live updates are streaming for both league fixtures.',
    cta: { label: 'Open schedule', route: 'Schedule' },
  },
  {
    id: 'a-3',
    tone: 'info',
    title: '1 payment failed in the last 24h',
    body: 'Ash D. — Avalanche FC team share. Resend invoice?',
    cta: { label: 'Open payment', route: 'Payments' },
  },
];

// ----- Analytics datapoints (sparkline-ready) -----

export interface MetricSeries {
  id: string;
  label: string;
  unit: 'count' | 'currency';
  totalCents?: number;
  totalCount?: number;
  changePct: number; // vs. previous period
  points: number[]; // 12 points (weeks)
}

export const METRIC_SERIES: MetricSeries[] = [
  {
    id: 'revenue',
    label: 'Net revenue · 12 weeks',
    unit: 'currency',
    totalCents: 1_842_000,
    changePct: 12.4,
    points: [110_000, 124_000, 96_000, 132_000, 158_000, 142_000, 152_000, 168_000, 174_000, 182_000, 198_000, 206_000],
  },
  {
    id: 'registrations',
    label: 'New players',
    unit: 'count',
    totalCount: 312,
    changePct: 8.6,
    points: [12, 18, 22, 24, 21, 28, 30, 26, 32, 36, 30, 33],
  },
  {
    id: 'bookings',
    label: 'Facility bookings',
    unit: 'count',
    totalCount: 184,
    changePct: -2.1,
    points: [22, 18, 24, 19, 17, 16, 14, 18, 12, 14, 12, 11],
  },
  {
    id: 'attendance',
    label: 'Avg attendance / game',
    unit: 'count',
    totalCount: 18,
    changePct: 4.3,
    points: [16, 17, 17, 18, 18, 19, 18, 19, 18, 18, 19, 19],
  },
];

// ----- Marketplace + News (kept lean per audit) -----

export interface MarketplaceListing {
  id: string;
  title: string;
  type: 'gear' | 'service' | 'player_for_hire';
  priceCents: number | null;
  city: string;
  postedByName: string;
  postedByAvatar: string;
  postedAtIso: string;
  status: 'active' | 'flagged' | 'archived';
}

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: 'mkt-1',
    title: 'Bauer Goalie Pads (used 1 season)',
    type: 'gear',
    priceCents: 32000,
    city: 'Anchorage, AK',
    postedByName: 'Tara V.',
    postedByAvatar: 'https://i.pravatar.cc/120?img=33',
    postedAtIso: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    status: 'active',
  },
  {
    id: 'mkt-2',
    title: 'Sub goalkeeper available — Sundays',
    type: 'player_for_hire',
    priceCents: null,
    city: 'Denver, CO',
    postedByName: 'Ash D.',
    postedByAvatar: 'https://i.pravatar.cc/120?img=22',
    postedAtIso: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    status: 'active',
  },
  {
    id: 'mkt-3',
    title: 'Private trainer — strength + conditioning',
    type: 'service',
    priceCents: 6000,
    city: 'Boulder, CO',
    postedByName: 'Coach Priya',
    postedByAvatar: 'https://i.pravatar.cc/120?img=47',
    postedAtIso: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    status: 'flagged',
  },
];

export interface NewsPost {
  id: string;
  title: string;
  body: string;
  publishedAtIso: string;
  status: 'draft' | 'scheduled' | 'published';
  audience: 'all' | 'players' | 'captains' | 'referees';
}

export const NEWS_POSTS: NewsPost[] = [
  {
    id: 'news-1',
    title: 'Spring 2026 schedule is live',
    body:
      'Match cards, RSVPs, and ref assignments are now available in the mobile app for everyone in Mile High Spring and Summit Hoops.',
    publishedAtIso: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    status: 'published',
    audience: 'all',
  },
  {
    id: 'news-2',
    title: 'Field A turf re-grooming Apr 30',
    body: 'Yeti Center Field A will be unavailable from 6 AM to 12 PM on Apr 30.',
    publishedAtIso: new Date(Date.now() - 1 * 86_400_000).toISOString(),
    status: 'scheduled',
    audience: 'captains',
  },
  {
    id: 'news-3',
    title: 'Referee bonus program — Q3',
    body: 'Top-rated officials earn a Q3 bonus. Details inside.',
    publishedAtIso: new Date().toISOString(),
    status: 'draft',
    audience: 'referees',
  },
];
