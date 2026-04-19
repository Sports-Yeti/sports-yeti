import { portraitFor } from './avatars';
import { peopleByKind } from './people';

/**
 * Referee marketplace mock layer.
 *
 * Surfaces three things the Stitch "Referee Management" reference
 * highlights:
 *  1. PENDING_REGISTRATIONS — applicants awaiting certification review.
 *  2. REFEREE_BIDS — open game assignments referees are bidding on.
 *  3. AUTOMATION_RULES — the org-level assignment rules referenced
 *     by the "Automation Settings" affordance.
 */

export type BidUrgency = 'urgent' | 'high' | 'normal';

export const BID_URGENCY_LABEL: Record<BidUrgency, string> = {
  urgent: 'URGENT',
  high: 'TODAY',
  normal: 'OPEN',
};

export const BID_URGENCY_TONE: Record<
  BidUrgency,
  'live' | 'warning' | 'brand'
> = {
  urgent: 'live',
  high: 'warning',
  normal: 'brand',
};

export interface RefereeBid {
  id: string;
  /** Game / event the bid covers. */
  gameLabel: string;
  league: string;
  facilityLabel: string;
  startsAtIso: string;
  /** Friendly relative window: "Tomorrow · 7 PM", "Sun · 9 AM" etc. */
  whenLabel: string;
  payCents: number;
  urgency: BidUrgency;
  /** Avatars of referees who've already bid. */
  bidderAvatars: string[];
  bidderOverflow: number;
  /** Number of officials needed for the assignment. */
  officialsRequested: number;
  /** Required certification tier (display only). */
  requiredLevel: 'Level 1' | 'Level 2' | 'Level 3';
}

export const REFEREE_BIDS: RefereeBid[] = [
  {
    id: 'bid-u18-final',
    gameLabel: 'U18 Boys Final',
    league: 'Mile High Spring League',
    facilityLabel: 'Yeti Center · Field A',
    startsAtIso: '2026-04-19T19:00:00-06:00',
    whenLabel: 'Tomorrow · 7:00 PM',
    payCents: 8500,
    urgency: 'urgent',
    bidderAvatars: [portraitFor(2), portraitFor(5)],
    bidderOverflow: 2,
    officialsRequested: 2,
    requiredLevel: 'Level 3',
  },
  {
    id: 'bid-summit-double',
    gameLabel: 'Summit Hoops Doubleheader',
    league: 'Summit Hoops Co-ed',
    facilityLabel: 'Summit Rec · Court 1',
    startsAtIso: '2026-04-21T20:00:00-06:00',
    whenLabel: 'Tue · 8:00 PM',
    payCents: 6000,
    urgency: 'high',
    bidderAvatars: [portraitFor(7)],
    bidderOverflow: 0,
    officialsRequested: 2,
    requiredLevel: 'Level 2',
  },
  {
    id: 'bid-coastal-friendly',
    gameLabel: 'Coastal Cruisers vs Mission Aces',
    league: 'Coastal Volley Open',
    facilityLabel: 'Mission Beach · Court 2',
    startsAtIso: '2026-04-26T11:00:00-07:00',
    whenLabel: 'Sun · 11:00 AM',
    payCents: 4500,
    urgency: 'normal',
    bidderAvatars: [portraitFor(11), portraitFor(13), portraitFor(18)],
    bidderOverflow: 1,
    officialsRequested: 1,
    requiredLevel: 'Level 1',
  },
  {
    id: 'bid-aurora-series',
    gameLabel: 'Glacier Knights vs Tundra Wolves',
    league: 'Aurora Fall Hockey D2',
    facilityLabel: 'Aurora Ice · Rink A',
    startsAtIso: '2026-04-25T20:30:00-08:00',
    whenLabel: 'Sat · 8:30 PM',
    payCents: 12500,
    urgency: 'high',
    bidderAvatars: [portraitFor(9)],
    bidderOverflow: 0,
    officialsRequested: 3,
    requiredLevel: 'Level 3',
  },
];

export interface PendingRefereeRegistration {
  id: string;
  /** Foreign key into mocks/people. May be undefined for net-new applicants. */
  personId?: string;
  name: string;
  avatar: string;
  level: 'Level 1' | 'Level 2' | 'Level 3';
  submittedAtIso: string;
  /** Friendly "Submitted 2 hrs ago" line. */
  submittedLabel: string;
  /** Sports they're certified for (display only). */
  certifiedFor: string[];
  /** Highlighted (the row gets a brand-soft halo on the screen). */
  highlight?: boolean;
}

export const PENDING_REGISTRATIONS: PendingRefereeRegistration[] = [
  {
    id: 'reg-sarah-jenkins',
    name: 'Sarah Jenkins',
    avatar: portraitFor(5),
    level: 'Level 3',
    submittedAtIso: '2026-04-18T22:00:00-06:00',
    submittedLabel: 'Submitted 2 hrs ago',
    certifiedFor: ['Soccer', 'Volleyball'],
    highlight: true,
  },
  {
    id: 'reg-marcus-rodriguez',
    name: 'Marcus Rodriguez',
    avatar: portraitFor(2),
    level: 'Level 1',
    submittedAtIso: '2026-04-17T09:00:00-06:00',
    submittedLabel: 'Submitted 1 day ago',
    certifiedFor: ['Soccer'],
  },
  {
    id: 'reg-eli-mendoza',
    name: 'Eli Mendoza',
    avatar: portraitFor(7),
    level: 'Level 2',
    submittedAtIso: '2026-04-15T15:00:00-06:00',
    submittedLabel: 'Submitted 3 days ago',
    certifiedFor: ['Hockey'],
  },
  {
    id: 'reg-tara-vega',
    name: 'Tara Vega',
    avatar: portraitFor(8),
    level: 'Level 2',
    submittedAtIso: '2026-04-14T11:00:00-06:00',
    submittedLabel: 'Submitted 4 days ago',
    certifiedFor: ['Basketball', 'Volleyball'],
  },
];

export interface AutomationRule {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-auto-assign-l3',
    label: 'Auto-assign Level 3 to playoffs',
    description:
      'When a game is tagged "playoff", the highest-rated Level 3 referee within 30 mi is auto-bid.',
    enabled: true,
  },
  {
    id: 'rule-cap-fee',
    label: 'Cap pay at league average',
    description:
      'Reject bids above the league average + 25% to keep fees predictable.',
    enabled: true,
  },
  {
    id: 'rule-promote-fast',
    label: 'Surface within 24h',
    description:
      'Promote bids tagged urgent into Hot Bids automatically when game start ≤ 24h.',
    enabled: true,
  },
  {
    id: 'rule-block-conflict',
    label: 'Block conflicting assignments',
    description:
      'Refuse bids when the official has another game starting within 90 minutes.',
    enabled: false,
  },
];

/**
 * Quick stats for the Marketplace overview hero.
 */
export function refereeMarketplaceStats() {
  const referees = peopleByKind('referee');
  const openBids = REFEREE_BIDS.length;
  const pending = PENDING_REGISTRATIONS.length;
  const avgAssignRate = 94; // mock — would be assigned/(assigned+expired) over 30d
  return {
    activeOfficials: referees.length,
    activeOfficialsDelta: 12,
    pendingRegistrations: pending,
    openBids,
    avgAssignRatePct: avgAssignRate,
  };
}
