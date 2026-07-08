/**
 * @sports-yeti/mocks — entity types.
 *
 * These interfaces are the API contract for the marketplace UI plan.
 * Screens depend on these types, not on the fixture arrays. When real
 * APIs land, swap the fixtures for fetchers that return the same shape.
 *
 * Naming conventions:
 * - All IDs are `string` (UUID-shaped in fixtures).
 * - All datetimes are ISO 8601 strings ending `*Iso`.
 * - All money fields are integer cents ending `*Cents` to avoid float drift.
 */

// ---------------------------------------------------------------------------
// Sport
// ---------------------------------------------------------------------------

export type SportKey =
  | 'soccer'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'baseball'
  | 'softball'
  | 'hockey'
  | 'pickleball'
  | 'flag_football'
  | 'lacrosse';

export type SkillLevel =
  | 'recreational'
  | 'intermediate'
  | 'competitive'
  | 'elite';

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export interface OrganizationSocialLinks {
  x?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  city: string;
  state: string;
  country: string;
  /** Hex string used as the brand accent override on org-scoped surfaces. */
  brandColor: string;
  /** Optional secondary brand color for gradient hero sections. */
  brandColorAccent?: string;
  ownerUserId: string;
  socialLinks: OrganizationSocialLinks;
  /** OAuth state for cross-posting — mocked. */
  socialIntegrationStatus: Partial<
    Record<keyof OrganizationSocialLinks, 'connected' | 'expired' | 'disconnected'>
  >;
  createdAtIso: string;
}

// ---------------------------------------------------------------------------
// League / Season / Division
// ---------------------------------------------------------------------------

export type LeagueFormat =
  | 'round_robin'
  | 'single_elim'
  | 'double_elim'
  | 'round_robin_playoff'
  | 'self_scheduled';

export type SeasonCycle = 'spring_summer' | 'fall_winter';

export type SeasonStatus =
  | 'draft'
  | 'registration_open'
  | 'in_progress'
  | 'completed'
  | 'archived';

export type DivisionStatus =
  | 'draft'
  | 'open'
  | 'closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface League {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  sport: SportKey;
  /** Free-form copy (e.g. "Co-ed 7v7 Soccer"). */
  sportTagline: string;
  city: string;
  description: string;
  logoUrl?: string;
  rulesUrl?: string;
  /** Convenience pointer — the most recent in-progress / open season. */
  activeSeasonId?: string;
  createdAtIso: string;
}

export interface Season {
  id: string;
  organizationId: string;
  leagueId: string;
  label: string;
  cycle: SeasonCycle;
  year: number;
  startIso: string;
  endIso: string;
  status: SeasonStatus;
  /** Recurring slot for the season (e.g. "Sun · 9 AM – 1 PM"). */
  weeklySlotLabel?: string;
  format: LeagueFormat;
  /** Number of weeks of regular play. */
  regularWeeks: number;
  /** Number of weeks of playoff (0 = no playoff). */
  playoffWeeks: number;
}

export interface Division {
  id: string;
  organizationId: string;
  leagueId: string;
  seasonId: string;
  name: string;
  skillLevel: SkillLevel;
  /** Optional age band (e.g. "18+", "U14"). Omit for open. */
  ageBand?: string;
  maxTeams: number;
  registeredTeams: number;
  /** Per-team registration fee in cents. */
  registrationFeeCents: number;
  registrationOpensIso: string;
  registrationClosesIso: string;
  status: DivisionStatus;
  /** Optional custom roster size override (otherwise derived from sport). */
  rosterMin?: number;
  rosterMax?: number;
}

export type TournamentStatus =
  | 'draft'
  | 'registration_open'
  | 'in_progress'
  | 'completed';

/**
 * A one-off bracketed competition a league runs for teams to register into.
 * Unlike a `Season` (recurring weekly play), a tournament is a bounded event
 * with a single elimination-style `format` and a per-team entry fee.
 */
