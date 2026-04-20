import type { Waiver, WaiverGateState, WaiverSignature } from './types';
import { DEMO_ORG_ID } from './organizations';
import { DEMO_USER_ID, USERS } from './users';

/**
 * Waivers required across the demo org and its facilities. The demo user
 * Alex has signed the org-wide waiver but NOT the facility-specific
 * Yeti Center facility-use waiver — so the WaiverGate blocks Alex from
 * any facility check-in or game join until they sign it.
 */

export const WAIVERS: Waiver[] = [
  {
    id: 'waiver-yeti-org-2026',
    scopeKind: 'organization',
    scopeId: DEMO_ORG_ID,
    title: 'Yeti Collective — Adult Liability Waiver',
    version: '2026.1',
    body:
      'I understand the risks of participating in athletic activities organized by Yeti Collective and assume those risks. I release Yeti Collective from liability for injuries sustained during play.',
    isRequired: true,
    effectiveFromIso: '2026-01-01',
    expiresAfterDays: 365,
  },
  {
    id: 'waiver-yeti-center-facility',
    scopeKind: 'facility',
    scopeId: 'facility-yeti-center',
    title: 'Yeti Center — Facility Use Waiver',
    version: '2025.2',
    body:
      'I agree to follow all Yeti Center rules including locker room conduct, equipment handling, and emergency procedures.',
    isRequired: true,
    effectiveFromIso: '2025-09-01',
    expiresAfterDays: 365,
  },
  {
    id: 'waiver-summit-rec-facility',
    scopeKind: 'facility',
    scopeId: 'facility-summit-rec',
    title: 'Summit Rec — Facility Use Waiver',
    version: '2025.1',
    body:
      'I acknowledge Summit Rec Center’s rules and agree to follow staff direction at all times.',
    isRequired: true,
    effectiveFromIso: '2025-09-01',
  },
  {
    id: 'waiver-yeti-soccer-comp',
    scopeKind: 'division',
    scopeId: 'div-yeti-soccer-comp-spring-2026',
    title: 'Competitive D1 — Code of Conduct',
    version: '2026.1',
    body:
      'I agree to the Code of Conduct and zero-tolerance policy for referee abuse in the Competitive D1 division.',
    isRequired: true,
    effectiveFromIso: '2026-02-01',
  },
  {
    id: 'waiver-front-range-org',
    scopeKind: 'organization',
    scopeId: 'org-front-range-sports',
    title: 'Front Range Sports — Liability Waiver',
    version: '2025.1',
    body:
      'I assume risks associated with outdoor pickleball play including weather and surface conditions.',
    isRequired: true,
    effectiveFromIso: '2025-01-01',
  },
];

export const WAIVER_SIGNATURES: WaiverSignature[] = [
  // Alex has signed the org waiver but NOT the facility-use waiver.
  {
    id: 'sig-alex-org',
    waiverId: 'waiver-yeti-org-2026',
    userId: DEMO_USER_ID,
    signedAtIso: '2026-01-15T19:42:00Z',
    signatureHash: 'sha256:demo:alex:org',
  },
  // Other users have full coverage to keep the inbox realistic.
  ...USERS.filter((u) => u.id !== DEMO_USER_ID).flatMap<WaiverSignature>((u) => [
    {
      id: `sig-${u.id}-org`,
      waiverId: 'waiver-yeti-org-2026',
      userId: u.id,
      signedAtIso: '2026-01-20T12:00:00Z',
      signatureHash: `sha256:demo:${u.id}:org`,
    },
    {
      id: `sig-${u.id}-yeti-center`,
      waiverId: 'waiver-yeti-center-facility',
      userId: u.id,
      signedAtIso: '2025-09-10T18:00:00Z',
      signatureHash: `sha256:demo:${u.id}:yeti-center`,
    },
  ]),
];

export function waiverById(id: string): Waiver | undefined {
  return WAIVERS.find((w) => w.id === id);
}

export function signaturesForUser(userId: string): WaiverSignature[] {
  return WAIVER_SIGNATURES.filter((s) => s.userId === userId);
}

/**
 * Compute a `WaiverGateState` for a user against a list of waiver scopes.
 * UI surfaces consume this rather than computing it inline. `requiredScopes`
 * lets a screen pass in only the scopes relevant to the action being gated
 * (e.g., joining a game checks the org + facility scopes for that game).
 */
export function computeWaiverGate(
  userId: string,
  requiredScopes: { kind: Waiver['scopeKind']; scopeId: string }[],
): WaiverGateState {
  const required = WAIVERS.filter(
    (w) =>
      w.isRequired &&
      requiredScopes.some(
        (s) => s.kind === w.scopeKind && s.scopeId === w.scopeId,
      ),
  );
  const signed = signaturesForUser(userId);
  const signedIds = new Set(signed.map((s) => s.waiverId));
  const blocking = required.filter((w) => !signedIds.has(w.id));
  return { userId, required, signed, blocking };
}
