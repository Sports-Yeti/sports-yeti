import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import * as Storage from './storage';
import { API_BASE_URL } from '../constants';
import type {
  ApiError,
  ApiResponse,
  AuditLog,
  AuthTokens,
  Booking,
  DashboardStats,
  Facility,
  League,
  LoginCredentials,
  Payment,
  Player,
  Team,
  User,
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
      '/admin/dashboard'
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
}

export const api = new AdminApiService();
