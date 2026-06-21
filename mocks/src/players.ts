import type { Player } from './types';
import { DEMO_USER_ID } from './users';

/**
 * Player fixtures.
 *
 * The demo user (Alex) plays soccer + basketball — proves the
 * sport-agnostic profile rendering. A few directory players carry the
 * `looking_for_team` and `available_to_sub` flags independently to
 * demonstrate the two-toggle journey requirement.
 */

export const DEMO_PLAYER_ID = 'player-alex';

export const PLAYERS: Player[] = [
  {
    id: DEMO_PLAYER_ID,
    userId: DEMO_USER_ID,
    name: 'Alex Park',
    avatarUrl: 'https://i.pravatar.cc/256?u=alex',
    city: 'Denver, CO',
    lat: 39.7392,
    lng: -104.9903,
    sports: ['soccer', 'basketball'],
    position: 'Midfielder / Guard',
    skillLevel: 'competitive',
    availabilityFlags: ['available_to_sub'],
    privacy: 'public',
    bio: 'Plays everywhere. Will bring oranges.',
    certifications: [
      {
        id: 'cert-alex-cpr',
        label: 'CPR / First Aid',
        issuer: 'American Red Cross',
        issuedIso: '2025-04-01',
        expiresIso: '2027-04-01',
      },
    ],
    highlightLinks: ['https://youtu.be/dQw4w9WgXcQ'],
    careerStatsBySport: {
      soccer: { gamesPlayed: 38, goals: 21, assists: 14, cleanSheets: 6 },
      basketball: { gamesPlayed: 22, points: 264, rebounds: 88, assists: 47 },
    },
  },
  {
    id: 'player-jordan',
    userId: 'user-jordan-rivera',
    name: 'Jordan Rivera',
    avatarUrl: 'https://i.pravatar.cc/256?u=jordan',
    city: 'Denver, CO',
    lat: 39.752,
    lng: -104.99,
    sports: ['basketball'],
    position: 'Forward',
    skillLevel: 'competitive',
    availabilityFlags: [],
    privacy: 'public',
    bio: 'Rim runner. Catch + finish.',
    certifications: [],
    highlightLinks: [],
    careerStatsBySport: {
      basketball: { gamesPlayed: 41, points: 612, rebounds: 280, assists: 110 },
    },
  },
  {
    id: 'player-sam',
    userId: 'user-sam-okafor',
    name: 'Sam Okafor',
    avatarUrl: 'https://i.pravatar.cc/256?u=sam',
    city: 'Denver, CO',
    lat: 39.7295,
    lng: -104.9972,
    sports: ['soccer'],
    position: 'Defender',
    skillLevel: 'intermediate',
    availabilityFlags: ['looking_for_team', 'available_to_sub'],
    privacy: 'public',
    bio: 'Reliable in the back. Will learn your system.',
    certifications: [],
    highlightLinks: [],
  },
  {
    id: 'player-priya',
    userId: 'user-priya-mehta',
    name: 'Priya Mehta',
    avatarUrl: 'https://i.pravatar.cc/256?u=priya',
    city: 'Boulder, CO',
    lat: 40.015,
    lng: -105.27,
    sports: ['pickleball'],
    position: 'Singles + Doubles',
    skillLevel: 'competitive',
    availabilityFlags: ['available_to_sub'],
    privacy: 'public',
    bio: '3.5 DUPR. Loves a good lob.',
    certifications: [],
    highlightLinks: [],
  },
  {
    id: 'player-mateo',
    userId: 'user-mateo-luna',
    name: 'Mateo Luna',
    avatarUrl: 'https://i.pravatar.cc/256?u=mateo',
    city: 'Denver, CO',
    lat: 39.7619,
    lng: -104.881,
    sports: ['soccer', 'flag_football'],
    position: 'Striker',
    skillLevel: 'recreational',
    availabilityFlags: ['looking_for_team'],
    privacy: 'org_only',
    bio: 'Joined Yeti two months ago. Looking for a team that runs.',
    certifications: [],
    highlightLinks: [],
  },
  {
    id: 'player-zara',
    userId: 'user-zara-kim',
    name: 'Zara Kim',
    avatarUrl: 'https://i.pravatar.cc/256?u=zara',
    city: 'Denver, CO',
    lat: 39.7405,
    lng: -104.9854,
    sports: ['volleyball', 'basketball'],
    position: 'Setter / PG',
    skillLevel: 'competitive',
    availabilityFlags: [],
    privacy: 'team_only',
    bio: 'Sets, sets, sets. Will not pass.',
    certifications: [],
    highlightLinks: [],
  },
];

export function playerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function playerByUserId(userId: string): Player | undefined {
  return PLAYERS.find((p) => p.userId === userId);
}

export function playersLookingForTeam(): Player[] {
  return PLAYERS.filter((p) => p.availabilityFlags.includes('looking_for_team'));
}

export function playersAvailableToSub(): Player[] {
  return PLAYERS.filter((p) => p.availabilityFlags.includes('available_to_sub'));
}
