import type { Referee, RefereeAssignment } from './types';
import { DEMO_USER_ID } from './users';

export const DEMO_REFEREE_ID = 'ref-alex';

export const REFEREES: Referee[] = [
  // The demo user is also a referee
  {
    id: DEMO_REFEREE_ID,
    userId: DEMO_USER_ID,
    name: 'Alex Park',
    avatarUrl: 'https://i.pravatar.cc/256?u=alex',
    city: 'Denver, CO',
    lat: 39.7392,
    lng: -104.9903,
    sports: ['soccer', 'basketball'],
    certifications: [
      {
        id: 'cert-alex-ussf',
        label: 'USSF Grade 8',
        issuer: 'US Soccer Federation',
        issuedIso: '2024-03-12',
        expiresIso: '2026-03-12',
      },
    ],
    baseHourlyRateCents: 6500,
    travelRadiusMiles: 20,
    availability: {
      tue: { startTime: '18:00', endTime: '22:00' },
      thu: { startTime: '18:00', endTime: '22:00' },
      sat: { startTime: '08:00', endTime: '20:00' },
      sun: { startTime: '08:00', endTime: '18:00' },
    },
    rating: 4.7,
    totalGames: 64,
    bio: 'Calm whistle. Good with players.',
  },
  {
    id: 'ref-jordan',
    userId: 'user-jordan-rivera',
    name: 'Jordan Rivera',
    avatarUrl: 'https://i.pravatar.cc/256?u=jordan',
    city: 'Denver, CO',
    sports: ['basketball'],
    certifications: [],
    baseHourlyRateCents: 5500,
    travelRadiusMiles: 15,
    availability: {
      mon: { startTime: '17:00', endTime: '22:00' },
      wed: { startTime: '17:00', endTime: '22:00' },
      fri: { startTime: '17:00', endTime: '22:00' },
    },
    rating: 4.4,
    totalGames: 28,
    bio: 'Consistent calls. Up the floor.',
  },
  {
    id: 'ref-sam',
    userId: 'user-sam-okafor',
    name: 'Sam Okafor',
    avatarUrl: 'https://i.pravatar.cc/256?u=sam',
    city: 'Aurora, CO',
    sports: ['soccer'],
    certifications: [
      {
        id: 'cert-sam-ussf-7',
        label: 'USSF Grade 7',
        issuer: 'US Soccer Federation',
        issuedIso: '2023-09-04',
      },
    ],
    baseHourlyRateCents: 7500,
    travelRadiusMiles: 25,
    availability: {
      sat: { startTime: '08:00', endTime: '20:00' },
      sun: { startTime: '08:00', endTime: '18:00' },
    },
    rating: 4.8,
    totalGames: 142,
  },
];

export const REFEREE_ASSIGNMENTS: RefereeAssignment[] = [
  // Demo user pending direct assignment
  {
    id: 'ra-alex-pending',
    refereeId: DEMO_REFEREE_ID,
    gameId: 'game-yeti-soccer-w12-comp-1',
    status: 'invited',
    rateCents: 7500,
    payoutStatus: 'pending',
  },
  // Demo user accepted, upcoming
  {
    id: 'ra-alex-accepted',
    refereeId: DEMO_REFEREE_ID,
    gameId: 'game-yeti-hoops-w14-coed-1',
    status: 'accepted',
    rateCents: 6500,
    payoutStatus: 'pending',
  },
  // Demo user completed, ready for report
  {
    id: 'ra-alex-completed',
    refereeId: DEMO_REFEREE_ID,
    gameId: 'game-yeti-soccer-w11-rec-1',
    status: 'accepted',
    rateCents: 6500,
    reportSubmitted: false,
    payoutStatus: 'pending',
  },
];

export function refereeById(id: string): Referee | undefined {
  return REFEREES.find((r) => r.id === id);
}

export function refereeByUserId(userId: string): Referee | undefined {
  return REFEREES.find((r) => r.userId === userId);
}

export function assignmentsForReferee(refereeId: string): RefereeAssignment[] {
  return REFEREE_ASSIGNMENTS.filter((a) => a.refereeId === refereeId);
}

export function assignmentsForGame(gameId: string): RefereeAssignment[] {
  return REFEREE_ASSIGNMENTS.filter((a) => a.gameId === gameId);
}
