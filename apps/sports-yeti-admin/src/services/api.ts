import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import * as Storage from './storage';
import { API_BASE_URL } from '../constants';
import type {
  ApiError,
  ApiResponse,
  AuditLog,
  AuthTokens,
  Booking,
  Camp,
  DashboardStats,
  Facility,
  Game,
  League,
  LoginCredentials,
  Payment,
  Player,
  Referee,
  RefereeAssignment,
  Team,
  User,
  Waiver,
  WaiverSignature,
} from '../types';

const TOKEN_KEY = 'admin_auth_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

// Admin roles that are allowed to access this dashboard
const ADMIN_ROLES = ['super-admin', 'admin', 'league-admin'];

class AdminApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.refreshSubscribers.forEach((callback) => callback(newToken));
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  async getToken(): Promise<string | null> {
    return Storage.getItemAsync(TOKEN_KEY);
  }

  async setToken(token: string): Promise<void> {
    await Storage.setItemAsync(TOKEN_KEY, token);
  }

  async clearTokens(): Promise<void> {
    await Storage.deleteItemAsync(TOKEN_KEY);
    await Storage.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  // Check if user has admin role
  private hasAdminRole(user: User): boolean {
    if (!user.roles || user.roles.length === 0) return false;
    return user.roles.some((role) => ADMIN_ROLES.includes(role.name));
  }

  // Auth endpoints
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<{
      data: { user: User } & AuthTokens;
    }>('/auth/login', credentials);
    const { user, token, token_type, expires_in } = response.data.data;

    // Verify user has admin role
    if (!this.hasAdminRole(user)) {
      throw new Error('Access denied. Admin privileges required.');
    }

    await this.setToken(token);
    return { user, tokens: { token, token_type, expires_in } };
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.clearTokens();
    }
  }

  async refreshToken(): Promise<string> {
    const response = await this.client.post<{ data: AuthTokens }>(
      '/auth/refresh'
    );
    const { token } = response.data.data;
    await this.setToken(token);
    return token;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<{ data: User }>('/auth/me');
    const user = response.data.data;

    // Verify user still has admin role
    if (!this.hasAdminRole(user)) {
      await this.clearTokens();
      throw new Error('Access denied. Admin privileges required.');
    }

    return user;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<{ data: DashboardStats }>(
      '/analytics/dashboard'
    );
    return response.data.data;
  }

  // Leagues
  async getLeagues(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<League[]>> {
    const response = await this.client.get<ApiResponse<League[]>>('/leagues', {
      params,
    });
    return response.data;
  }

  async getLeague(id: string): Promise<League> {
    const response = await this.client.get<{ data: League }>(`/leagues/${id}`);
    return response.data.data;
  }

  async createLeague(data: Partial<League>): Promise<League> {
    const response = await this.client.post<{ data: League }>('/leagues', data);
    return response.data.data;
  }

  async updateLeague(id: string, data: Partial<League>): Promise<League> {
    const response = await this.client.put<{ data: League }>(
      `/leagues/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteLeague(id: string): Promise<void> {
    await this.client.delete(`/leagues/${id}`);
  }

  // Teams
  async getTeams(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Team[]>> {
    const response = await this.client.get<ApiResponse<Team[]>>('/teams', {
      params,
    });
    return response.data;
  }

  async getTeam(id: string): Promise<Team> {
    const response = await this.client.get<{ data: Team }>(`/teams/${id}`);
    return response.data.data;
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const response = await this.client.put<{ data: Team }>(
      `/teams/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteTeam(id: string): Promise<void> {
    await this.client.delete(`/teams/${id}`);
  }

  // Players
  async getPlayers(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Player[]>> {
    const response = await this.client.get<ApiResponse<Player[]>>('/players', {
      params,
    });
    return response.data;
  }

  async getPlayer(id: string): Promise<Player> {
    const response = await this.client.get<{ data: Player }>(`/players/${id}`);
    return response.data.data;
  }

  async updatePlayer(id: string, data: Partial<Player>): Promise<Player> {
    const response = await this.client.put<{ data: Player }>(
      `/players/${id}`,
      data
    );
    return response.data.data;
  }

  // Facilities
  async getFacilities(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Facility[]>> {
    const response = await this.client.get<ApiResponse<Facility[]>>(
      '/facilities',
      { params }
    );
    return response.data;
  }

  async getFacility(id: string): Promise<Facility> {
    const response = await this.client.get<{ data: Facility }>(
      `/facilities/${id}`
    );
    return response.data.data;
  }

  async createFacility(data: Partial<Facility>): Promise<Facility> {
    const response = await this.client.post<{ data: Facility }>(
      '/facilities',
      data
    );
    return response.data.data;
  }

  async updateFacility(id: string, data: Partial<Facility>): Promise<Facility> {
    const response = await this.client.put<{ data: Facility }>(
      `/facilities/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteFacility(id: string): Promise<void> {
    await this.client.delete(`/facilities/${id}`);
  }

  // Bookings
  async getBookings(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Booking[]>> {
    const response = await this.client.get<ApiResponse<Booking[]>>(
      '/bookings',
      { params }
    );
    return response.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get<{ data: Booking }>(
      `/bookings/${id}`
    );
    return response.data.data;
  }

  async createBooking(data: {
    space_id: string;
    start_time: string;
    end_time: string;
    purpose?: string;
    notes?: string;
  }): Promise<Booking> {
    const response = await this.client.post<{ data: Booking }>(
      '/bookings',
      data
    );
    return response.data.data;
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const response = await this.client.put<{ data: Booking }>(
      `/bookings/${id}`,
      data
    );
    return response.data.data;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const response = await this.client.post<{ data: Booking }>(
      `/bookings/${id}/cancel`
    );
    return response.data.data;
  }

  async checkBookingConflicts(
    spaceId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<{ has_conflict: boolean; conflicting_bookings: Booking[] }> {
    const response = await this.client.post<{
      data: { has_conflict: boolean; conflicting_bookings: Booking[] };
    }>('/bookings/check-conflicts', {
      space_id: spaceId,
      start_time: startTime,
      end_time: endTime,
      exclude_booking_id: excludeBookingId,
    });
    return response.data.data;
  }

  // Payments
  async getPayments(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Payment[]>> {
    const response = await this.client.get<ApiResponse<Payment[]>>(
      '/payments',
      { params }
    );
    return response.data;
  }

  async getPayment(id: string): Promise<Payment> {
    const response = await this.client.get<{ data: Payment }>(
      `/payments/${id}`
    );
    return response.data.data;
  }

  async refundPayment(
    id: string,
    params?: { amount?: number; reason?: string }
  ): Promise<Payment> {
    const response = await this.client.post<{ data: Payment }>(
      `/payments/${id}/refund`,
      params
    );
    return response.data.data;
  }

  // Audit logs
  async getAuditLogs(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<AuditLog[]>> {
    const response = await this.client.get<ApiResponse<AuditLog[]>>('/audit', {
      params,
    });
    return response.data;
  }

  async getAuditLog(id: string): Promise<AuditLog> {
    const response = await this.client.get<{ data: AuditLog }>(`/audit/${id}`);
    return response.data.data;
  }

  // Referees
  async getReferees(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Referee[]>> {
    const response = await this.client.get<ApiResponse<Referee[]>>(
      '/referees',
      { params }
    );
    return response.data;
  }

  async getReferee(id: string): Promise<Referee> {
    const response = await this.client.get<{ data: Referee }>(
      `/referees/${id}`
    );
    return response.data.data;
  }

  async getAvailableGamesForReferees(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Game[]>> {
    const response = await this.client.get<ApiResponse<Game[]>>(
      '/referees/available-games',
      { params }
    );
    return response.data;
  }

  async assignReferee(
    gameId: string,
    data: { referee_id: string; rate: number; is_bidding?: boolean }
  ): Promise<RefereeAssignment> {
    const response = await this.client.post<{ data: RefereeAssignment }>(
      `/referees/games/${gameId}/bid`,
      data
    );
    return response.data.data;
  }

  async approveAssignment(assignmentId: string): Promise<RefereeAssignment> {
    const response = await this.client.post<{ data: RefereeAssignment }>(
      `/referees/assignments/${assignmentId}/accept`
    );
    return response.data.data;
  }

  async getRefereeAssignments(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<RefereeAssignment[]>> {
    const response = await this.client.get<ApiResponse<RefereeAssignment[]>>(
      '/referees/assignments',
      { params }
    );
    return response.data;
  }

  // Team status management
  async updateTeamStatus(teamId: string, status: string): Promise<Team> {
    const response = await this.client.patch<{ data: Team }>(`/teams/${teamId}/status`, { status });
    return response.data.data;
  }

  // Waivers
  async getWaivers(params?: Record<string, unknown>): Promise<ApiResponse<Waiver[]>> {
    const response = await this.client.get<ApiResponse<Waiver[]>>('/waivers', { params });
    return response.data;
  }

  async getWaiver(id: string): Promise<Waiver> {
    const response = await this.client.get<{ data: Waiver }>(`/waivers/${id}`);
    return response.data.data;
  }

  async createWaiver(data: { league_id: string; title: string; content: string; is_required?: boolean }): Promise<Waiver> {
    const response = await this.client.post<{ data: Waiver }>('/waivers', data);
    return response.data.data;
  }

  async updateWaiver(id: string, data: Partial<Waiver>): Promise<Waiver> {
    const response = await this.client.put<{ data: Waiver }>(`/waivers/${id}`, data);
    return response.data.data;
  }

  async getWaiverSignatures(waiverId: string): Promise<ApiResponse<WaiverSignature[]>> {
    const response = await this.client.get<ApiResponse<WaiverSignature[]>>(`/waivers/${waiverId}/signatures`);
    return response.data;
  }

  // Camps
  async getCamps(params?: Record<string, unknown>): Promise<ApiResponse<Camp[]>> {
    const response = await this.client.get<ApiResponse<Camp[]>>('/camps', { params });
    return response.data;
  }

  async getCamp(id: string): Promise<Camp> {
    const response = await this.client.get<{ data: Camp }>(`/camps/${id}`);
    return response.data.data;
  }

  async createCamp(data: Partial<Camp>): Promise<Camp> {
    const response = await this.client.post<{ data: Camp }>('/camps', data);
    return response.data.data;
  }

  async updateCamp(id: string, data: Partial<Camp>): Promise<Camp> {
    const response = await this.client.put<{ data: Camp }>(`/camps/${id}`, data);
    return response.data.data;
  }

  async deleteCamp(id: string): Promise<void> {
    await this.client.delete(`/camps/${id}`);
  }

  // Games / Schedule
  async getGames(params?: Record<string, unknown>): Promise<ApiResponse<Game[]>> {
    const response = await this.client.get<ApiResponse<Game[]>>('/games', { params });
    return response.data;
  }

  async publishSchedule(data: {
    league_id: string;
    season_number?: number;
    week_number?: number;
  }): Promise<{ published_count: number }> {
    const response = await this.client.post<{ data: { published_count: number } }>(
      '/games/publish',
      data
    );
    return response.data.data;
  }

  async importGames(
    file: File | Blob,
    leagueId: string
  ): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file as Blob);
    formData.append('league_id', leagueId);
    const response = await this.client.post<{ data: { imported: number; errors: string[] } }>(
      '/games/import',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  }

  async createGame(data: {
    league_id: string;
    team1_id: string;
    team2_id: string;
    facility_id?: string;
    space_id?: string;
    scheduled_at: string;
    game_type?: string;
    season_number?: number;
    week_number?: number;
  }): Promise<unknown> {
    const response = await this.client.post('/games', data);
    return response.data.data;
  }

  async updateGame(id: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await this.client.put(`/games/${id}`, data);
    return response.data.data;
  }

  // Facility Spaces
  async getSpaces(facilityId: string): Promise<unknown[]> {
    const response = await this.client.get<{ data: unknown[] }>(
      `/facilities/${facilityId}/spaces`
    );
    return response.data.data;
  }

  async createSpace(facilityId: string, data: Record<string, unknown>): Promise<unknown> {
    const response = await this.client.post(`/facilities/${facilityId}/spaces`, data);
    return response.data.data;
  }

  async updateSpace(
    facilityId: string,
    spaceId: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    const response = await this.client.put(`/facilities/${facilityId}/spaces/${spaceId}`, data);
    return response.data.data;
  }

  async deleteSpace(facilityId: string, spaceId: string): Promise<void> {
    await this.client.delete(`/facilities/${facilityId}/spaces/${spaceId}`);
  }

  // Referee bid selection
  async selectBid(assignmentId: string): Promise<unknown> {
    const response = await this.client.post(
      `/referees/assignments/${assignmentId}/select-bid`
    );
    return response.data.data;
  }

  // Team payment summary
  async getTeamPaymentSummary(teamId: string): Promise<{
    team_id: string;
    team_name: string;
    league_name: string;
    total_fee: number;
    per_player_share: number;
    roster_count: number;
    paid_count: number;
    pending_count: number;
    is_complete: boolean;
  }> {
    const response = await this.client.get<{
      data: {
        team_id: string;
        team_name: string;
        league_name: string;
        total_fee: number;
        per_player_share: number;
        roster_count: number;
        paid_count: number;
        pending_count: number;
        is_complete: boolean;
      };
    }>(`/teams/${teamId}/payment-summary`);
    return response.data.data;
  }

  // Analytics / Finance
  async getAnalyticsDashboard(): Promise<DashboardStats> {
    const response = await this.client.get<{ data: DashboardStats }>('/analytics/dashboard');
    return response.data.data;
  }

  async getRevenueAnalytics(params?: Record<string, unknown>): Promise<{
    leagues: Array<{ league_id: string; league_name: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
  }> {
    const response = await this.client.get<{
      data: {
        leagues: Array<{ league_id: string; league_name: string; revenue: number }>;
        monthly: Array<{ month: string; revenue: number }>;
      };
    }>('/analytics/revenue', { params });
    return response.data.data;
  }

  async getRegistrationAnalytics(): Promise<{
    leagues: Array<{ league_id: string; league_name: string; registrations: number }>;
  }> {
    const response = await this.client.get<{
      data: { leagues: Array<{ league_id: string; league_name: string; registrations: number }> };
    }>('/analytics/registrations');
    return response.data.data;
  }

  async getFacilityUtilization(): Promise<{
    facilities: Array<{ facility_id: string; facility_name: string; utilization_percent: number; total_bookings: number }>;
  }> {
    const response = await this.client.get<{
      data: { facilities: Array<{ facility_id: string; facility_name: string; utilization_percent: number; total_bookings: number }> };
    }>('/analytics/facility-utilization');
    return response.data.data;
  }

  async getGameStats(gameId: string): Promise<unknown[]> {
    const response = await this.client.get(`/games/${gameId}/stats`);
    return response.data.data;
  }

  async saveGameStats(
    gameId: string,
    stats: Array<{ player_id: string; points?: number; rebounds?: number; assists?: number; steals?: number; blocks?: number }>
  ): Promise<void> {
    await this.client.post(`/games/${gameId}/stats`, { stats });
  }

  async getHighlights(params?: Record<string, unknown>): Promise<ApiResponse<unknown[]>> {
    const response = await this.client.get('/highlights', { params });
    return response.data;
  }

  async getLeagueNews(leagueId: string, params?: Record<string, unknown>): Promise<ApiResponse<unknown[]>> {
    const response = await this.client.get(`/leagues/${leagueId}/news`, { params });
    return response.data;
  }

  async createLeagueNews(leagueId: string, data: { title: string; content: string; is_pinned?: boolean }): Promise<unknown> {
    const response = await this.client.post(`/leagues/${leagueId}/news`, data);
    return response.data.data;
  }

  async publishLeagueNews(leagueId: string, newsId: string): Promise<void> {
    await this.client.post(`/leagues/${leagueId}/news/${newsId}/publish`);
  }

  async unpublishLeagueNews(leagueId: string, newsId: string): Promise<void> {
    await this.client.post(`/leagues/${leagueId}/news/${newsId}/unpublish`);
  }

  async deleteLeagueNews(leagueId: string, newsId: string): Promise<void> {
    await this.client.delete(`/leagues/${leagueId}/news/${newsId}`);
  }
}

export const api = new AdminApiService();
