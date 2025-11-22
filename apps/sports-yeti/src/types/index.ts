// Core types for Sports Yeti platform

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  location?: Location;
  createdAt: string;
  updatedAt: string;
}

export interface Player extends User {
  bio?: string;
  experienceLevel: ExperienceLevel;
  availabilityStatus: AvailabilityStatus;
  isPrivate: boolean;
  sportPreferences: Sport[];
  pointBalance: number;
  achievements: Achievement[];
  stats: PlayerStats;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  leagueId?: string;
  divisionId?: string;
  description?: string;
  avatar?: string;
  members: TeamMember[];
  maxMembers: number;
  sport: Sport;
  skillLevel: SkillLevel;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  playerId: string;
  role: TeamRole;
  joinedAt: string;
  paymentStatus: PaymentStatus;
  waiverSigned: boolean;
  player: Player;
}

export interface League {
  id: string;
  name: string;
  description: string;
  adminId: string;
  sportType: Sport;
  location: Location;
  divisions: Division[];
  season: Season;
  registrationFee: number;
  maxTeams: number;
  rules: string[];
  amenities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Division {
  id: string;
  leagueId: string;
  name: string;
  maxTeams: number;
  registrationFee: number;
  rules: string[];
  teams: Team[];
  skillLevel: SkillLevel;
  createdAt: string;
}

export interface Facility {
  id: string;
  leagueId: string;
  name: string;
  address: string;
  location: Location;
  contactInfo: ContactInfo;
  operatingHours: OperatingHours[];
  spaces: Space[];
  equipment: Equipment[];
  amenities: string[];
  liabilityInfo: string;
  photos: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Space {
  id: string;
  facilityId: string;
  name: string;
  sportType: Sport;
  capacity: number;
  amenities: string[];
  pointCost: number;
  cashCost: number;
  photos: string[];
  availability: SpaceAvailability[];
}

export interface Equipment {
  id: string;
  facilityId: string;
  name: string;
  type: EquipmentType;
  condition: EquipmentCondition;
  pointCost: number;
  cashCost: number;
  available: boolean;
  photos: string[];
}

export interface Game {
  id: string;
  team1Id: string;
  team2Id: string;
  facilityId: string;
  spaceId: string;
  refereeId?: string;
  scheduledAt: string;
  duration: number;
  status: GameStatus;
  gameType: GameType;
  leagueId?: string;
  divisionId?: string;
  pointWager: number;
  participants: GameParticipant[];
  reports: GameReport[];
  chatId: string;
  createdAt: string;
}

export interface GameParticipant {
  id: string;
  gameId: string;
  playerId: string;
  teamId: string;
  attendanceConfirmed: boolean;
  qrCheckinTime?: string;
  player: Player;
}

export interface GameReport {
  id: string;
  gameId: string;
  captainId: string;
  reportType: ReportType;
  details: string;
  equipmentDamage?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  gameId?: string;
  teamId?: string;
  type: ChatType;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  polls: ChatPoll[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  message: string;
  messageType: MessageType;
  mediaUrl?: string;
  createdAt: string;
  user: User;
}

export interface ChatPoll {
  id: string;
  chatId: string;
  question: string;
  options: PollOption[];
  votes: PollVote[];
  createdBy: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  optionId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  leagueId?: string;
  teamId?: string;
  gameId?: string;
  createdAt: string;
  user: User;
  comments: Comment[];
  likes: Like[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  pointsEarned: number;
  pointsSpent: number;
  balance: number;
  transactionType: PointTransactionType;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: AchievementCategory;
  unlockedAt?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  totalPoints: number;
  averagePointsPerGame: number;
  favoritePosition?: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface Booking {
  id: string;
  spaceId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  pointCost: number;
  cashCost: number;
  equipmentBookings: EquipmentBooking[];
  qrCode: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface EquipmentBooking {
  id: string;
  bookingId: string;
  equipmentId: string;
  quantity: number;
  pointCost: number;
  cashCost: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  leagueId: string;
  sportType: Sport;
  tournamentType: TournamentType;
  maxTeams: number;
  entryFee: number;
  prizePool: number;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  brackets: Bracket[];
  registeredTeams: TournamentTeam[];
  createdAt: string;
}

export interface Bracket {
  id: string;
  tournamentId: string;
  name: string;
  rounds: Round[];
  currentRound: number;
}

export interface Round {
  id: string;
  bracketId: string;
  roundNumber: number;
  matches: Match[];
}

export interface Match {
  id: string;
  roundId: string;
  team1Id?: string;
  team2Id?: string;
  winnerId?: string;
  scheduledAt?: string;
  score?: GameScore;
}

export interface GameScore {
  team1Score: number;
  team2Score: number;
}

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  seed: number;
  eliminated: boolean;
  eliminatedRound?: number;
}

export interface Camp {
  id: string;
  leagueId: string;
  name: string;
  description: string;
  sportType: Sport;
  startDate: string;
  endDate: string;
  registrationFee: number;
  maxParticipants: number;
  sessions: CampSession[];
  trainers: CampTrainer[];
  registeredPlayers: CampRegistration[];
  createdAt: string;
}

export interface CampSession {
  id: string;
  campId: string;
  facilityId: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  description: string;
}

export interface CampTrainer {
  id: string;
  campId: string;
  trainerId: string;
  role: TrainerRole;
  paymentStatus: PaymentStatus;
  trainer: Trainer;
}

export interface CampRegistration {
  id: string;
  campId: string;
  playerId: string;
  paymentStatus: PaymentStatus;
  attendanceStatus: AttendanceStatus;
  registeredAt: string;
}

export interface Trainer {
  id: string;
  userId: string;
  certifications: string[];
  experienceLevel: ExperienceLevel;
  specializations: Sport[];
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  approved: boolean;
  availability: TrainerAvailability[];
  createdAt: string;
}

export interface TrainerAvailability {
  id: string;
  trainerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface Referee {
  id: string;
  userId: string;
  experienceLevel: ExperienceLevel;
  certifications: string[];
  sportSpecializations: Sport[];
  hourlyRate: number;
  perGameRate: number;
  rating: number;
  totalGames: number;
  availability: RefereeAvailability[];
  createdAt: string;
}

export interface RefereeAvailability {
  id: string;
  refereeId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface Highlight {
  id: string;
  playerId: string;
  gameId?: string;
  videoId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  aiTags: string[];
  version: number;
  views: number;
  likes: number;
  shares: number;
  socialMediaUrls: SocialMediaShare[];
  createdAt: string;
}

export interface SocialMediaShare {
  platform: SocialPlatform;
  url: string;
  shareCount: number;
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  gameId?: string;
  fileUrl: string;
  fileSize: number;
  duration: number;
  status: VideoStatus;
  processingStatus: ProcessingStatus;
  thumbnailUrl?: string;
  highlights: Highlight[];
  createdAt: string;
}

export interface Dispute {
  id: string;
  userId: string;
  leagueId?: string;
  type: DisputeType;
  description: string;
  status: DisputeStatus;
  priority: DisputePriority;
  assignedTo?: string;
  messages: DisputeMessage[];
  resolvedAt?: string;
  createdAt: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

// Enums and Union Types
export type Sport =
  | 'basketball'
  | 'soccer'
  | 'football'
  | 'baseball'
  | 'tennis'
  | 'volleyball'
  | 'hockey'
  | 'cricket'
  | 'rugby'
  | 'softball';

export type ExperienceLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'professional';

export type SkillLevel =
  | 'recreational'
  | 'competitive'
  | 'semi-professional'
  | 'professional';

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable' | 'away';

export type TeamRole = 'captain' | 'co-captain' | 'player';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type GameStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export type GameType = 'league' | 'tournament' | 'friendly' | 'mock' | 'pickup';

export type ChatType = 'game' | 'team' | 'league' | 'general';

export type MessageType = 'text' | 'image' | 'video' | 'poll' | 'system';

export type ReportType =
  | 'absence'
  | 'equipment_damage'
  | 'incident'
  | 'score_dispute'
  | 'general';

export type PointTransactionType =
  | 'earned_game'
  | 'earned_content'
  | 'earned_achievement'
  | 'earned_referral'
  | 'spent_booking'
  | 'spent_equipment'
  | 'spent_tournament'
  | 'wagered_game'
  | 'won_wager'
  | 'lost_wager'
  | 'purchase'
  | 'refund';

export type AchievementCategory =
  | 'games'
  | 'social'
  | 'community'
  | 'achievement'
  | 'special'
  | 'milestone';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled';

export type EquipmentType =
  | 'ball'
  | 'net'
  | 'goal'
  | 'training_equipment'
  | 'protective_gear'
  | 'other';

export type EquipmentCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'broken';

export type SpaceAvailability = {
  date: string;
  availableSlots: TimeSlot[];
};

export type TimeSlot = {
  startTime: string;
  endTime: string;
  available: boolean;
  bookingId?: string;
};

export type NotificationType =
  | 'game_reminder'
  | 'payment_confirmation'
  | 'team_invitation'
  | 'chat_message'
  | 'achievement_unlocked'
  | 'booking_confirmation'
  | 'system_update'
  | 'friend_request'
  | 'league_news';

export type TournamentType =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'swiss'
  | 'custom';

export type TournamentStatus =
  | 'registration'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type AttendanceStatus = 'registered' | 'attended' | 'absent' | 'excused';

export type TrainerRole = 'head_trainer' | 'assistant_trainer' | 'specialist';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type VideoStatus =
  | 'uploaded'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'deleted';

export type ProcessingStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed';

export type DisputeType =
  | 'game_related'
  | 'payment'
  | 'referee'
  | 'facility'
  | 'technical'
  | 'other';

export type DisputeStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'closed'
  | 'escalated';

export type DisputePriority = 'low' | 'medium' | 'high' | 'urgent';

export type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'facebook';

// Supporting Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface OperatingHours {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  sportPreferences: Sport[];
  experienceLevel: ExperienceLevel;
}

export interface TeamCreationForm {
  name: string;
  sport: Sport;
  skillLevel: SkillLevel;
  maxMembers: number;
  description?: string;
}

export interface GameCreationForm {
  sport: Sport;
  skillLevel: SkillLevel;
  teamSize: number;
  facilityId: string;
  spaceId: string;
  scheduledAt: string;
  duration: number;
  pointWager: number;
  rules?: string;
  equipmentIds: string[];
}

export interface FacilityBookingForm {
  spaceId: string;
  startTime: string;
  endTime: string;
  equipmentIds: string[];
  paymentMethod: 'points' | 'cash';
}

export interface PostCreationForm {
  content: string;
  mediaUrls: string[];
  leagueId?: string;
  teamId?: string;
  gameId?: string;
}

export interface CommentForm {
  content: string;
}

export interface ChatMessageForm {
  message: string;
  messageType: MessageType;
  mediaUrl?: string;
}

export interface PointPurchaseForm {
  amount: number;
  paymentMethod: 'card' | 'bank';
}

export interface DisputeForm {
  type: DisputeType;
  description: string;
  priority: DisputePriority;
  referenceId?: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Leagues: undefined;
  Teams: undefined;
  Facilities: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  GameDetails: { gameId: string };
  PlayerProfile: { playerId: string };
  TeamDetails: { teamId: string };
  CreateGame: undefined;
  Chat: { chatId: string };
};

export type LeagueStackParamList = {
  LeaguesScreen: undefined;
  LeagueDetails: { leagueId: string };
  JoinLeague: { leagueId: string };
  DivisionDetails: { divisionId: string };
};

export type TeamStackParamList = {
  TeamsScreen: undefined;
  TeamDetails: { teamId: string };
  CreateTeam: undefined;
  EditTeam: { teamId: string };
  TeamMembers: { teamId: string };
  FindTeams: undefined;
  TeamRequests: undefined;
  TeamStats: { teamId: string };
};

export type FacilityStackParamList = {
  FacilitiesScreen: undefined;
  FacilityDetails: { facilityId: string };
  BookFacility: { facilityId: string; spaceId?: string };
  QRScanner: undefined;
  BookingDetails: { bookingId: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Points: undefined;
  Achievements: undefined;
  DataExport: undefined;
  Help: undefined;
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  PaymentHistory: undefined;
  Camps: undefined;
  CampDetails: { campId: string };
  MyCamps: undefined;
};

// Context Types
export interface AuthContextType {
  user: Player | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Player>) => Promise<void>;
}

export interface GameContextType {
  currentGame: Game | null;
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  updateAttendance: (gameId: string, status: boolean) => Promise<void>;
  reportGame: (gameId: string, report: GameReport) => Promise<void>;
}

export interface ChatContextType {
  activeChats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  sendMessage: (message: ChatMessageForm) => Promise<void>;
  createPoll: (question: string, options: string[]) => Promise<void>;
  votePoll: (pollId: string, optionId: string) => Promise<void>;
  setActiveChat: (chatId: string) => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}
