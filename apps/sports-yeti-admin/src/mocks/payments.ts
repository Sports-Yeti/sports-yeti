import { peopleByKind } from './people';
import { TEAMS } from './teams';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentType =
  | 'league_registration'
  | 'team_share'
  | 'facility_booking'
  | 'highlight';

export interface Payment {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amountCents: number;
  feeCents: number;
  netCents: number;
  refundedCents: number;
  currency: 'USD';
  payerName: string;
  payerHandle: string;
  payerAvatar: string;
  // Related context
  contextLabel: string;
  contextHref?: string;
  paidAtIso?: string;
  createdAtIso: string;
  paymentMethod: 'apple_pay' | 'google_pay' | 'card' | 'ach';
  cardBrand?: string;
  cardLast4?: string;
  receiptUrl?: string;
}

const players = peopleByKind('player');

function payment(
  index: number,
  type: PaymentType,
  status: PaymentStatus,
  amountCents: number,
  contextLabel: string,
  daysAgo: number,
  refundedCents = 0,
): Payment {
  const payer = players[index % players.length]!;
  const feeCents = Math.round(amountCents * 0.029) + 30;
  const netCents = amountCents - feeCents - refundedCents;
  const created = new Date(Date.now() - daysAgo * 86_400_000);
  const paid = status === 'completed' || status === 'partially_refunded' || status === 'refunded'
    ? new Date(created.getTime() + 60_000 * 5).toISOString()
    : undefined;
  return {
    id: `pay-${index}`,
    type,
    status,
    amountCents,
    feeCents,
    netCents,
    refundedCents,
    currency: 'USD',
    payerName: payer.name,
    payerHandle: payer.handle,
    payerAvatar: payer.avatar,
    contextLabel,
    paidAtIso: paid,
    createdAtIso: created.toISOString(),
    paymentMethod:
      index % 3 === 0 ? 'apple_pay' : index % 3 === 1 ? 'card' : 'google_pay',
    cardBrand: index % 3 === 1 ? 'Visa' : undefined,
    cardLast4: index % 3 === 1 ? String(4242 - index).slice(0, 4) : undefined,
    receiptUrl: paid ? `https://example.com/receipts/pay-${index}` : undefined,
  };
}

export const PAYMENTS: Payment[] = [
  payment(1, 'team_share', 'completed', 12000, `${TEAMS[0]!.name} · per-player share`, 0),
  payment(2, 'team_share', 'completed', 12000, `${TEAMS[0]!.name} · per-player share`, 0),
  payment(3, 'team_share', 'pending', 12000, `${TEAMS[0]!.name} · per-player share`, 0),
  payment(4, 'team_share', 'failed', 12000, `${TEAMS[0]!.name} · per-player share`, 1),
  payment(5, 'league_registration', 'completed', 192000, 'Mile High Spring · Avalanche FC registration', 5),
  payment(6, 'team_share', 'completed', 20000, `${TEAMS[1]!.name} · per-player share`, 7),
  payment(7, 'team_share', 'partially_refunded', 20000, `${TEAMS[1]!.name} · per-player share`, 3, 10000),
  payment(8, 'facility_booking', 'completed', 36000, 'Yeti Center · Field A · 2h', 2),
  payment(9, 'facility_booking', 'completed', 4500, 'Summit Rec · Court 1 · 1h', 1),
  payment(10, 'facility_booking', 'pending', 14250, 'Yeti Center · Field B · 90m', 0),
  payment(11, 'facility_booking', 'refunded', 32000, 'Aurora Ice · Rink A · 1h', 9, 32000),
  payment(12, 'team_share', 'completed', 14400, `${TEAMS[2]!.name} · per-player share`, 14),
  payment(13, 'team_share', 'completed', 14400, `${TEAMS[2]!.name} · per-player share`, 14),
  payment(14, 'team_share', 'overdue' as PaymentStatus extends 'overdue' ? never : never, 14400, `${TEAMS[2]!.name} · per-player share`, 6) as Payment, // not used
  payment(15, 'highlight', 'completed', 199, 'AI highlight · Apr 7 game', 11),
  payment(16, 'highlight', 'completed', 199, 'AI highlight · Apr 14 game', 4),
  payment(17, 'team_share', 'completed', 24000, `${TEAMS[3]!.name} · per-player share`, 8),
  payment(18, 'team_share', 'completed', 24000, `${TEAMS[3]!.name} · per-player share`, 8),
  payment(19, 'league_registration', 'completed', 360000, 'Aurora Fall Hockey · Glacier Knights registration', 30),
  payment(20, 'league_registration', 'pending', 192000, 'Mile High Spring · Frosty Flames registration', 1),
];

// Drop the dud entry that used a placeholder status
const cleaned = PAYMENTS.filter((p) => p.status !== ('overdue' as PaymentStatus));
PAYMENTS.length = 0;
PAYMENTS.push(...cleaned);

export function paymentById(id: string): Payment | undefined {
  return PAYMENTS.find((p) => p.id === id);
}

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  partially_refunded: 'Partial refund',
};

export const TYPE_LABEL: Record<PaymentType, string> = {
  league_registration: 'League registration',
  team_share: 'Team share',
  facility_booking: 'Facility booking',
  highlight: 'AI highlight',
};

export interface FinanceSummary {
  grossCents: number;
  feesCents: number;
  refundsCents: number;
  netCents: number;
  outstandingCents: number;
  payoutDateIso: string;
}

export function financeSummary(): FinanceSummary {
  const completedOrPartial = PAYMENTS.filter(
    (p) => p.status === 'completed' || p.status === 'partially_refunded',
  );
  const grossCents = completedOrPartial.reduce((acc, p) => acc + p.amountCents, 0);
  const feesCents = completedOrPartial.reduce((acc, p) => acc + p.feeCents, 0);
  const refundsCents = PAYMENTS.reduce((acc, p) => acc + p.refundedCents, 0);
  const netCents = grossCents - feesCents - refundsCents;
  const outstandingCents = PAYMENTS.filter(
    (p) => p.status === 'pending' || p.status === 'failed',
  ).reduce((acc, p) => acc + p.amountCents, 0);
  return {
    grossCents,
    feesCents,
    refundsCents,
    netCents,
    outstandingCents,
    payoutDateIso: new Date(Date.now() + 86_400_000 * 3).toISOString(),
  };
}
