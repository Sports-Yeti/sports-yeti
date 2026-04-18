import { FACILITIES } from './facilities';
import { CURRENT_ADMIN } from './org';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  spaceId: string;
  spaceName: string;
  startsAtIso: string;
  endsAtIso: string;
  status: BookingStatus;
  amountCents: number;
  paidCents: number;
  partySize: number;
  hostName: string;
  hostHandle: string;
  notes?: string;
  createdAtIso: string;
}

function booking(
  id: string,
  facilityId: string,
  spaceId: string,
  spaceName: string,
  startsAtIso: string,
  durationMin: number,
  status: BookingStatus,
  partySize: number,
  amountCents: number,
  paidCents: number,
  hostName: string,
  hostHandle: string,
  notes?: string,
): Booking {
  const facility = FACILITIES.find((f) => f.id === facilityId)!;
  const start = new Date(startsAtIso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  return {
    id,
    facilityId,
    facilityName: facility.name,
    spaceId,
    spaceName,
    startsAtIso: start.toISOString(),
    endsAtIso: end.toISOString(),
    status,
    amountCents,
    paidCents,
    partySize,
    hostName,
    hostHandle,
    notes,
    createdAtIso: new Date(start.getTime() - 86_400_000 * 7).toISOString(),
  };
}

export const BOOKINGS: Booking[] = [
  booking('bk-1', 'facility-yeti-center', 'space-yeti-field-a', 'Field A (Full)', '2026-04-19T19:00:00-06:00', 120, 'confirmed', 22, 36000, 36000, 'Marcus L.', '@marcus_strikes'),
  booking('bk-2', 'facility-yeti-center', 'space-yeti-field-b', 'Field B (Half)', '2026-04-19T19:00:00-06:00', 90, 'pending', 14, 14250, 0, 'Frosty Flames', '@frosty_fc', 'Awaiting payment'),
  booking('bk-3', 'facility-summit-rec', 'space-summit-court-1', 'Court 1', '2026-04-19T20:30:00-06:00', 60, 'confirmed', 10, 4500, 4500, 'Jamie R.', '@jamie_r'),
  booking('bk-4', 'facility-aurora-ice', 'space-aurora-rink-a', 'Rink A', '2026-04-20T20:00:00-08:00', 90, 'confirmed', 18, 48000, 48000, 'Björn K.', '@bjorn_k'),
  booking('bk-5', 'facility-mission-beach', 'space-mission-court-1', 'Court 1 (north)', '2026-04-21T10:00:00-07:00', 90, 'confirmed', 8, 0, 0, 'Coastal Cruisers', '@coastal'),
  booking('bk-6', 'facility-summit-rec', 'space-summit-court-2', 'Court 2', '2026-04-23T19:00:00-06:00', 60, 'pending', 10, 4500, 0, 'Open Gym Group', '@opengym', 'Card declined — needs retry'),
  booking('bk-7', 'facility-yeti-center', 'space-yeti-field-a', 'Field A (Full)', '2026-04-12T18:00:00-06:00', 120, 'completed', 22, 36000, 36000, 'Avalanche FC', '@avalanche_fc'),
  booking('bk-8', 'facility-aurora-ice', 'space-aurora-rink-b', 'Rink B', '2026-04-12T20:00:00-08:00', 90, 'completed', 20, 48000, 48000, 'Glacier Knights', '@glacier_knights'),
  booking('bk-9', 'facility-yeti-center', 'space-yeti-field-b', 'Field B (Half)', '2026-04-26T18:00:00-06:00', 90, 'pending', 12, 14250, 0, CURRENT_ADMIN.name, '@admin'),
  booking('bk-10', 'facility-highland-tennis', 'space-highland-h1', 'Hard Court 1', '2026-04-22T18:00:00-06:00', 60, 'cancelled', 4, 2400, 0, 'Priya S.', '@priya_serves'),
];

export function bookingById(id: string): Booking | undefined {
  return BOOKINGS.find((b) => b.id === id);
}

export function bookingsForDay(dayIso: string): Booking[] {
  const ymd = new Date(dayIso).toISOString().slice(0, 10);
  return BOOKINGS.filter((b) => b.startsAtIso.slice(0, 10) === ymd);
}

export function pendingBookings(): Booking[] {
  return BOOKINGS.filter((b) => b.status === 'pending');
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending payment',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};
