import type { Booking } from './types';

/**
 * Bookings — internal (league games) + external (rentals).
 *
 * The FM dashboard demos against the external rental queue (3 requested,
 * 2 approved, 1 rejected) plus several internal-game bookings already on
 * the calendar.
 */

export const BOOKINGS: Booking[] = [
  // Internal: matches the league games above
  {
    id: 'booking-yeti-soccer-w11',
    spaceId: 'space-yeti-turf',
    kind: 'internal_game',
    status: 'completed',
    startIso: '2026-04-12T10:00:00Z',
    endIso: '2026-04-12T11:30:00Z',
    gameId: 'game-yeti-soccer-w11-rec-1',
    amountCents: 0,
  },
  {
    id: 'booking-yeti-soccer-w12',
    spaceId: 'space-yeti-turf',
    kind: 'internal_game',
    status: 'approved',
    startIso: '2026-04-19T10:00:00Z',
    endIso: '2026-04-19T11:30:00Z',
    gameId: 'game-yeti-soccer-w12-comp-1',
    amountCents: 0,
  },
  {
    id: 'booking-yeti-hoops-w14',
    spaceId: 'space-summit-court-1',
    kind: 'internal_game',
    status: 'approved',
    startIso: '2026-04-21T01:00:00Z',
    endIso: '2026-04-21T02:30:00Z',
    gameId: 'game-yeti-hoops-w14-coed-1',
    amountCents: 0,
  },

  // External rental requests — Pending FM review
  {
    id: 'booking-ext-northwest-fc-1',
    spaceId: 'space-yeti-outdoor-1',
    kind: 'external_rental',
    status: 'requested',
    startIso: '2026-04-26T20:00:00Z',
    endIso: '2026-04-26T22:00:00Z',
    externalRenter: {
      organizationName: 'Northwest FC',
      contactName: 'Lacey Burnett',
      contactEmail: 'lacey@nwfc.test',
      contactPhone: '+1 720-555-0148',
      intendedUse: 'Adult co-ed friendly match',
    },
    amountCents: 24000,
    notes: 'Will need lights from 8 PM.',
  },
  {
    id: 'booking-ext-foothills-vb-1',
    spaceId: 'space-summit-court-2',
    kind: 'external_rental',
    status: 'requested',
    startIso: '2026-04-23T19:00:00Z',
    endIso: '2026-04-23T21:00:00Z',
    externalRenter: {
      organizationName: 'Foothills Volleyball Club',
      contactName: 'Marcus Tate',
      contactEmail: 'marcus@foothillsvb.test',
      intendedUse: 'Practice + scrimmage for U16 squad',
    },
    amountCents: 13000,
  },
  {
    id: 'booking-ext-mile-high-pball-1',
    spaceId: 'space-yeti-court-b',
    kind: 'external_rental',
    status: 'requested',
    startIso: '2026-04-25T16:00:00Z',
    endIso: '2026-04-25T18:00:00Z',
    externalRenter: {
      organizationName: 'Mile High Pickleball',
      contactName: 'Eve Larson',
      contactEmail: 'eve@mhp.test',
      intendedUse: 'Saturday open play for members',
    },
    amountCents: 19000,
  },

  // External rental — Approved (locked on the calendar)
  {
    id: 'booking-ext-thunder-bball-1',
    spaceId: 'space-summit-court-2',
    kind: 'external_rental',
    status: 'approved',
    startIso: '2026-04-20T18:00:00Z',
    endIso: '2026-04-20T20:00:00Z',
    externalRenter: {
      organizationName: 'Thunder Basketball',
      contactName: 'Devin Park',
      contactEmail: 'devin@thunder.test',
      intendedUse: 'Skills clinic for 7th graders',
    },
    amountCents: 13000,
  },
  {
    id: 'booking-ext-meridian-flag-1',
    spaceId: 'space-yeti-outdoor-1',
    kind: 'external_rental',
    status: 'approved',
    startIso: '2026-04-19T16:00:00Z',
    endIso: '2026-04-19T18:00:00Z',
    externalRenter: {
      organizationName: 'Meridian Flag Football',
      contactName: 'Renee Cho',
      contactEmail: 'renee@meridianflag.test',
      intendedUse: 'Sunday game (week 4 of 6).',
    },
    amountCents: 24000,
  },

  // External rental — Rejected (for FM history)
  {
    id: 'booking-ext-late-night-1',
    spaceId: 'space-yeti-court-a',
    kind: 'external_rental',
    status: 'rejected',
    startIso: '2026-04-22T05:00:00Z',
    endIso: '2026-04-22T07:00:00Z',
    externalRenter: {
      organizationName: 'After Hours Hoops',
      contactName: 'Theo Vega',
      contactEmail: 'theo@afterhours.test',
      intendedUse: 'Late-night runs',
    },
    amountCents: 17000,
    notes: 'Outside operating hours. Suggested 8–10 PM instead.',
  },
];

export function bookingById(id: string): Booking | undefined {
  return BOOKINGS.find((b) => b.id === id);
}

export function bookingsForSpace(spaceId: string): Booking[] {
  return BOOKINGS.filter((b) => b.spaceId === spaceId);
}

export function pendingExternalRentals(): Booking[] {
  return BOOKINGS.filter(
    (b) => b.kind === 'external_rental' && b.status === 'requested',
  );
}

export function approvedBookings(): Booking[] {
  return BOOKINGS.filter((b) => b.status === 'approved');
}
