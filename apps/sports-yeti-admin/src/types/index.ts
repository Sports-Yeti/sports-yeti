// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
}

// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  timezone: string;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  player: Player | null;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
}

export interface AuthTokens {
  token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Player types
export interface Player {
  id: string;
  user_id: number;
  league_id: string | null;
  bio: string | null;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  availability_status: 'available' | 'looking_for_team' | 'unavailable';
  is_private: boolean;
  position: string | null;
  height_inches: number | null;
  weight_lbs: number | null;
  date_of_birth: string | null;
  stats: Record<string, unknown> | null;
  user?: User;
  league?: League;
  teams?: Team[];
}

// League types
export interface League {
  id: string;
  name: string;
  description: string | null;
  admin_id: number;
  sport_type: string;
  location: string | null;
  timezone: string;
  registration_fee: number;
  is_active: boolean;
  settings: Record<string, unknown> | null;
  created_at: string;
  admin?: User;
  teams_count?: number;
  players_count?: number;
}

// Team types
export interface Team {
  id: string;
  name: string;
  league_id: string;
  captain_id: string;
  description: string | null;
  logo_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  max_roster_size: number;
  stats: Record<string, unknown> | null;
  league?: League;
  captain?: Player;
  players?: Player[];
  players_count?: number;
}

// Facility types
export interface Facility {
  id: string;
  league_id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  operating_hours: Record<string, { open: string; close: string }> | null;
  amenities: string[] | null;
  image_url: string | null;
  is_active: boolean;
  league?: League;
  spaces?: Space[];
  spaces_count?: number;
}

export interface Space {
  id: string;
  facility_id: string;
  name: string;
  description: string | null;
  sport_type: string;
  capacity: number;
  hourly_rate: number;
  surface_type: string | null;
  is_indoor: boolean;
  is_active: boolean;
  features: string[] | null;
  facility?: Facility;
}

// Booking types
export interface Booking {
  id: string;
  space_id: string;
  user_id: number;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount: number;
  qr_code: string | null;
  qr_code_url: string | null;
  purpose: string | null;
  notes: string | null;
  checked_in_at: string | null;
  space?: Space;
  user?: User;
}

// Payment types
export interface Payment {
  id: string;
  user_id: number;
  league_id: string | null;
  booking_id: string | null;
  payable_type: string | null;
  payable_id: string | null;
  amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  type: 'league_registration' | 'camp_registration' | 'facility_booking';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  idempotency_key: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user?: User;
  booking?: Booking;
  league?: League;
  payable?: unknown;
}

export interface RefundResult {
  refund_id: string;
  amount: number;
}

// Audit log types
export interface AuditLog {
  id: string;
  log_name: string;
  description: string;
  subject_type: string | null;
  subject_id: string | null;
  subject?: unknown;
  causer_type: string | null;
  causer_id: string | null;
  causer?: User;
  properties: AuditLogProperties;
  batch_uuid: string | null;
  event: 'created' | 'updated' | 'deleted' | string;
  created_at: string;
}

export interface AuditLogProperties {
  attributes?: Record<string, unknown>;
  old?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AuditStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_subject: Record<string, number>;
  most_active_users: Array<{
    user_id: string;
    user: User | null;
    action_count: number;
  }>;
  activity_timeline: Record<string, number>;
}

// Dashboard stats types
export interface DashboardStats {
  total_leagues: number;
  total_teams: number;
  total_players: number;
  total_bookings: number;
  revenue_this_month: number;
  active_games: number;
  recent_signups: number;
  pending_bookings: number;
}

// Navigation types
export type MainStackParamList = {
  Dashboard: undefined;
  Leagues: undefined;
  LeagueDetail: { id: string };
  LeagueForm: { id?: string };
  Teams: undefined;
  TeamDetail: { id: string };
  Players: undefined;
  PlayerDetail: { id: string };
  Facilities: undefined;
  FacilityDetail: { id: string };
  FacilityForm: { id?: string };
  Bookings: undefined;
  Payments: undefined;
  PaymentDetail: { id: string };
  AuditLogs: undefined;
};
