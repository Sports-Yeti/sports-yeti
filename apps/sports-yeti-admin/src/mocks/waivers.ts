import { LEAGUES } from './leagues';
import { peopleByKind } from './people';

export interface Waiver {
  id: string;
  leagueId: string;
  leagueName: string;
  title: string;
  isRequired: boolean;
  signatureCount: number;
  totalRequired: number;
  effectiveIso: string;
  expiresIso?: string;
  bodyExcerpt: string;
}

export interface WaiverSignature {
  id: string;
  waiverId: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  signedAtIso: string;
  ipAddress: string;
}

const players = peopleByKind('player');

export const WAIVERS: Waiver[] = [
  {
    id: 'waiver-liability-2026',
    leagueId: LEAGUES[0]!.id,
    leagueName: LEAGUES[0]!.name,
    title: 'General Liability Release · 2026',
    isRequired: true,
    signatureCount: 132,
    totalRequired: LEAGUES[0]!.registeredPlayers,
    effectiveIso: '2026-01-01T00:00:00Z',
    expiresIso: '2026-12-31T23:59:59Z',
    bodyExcerpt:
      'I assume the risks inherent in athletic participation and release Yeti Athletic Co. from liability for injuries sustained during sanctioned activities…',
  },
  {
    id: 'waiver-aurora-hockey',
    leagueId: LEAGUES[1]!.id,
    leagueName: LEAGUES[1]!.name,
    title: 'Aurora Hockey D2 Waiver',
    isRequired: true,
    signatureCount: 142,
    totalRequired: LEAGUES[1]!.registeredPlayers,
    effectiveIso: '2026-08-01T00:00:00Z',
    expiresIso: '2027-04-30T23:59:59Z',
    bodyExcerpt:
      'Hockey-specific risks acknowledged. Required protective gear list and ice-condition disclaimers included…',
  },
  {
    id: 'waiver-concussion',
    leagueId: LEAGUES[0]!.id,
    leagueName: LEAGUES[0]!.name,
    title: 'Concussion Awareness',
    isRequired: true,
    signatureCount: 96,
    totalRequired: LEAGUES[0]!.registeredPlayers,
    effectiveIso: '2025-08-12T00:00:00Z',
    expiresIso: '2026-08-12T23:59:59Z',
    bodyExcerpt:
      'I have reviewed the symptoms of concussion and agree to follow return-to-play protocols issued by the league medical lead…',
  },
  {
    id: 'waiver-coastal-photo',
    leagueId: LEAGUES[2]!.id,
    leagueName: LEAGUES[2]!.name,
    title: 'Photo & Video Release',
    isRequired: false,
    signatureCount: 18,
    totalRequired: LEAGUES[2]!.registeredPlayers,
    effectiveIso: '2026-04-01T00:00:00Z',
    bodyExcerpt:
      'I grant Yeti Athletic permission to use my likeness in promotional materials. This release is optional and may be revoked in writing.',
  },
];

export function waiverById(id: string): Waiver | undefined {
  return WAIVERS.find((w) => w.id === id);
}

export function signaturesFor(waiverId: string): WaiverSignature[] {
  const waiver = waiverById(waiverId);
  if (!waiver) return [];
  return players.slice(0, Math.min(waiver.signatureCount, players.length)).map((p, i) => ({
    id: `sig-${waiverId}-${i}`,
    waiverId,
    playerId: p.id,
    playerName: p.name,
    playerAvatar: p.avatar,
    signedAtIso: new Date(Date.now() - i * 86_400_000).toISOString(),
    ipAddress: `192.0.2.${10 + (i % 100)}`,
  }));
}