export interface Tournament {
  id: string;
  organizationId: string;
  leagueId: string;
  name: string;
  format: LeagueFormat;
  startIso: string;
  endIso: string;
  registrationClosesIso: string;
  maxTeams: number;
  registeredTeams: number;
  /** Per-team entry fee in cents. */
  feeCents: number;
  status: TournamentStatus;
  venue: string;
  city: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Team / Player
// ---------------------------------------------------------------------------

export type TeamStatus =
  | 'forming'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export type RosterPaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type RosterRole = 'captain' | 'co_captain' | 'player' | 'sub';

export interface RosterMember {
  id: string;
  teamId: string;
  playerId: string;
  role: RosterRole;
  paymentStatus: RosterPaymentStatus;
  /** Whether all required waivers for this division/facility are signed. */
  waiversSigned: boolean;
  joinedAtIso: string;
}

export interface Team {
  id: string;
  organizationId?: string;
  divisionId?: string;
  /** Independent (no division yet) teams allowed. */
  status: TeamStatus;
  name: string;
  sport: SportKey;
  skillLevel: SkillLevel;
  city: string;
  logoUrl?: string;
  captainPlayerId: string;
  rosterSize: number;
  rosterMin: number;
  rosterMax: number;
  /** Total registration fee for the team in cents (denormalized from division). */
  registrationFeeCents: number;
  /** Optional captain override of the per-player split in cents. */
  perPlayerOverrideCents?: number;
  createdAtIso: string;
}

export type PlayerAvailabilityFlag =
  | 'looking_for_team'
  | 'available_to_sub'
  | 'unavailable';

export type PlayerPrivacy = 'public' | 'org_only' | 'team_only' | 'private';

export interface PlayerCertification {
  id: string;
  label: string;
  issuer: string;
  issuedIso: string;
  expiresIso?: string;
  fileUrl?: string;
}

export interface Player {
  id: string;
  userId: string;
  /** Display name (mirrored from user; cached here for fixture brevity). */
  name: string;
  avatarUrl?: string;
  city: string;
  /** Optional geo for distance filters. */
  lat?: number;
  lng?: number;
  /** Multiple sports — sport-agnostic. */
  sports: SportKey[];
  position?: string;
  skillLevel: SkillLevel;
  /** Two independent flags per the journey: looking-for-team + available-to-sub. */
  availabilityFlags: PlayerAvailabilityFlag[];
  privacy: PlayerPrivacy;
  bio?: string;
  certifications: PlayerCertification[];
  highlightLinks: string[];
  /** Aggregated career stats by sport (populated from games). */
  careerStatsBySport?: Partial<Record<SportKey, Record<string, number>>>;
}

// ---------------------------------------------------------------------------
// Facility / Space
// ---------------------------------------------------------------------------

export type SpaceRentalMode = 'internal' | 'external' | 'both';

export interface Facility {
  id: string;
  ownerOrgId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
  imageUrls: string[];
  amenities: string[];
  createdAtIso: string;
}

export interface FacilityOwnership {
  id: string;
  facilityId: string;
  ownerOrgId: string;
  /** User IDs of facility managers for this facility. */
  managerUserIds: string[];
}

export interface Space {
  id: string;
  facilityId: string;
  name: string;
  sports: SportKey[];
  /** Indoor / outdoor / turf / hardwood / etc. */
  surface: string;
  capacity: number;
  isIndoor: boolean;
}

export interface SpaceRentalConfig {
  id: string;
  spaceId: string;
  rentalMode: SpaceRentalMode;
  externalHourlyRateCents?: number;
  internalLeagueIds?: string[];
  /** ISO date strings the space is unavailable. */
  blackoutDates?: string[];
}

export type Weekday =
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat';

export interface RecurringAvailabilitySlot {
  id: string;
  spaceId: string;
  weekday: Weekday;
  /** 24h "HH:MM" inclusive. */
  startTime: string;
  /** 24h "HH:MM" exclusive. */
  endTime: string;
  /** Effective season window (optional). */
  effectiveFromIso?: string;
  effectiveToIso?: string;
  /** Per-slot pricing override in cents. */
  hourlyRateCents?: number;
  /** Marks the slot as peak/off-peak for analytics. */
  isPeak?: boolean;
}

// ---------------------------------------------------------------------------
// Booking / Game
// ---------------------------------------------------------------------------

export type BookingKind = 'internal_game' | 'external_rental';

export type BookingStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface Booking {
  id: string;
  spaceId: string;
  kind: BookingKind;
  status: BookingStatus;
  startIso: string;
  endIso: string;
  /** Internal: linked game. External: requesting renter. */
  gameId?: string;
  externalRenter?: {
    organizationName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    intendedUse: string;
  };
  amountCents: number;
  notes?: string;
}

export type GameStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export type GameKind = 'league' | 'open_play';

export interface Game {
  id: string;
  kind: GameKind;
  divisionId?: string;
  seasonId?: string;
  organizationId?: string;
  sport: SportKey;
  homeTeamId?: string;
  awayTeamId?: string;
  /** Open-play roster (when no teams). */
  rosterPlayerIds?: string[];
  facilityId: string;
  spaceId: string;
  startIso: string;
  endIso: string;
  status: GameStatus;
  homeScore?: number;
  awayScore?: number;
  /** Open-play fee per joining player in cents (0 = free). */
  perPlayerFeeCents?: number;
  refereeRequired: boolean;
  /** Optional base rate offered when opening to bid in cents. */
  refereeBaseRateCents?: number;
  refereeMarketStatus?: 'closed' | 'open_to_bid' | 'assigned';
  highlightUrls?: string[];
}

// ---------------------------------------------------------------------------
// Referee / Assignment
// ---------------------------------------------------------------------------

export type RefereeAssignmentStatus =
  | 'invited'
  | 'pending_bid'
  | 'accepted'
  | 'rejected'
  | 'completed';

export interface Referee {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  city: string;
  lat?: number;
  lng?: number;
  sports: SportKey[];
  certifications: PlayerCertification[];
  /** Declared base hourly rate (the floor for marketplace bids). */
  baseHourlyRateCents: number;
  travelRadiusMiles: number;
  /** Per-weekday availability; absent weekday = unavailable. */
  availability: Partial<Record<Weekday, { startTime: string; endTime: string }>>;
  rating: number;
  totalGames: number;
  bio?: string;
}

export interface RefereeAssignment {
  id: string;
  refereeId: string;
  gameId: string;
  status: RefereeAssignmentStatus;
  /** Direct rate (if directly assigned) or accepted bid amount. */
  rateCents: number;
  bidMessage?: string;
  reportSubmitted?: boolean;
  /** Earnings flow: pending until report; settled after FM/admin sign-off. */
  payoutStatus: 'pending' | 'settled' | 'voided';
}

// ---------------------------------------------------------------------------
// Sub Request
// ---------------------------------------------------------------------------

export type SubRequestStatus =
  | 'open'
  | 'pending_captain_confirm'
  | 'filled'
  | 'cancelled';

export interface SubRequest {
  id: string;
  gameId: string;
  teamId: string;
  position?: string;
  skillLevel?: SkillLevel;
  message?: string;
  status: SubRequestStatus;
  /** Two-step: applicant pool, then captain confirms one. */
  applicantPlayerIds: string[];
  filledPlayerId?: string;
  createdAtIso: string;
}

// ---------------------------------------------------------------------------
// Waivers
// ---------------------------------------------------------------------------

export type WaiverScopeKind =
  | 'organization'
  | 'league'
  | 'division'
  | 'facility';

export interface Waiver {
  id: string;
  /** Waiver scope — who requires it. */
  scopeKind: WaiverScopeKind;
  scopeId: string;
  title: string;
  version: string;
  body: string;
  /** Required waivers block play; optional don't. */
  isRequired: boolean;
  effectiveFromIso: string;
  expiresAfterDays?: number;
}

export interface WaiverSignature {
  id: string;
  waiverId: string;
  userId: string;
  signedAtIso: string;
  /** SHA-style mock hash used for the audit trail. */
  signatureHash: string;
}

/** Per-user waiver state — what's required, what's signed, what's blocking. */
export interface WaiverGateState {
  userId: string;
  required: Waiver[];
  signed: WaiverSignature[];
  blocking: Waiver[];
}

// ---------------------------------------------------------------------------
// News / Promotions
// ---------------------------------------------------------------------------

export type NewsAudience = 'public' | 'org' | 'league' | 'division' | 'team';

export type NewsStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'archived';

export interface NewsArticle {
  id: string;
  organizationId: string;
  leagueId?: string;
  divisionId?: string;
  teamId?: string;
  title: string;
  body: string;
  audience: NewsAudience;
  status: NewsStatus;
  authorUserId: string;
  publishedAtIso?: string;
  scheduledForIso?: string;
  heroImageUrl?: string;
  tags: string[];
  socialDraftIds: string[];
}

export type SocialChannel = 'x' | 'facebook' | 'instagram' | 'linkedin';

export type SocialPostStatus =
  | 'draft'
  | 'scheduled'
  | 'posted'
  | 'failed';

export interface SocialPostDraft {
  id: string;
  newsId: string;
  channels: SocialChannel[];
  status: SocialPostStatus;
  scheduledIso?: string;
  postedAtIso?: string;
  /** Per-channel copy — IG-square preview vs X 280-char preview etc. */
  copyByChannel: Partial<Record<SocialChannel, string>>;
  imageUrl?: string;
  failureReason?: string;
}

// ---------------------------------------------------------------------------
// Roles (stackable)
// ---------------------------------------------------------------------------

export type Role =
  | 'org_admin'
  | 'league_admin'
  | 'facility_manager'
  | 'team_captain'
  | 'referee'
  | 'player';

export interface RoleAssignment {
  role: Role;
  /** Org / League / Facility / Team ID this role applies to. Player + Referee scope-less. */
  scopeId?: string;
  scopeLabel?: string;
  /** First role activated (drives initial nav). */
  isPrimary?: boolean;
  activatedAtIso: string;
}

export interface RoleStack {
  userId: string;
  roles: RoleAssignment[];
}

// ---------------------------------------------------------------------------
// User (compact representation used by mocks)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  /** Optional explicit org membership (an FM might belong to one org but ref for many). */
  primaryOrgId?: string;
}
