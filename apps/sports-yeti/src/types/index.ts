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

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  roles?: string[];
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

// Camp types
export interface Camp {
  id: string;
  league_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  registration_fee: number;
  max_participants: number;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  age_group: string | null;
  status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';
  image_url: string | null;
  league?: League;
  registrations_count?: number;
}

// Game types
export interface Game {
  id: string;
  league_id: string | null;
  team1_id: string | null;
  team2_id: string | null;
  facility_id: string | null;
  space_id: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  team1_score: number | null;
  team2_score: number | null;
  winner_team_id: string | null;
  game_type: 'regular' | 'playoff' | 'friendly';
  is_open_play?: boolean;
  max_players?: number | null;
  current_players?: number;
  referee_required?: boolean;
  league?: League;
  team1?: Team;
  team2?: Team;
  facility?: Facility;
}

// Referee types
export interface Referee {
  id: string;
  user_id: number;
  league_id: string | null;
  sport_types: string[];
  experience_level: string;
  certification: string | null;
  hourly_rate: number;
  rating: number;
  total_games: number;
  is_available: boolean;
  bio: string | null;
  radius_miles?: number | null;
  created_at: string;
  user?: User;
  league?: League;
}

export interface RefereeAssignment {
  id: string;
  referee_id: string;
  game_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_rate: number;
  is_bidding: boolean;
  bid_amount: number | null;
  admin_approved: boolean;
  report: string | null;
  rating_given: number | null;
  referee?: Referee;
  game?: Game;
}

export interface RefereeEarnings {
  total_earned: number;
  pending_payouts: number;
  completed_games: number;
  average_rating: number;
  recent_earnings: Array<{
    id: string;
    game_id: string;
    amount: number;
    date: string;
    game?: Game;
  }>;
}

// Chat types
export interface Chat {
  id: string;
  game_id: string | null;
  team_id: string | null;
  league_id: string | null;
  type: 'game' | 'team' | 'league' | 'direct';
  name: string | null;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: number;
  message: string;
  message_type: 'text' | 'image' | 'poll' | 'system';
  media_url: string | null;
  is_pinned: boolean;
  created_at: string;
  user?: User;
}

export interface ChatPoll {
  id: string;
  chat_id: string;
  question: string;
  options: string[];
  vote_counts: Record<string, number>;
  is_closed: boolean;
  closes_at: string | null;
  created_at: string;
}

// SSE Event types
export type SSEEventType = 'message' | 'poll_update' | 'heartbeat' | 'error' | 'open' | 'close';

export interface SSEMessageEvent {
  id: string;
  user_id: number;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  message: string;
  message_type: 'text' | 'image' | 'poll' | 'system';
  created_at: string;
}

export interface SSEPollUpdateEvent {
  id: string;
  question: string;
  options: string[];
  vote_counts: Record<string, number>;
  is_closed: boolean;
}

export interface SSEHeartbeatEvent {
  timestamp: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

// Highlight types
export interface HighlightClip {
  id: string;
  highlight_id: string;
  clip_path: string;
  thumbnail_path: string | null;
  clip_url: string;
  thumbnail_url: string | null;
  title: string;
  description: string;
  start_time: number;
  end_time: number;
  excitement_score: number;
  sort_order: number;
}

export interface HighlightSummary {
  id: string;
  user_id: number;
  post_id: string | null;
  status: 'pending_payment' | 'processing' | 'completed' | 'failed';
  source_video_path: string;
  source_video_duration: number | null;
  ai_cost: string;
  error_message: string | null;
  completed_at: string | null;
  created_at: string;
  clips_count: number;
}

// Waiver types
export interface Waiver {
  id: string;
  league_id: string;
  title: string;
  content: string;
  is_required: boolean;
  is_signed?: boolean;
  signed_at?: string | null;
  league?: League;
}

export interface HighlightDetail extends HighlightSummary {
  analysis: {
    highlights: Array<{
      title: string;
      description: string;
      start_time: number;
      end_time: number;
      excitement_score: number;
    }>;
    summary: string;
  } | null;
  clips: HighlightClip[];
}
