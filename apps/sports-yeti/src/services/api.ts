import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/react-native';
import * as Storage from './storage';
import { API_BASE_URL } from '../constants';
import { generateTraceparent } from '../utils/tracing';
import type {
  ApiError,
  ApiResponse,
  AuthTokens,
  Booking,
  Camp,
  Facility,
  Game,
  HighlightDetail,
  HighlightSummary,
  League,
  LoginCredentials,
  Player,
  RegisterData,
  Team,
  User,
} from '../types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiService {
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
    // Request interceptor to add auth token and tracing headers
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add W3C traceparent header for distributed tracing
        const traceparent = generateTraceparent();
        config.headers.traceparent = traceparent;
        config.headers.tracestate = 'sports-yeti=true';

        // Add Sentry breadcrumb for API requests
        Sentry.addBreadcrumb({
          category: 'api',
          message: `${config.method?.toUpperCase()} ${config.url}`,
          level: 'info',
          data: {
            url: config.url,
            method: config.method,
            traceparent,
          },
        });

        return config;
      },
      (error) => {
        Sentry.captureException(error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh and error tracking
    this.client.interceptors.response.use(
      (response) => {
        // Add success breadcrumb
        Sentry.addBreadcrumb({
          category: 'api',
          message: `API Response ${response.status}`,
          level: 'info',
          data: {
            url: response.config.url,
            status: response.status,
          },
        });
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Capture API errors in Sentry (except auth errors that will be retried)
        if (error.response?.status !== 401 || originalRequest._retry) {
          Sentry.captureException(error, {
            tags: {
              type: 'api_error',
              status: error.response?.status?.toString() ?? 'network_error',
              url: originalRequest.url ?? 'unknown',
            },
            extra: {
              requestData: originalRequest.data,
              responseData: error.response?.data,
            },
          });

          Sentry.addBreadcrumb({
            category: 'api',
            message: `API Error ${error.response?.status ?? 'network'}`,
            level: 'error',
            data: {
              url: originalRequest.url,
              status: error.response?.status,
              error: error.message,
            },
          });
        }

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
            Sentry.captureException(refreshError, {
              tags: { type: 'token_refresh_failed' },
            });
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

  // Auth endpoints
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<{
      data: { user: User } & AuthTokens;
    }>('/auth/login', credentials);
    const { user, token, token_type, expires_in } = response.data.data;
    await this.setToken(token);
    return { user, tokens: { token, token_type, expires_in } };
  }

  async register(
    data: RegisterData
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<{
      data: { user: User } & AuthTokens;
    }>('/auth/register', data);
    const { user, token, token_type, expires_in } = response.data.data;
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
    return response.data.data;
  }

  // Players
  async getPlayers(params?: Record<string, unknown>): Promise<ApiResponse<Player[]>> {
    const response = await this.client.get<ApiResponse<Player[]>>('/players', {
      params,
    });
    return response.data;
  }

  async getPlayer(id: string): Promise<Player> {
    const response = await this.client.get<{ data: Player }>(`/players/${id}`);
    return response.data.data;
  }

  async getMyPlayer(): Promise<Player> {
    const response = await this.client.get<{ data: Player }>('/players/me');
    return response.data.data;
  }

  async updatePlayer(id: string, data: Partial<Player>): Promise<Player> {
    const response = await this.client.put<{ data: Player }>(
      `/players/${id}`,
      data
    );
    return response.data.data;
  }

  // Leagues
  async getLeagues(params?: Record<string, unknown>): Promise<ApiResponse<League[]>> {
    const response = await this.client.get<ApiResponse<League[]>>('/leagues', {
      params,
    });
    return response.data;
  }

  async getLeague(id: string): Promise<League> {
    const response = await this.client.get<{ data: League }>(`/leagues/${id}`);
    return response.data.data;
  }

  // Teams
  async getTeams(params?: Record<string, unknown>): Promise<ApiResponse<Team[]>> {
    const response = await this.client.get<ApiResponse<Team[]>>('/teams', {
      params,
    });
    return response.data;
  }

  async getTeam(id: string): Promise<Team> {
    const response = await this.client.get<{ data: Team }>(`/teams/${id}`);
    return response.data.data;
  }

  async createTeam(
    data: Pick<Team, 'name' | 'league_id' | 'description'>
  ): Promise<Team> {
    const response = await this.client.post<{ data: Team }>('/teams', data);
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

  // Bookings
  async getBookings(params?: Record<string, unknown>): Promise<ApiResponse<Booking[]>> {
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
    idempotency_key?: string;
  }): Promise<Booking> {
    const response = await this.client.post<{ data: Booking }>(
      '/bookings',
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

  async checkIn(qrCode: string): Promise<Booking> {
    const response = await this.client.post<{ data: Booking }>(
      '/bookings/check-in',
      { qr_code: qrCode }
    );
    return response.data.data;
  }

  // Camps
  async getCamps(params?: Record<string, unknown>): Promise<ApiResponse<Camp[]>> {
    const response = await this.client.get<ApiResponse<Camp[]>>('/camps', {
      params,
    });
    return response.data;
  }

  async getCamp(id: string): Promise<Camp> {
    const response = await this.client.get<{ data: Camp }>(`/camps/${id}`);
    return response.data.data;
  }

  async registerForCamp(campId: string): Promise<void> {
    await this.client.post(`/camps/${campId}/register`);
  }

  async unregisterFromCamp(campId: string): Promise<void> {
    await this.client.delete(`/camps/${campId}/register`);
  }

  // Games
  async getGames(params?: Record<string, unknown>): Promise<ApiResponse<Game[]>> {
    const response = await this.client.get<ApiResponse<Game[]>>('/games', {
      params,
    });
    return response.data;
  }

  async getGame(id: string): Promise<Game> {
    const response = await this.client.get<{ data: Game }>(`/games/${id}`);
    return response.data.data;
  }

  async respondToGameAttendance(
    gameId: string,
    response: 'yes' | 'no' | 'maybe'
  ): Promise<void> {
    await this.client.post(`/games/${gameId}/attendance`, { response });
  }

  // Chats
  async getChat(chatId: string): Promise<{ data: { id: string; type: string; name: string } }> {
    const response = await this.client.get(`/chats/${chatId}`);
    return response.data;
  }

  async getChatMessages(
    chatId: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Array<{
    id: string;
    content: string;
    user_id: string;
    user: { id: string; name: string; avatar_url?: string };
    created_at: string;
  }>>> {
    const response = await this.client.get(`/chats/${chatId}/messages`, {
      params,
    });
    return response.data;
  }

  async sendChatMessage(
    chatId: string,
    content: string
  ): Promise<{
    id: string;
    content: string;
    user_id: string;
    user: { id: string; name: string; avatar_url?: string };
    created_at: string;
  }> {
    const response = await this.client.post(`/chats/${chatId}/messages`, {
      content,
    });
    return response.data.data;
  }

  async getChatPolls(
    chatId: string
  ): Promise<ApiResponse<Array<{
    id: string;
    question: string;
    options: string[];
    votes: Record<string, number>;
    user_vote?: string;
    is_closed: boolean;
    closes_at?: string;
  }>>> {
    const response = await this.client.get(`/chats/${chatId}/polls`);
    return response.data;
  }

  async voteChatPoll(
    chatId: string,
    pollId: string,
    option: string
  ): Promise<void> {
    await this.client.post(`/chats/${chatId}/polls/${pollId}/vote`, { option });
  }

  // Notifications
  async getNotifications(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    read_at?: string;
    created_at: string;
  }>>> {
    const response = await this.client.get('/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.client.post(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.client.post('/notifications/mark-all-read');
  }

  async updatePushToken(token: string): Promise<void> {
    await this.client.put('/notifications/push-token', { expo_push_token: token });
  }

  // Highlights Studio
  async uploadVideo(
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<{ video_path: string; price: number; currency: string }> {
    const formData = new FormData();
    formData.append('video', {
      uri,
      type: 'video/mp4',
      name: 'upload.mp4',
    } as unknown as Blob);

    const response = await this.client.post<{
      data: { video_path: string; price: number; currency: string };
    }>('/highlights/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
    return response.data.data;
  }

  async createHighlightPaymentIntent(amount: number): Promise<{
    payment: { id: string; stripe_payment_intent_id: string };
    client_secret: string;
  }> {
    const response = await this.client.post<{
      data: {
        payment: { id: string; stripe_payment_intent_id: string };
        client_secret: string;
      };
    }>('/payments/intent', {
      amount,
      type: 'highlight_generation',
      payable_type: 'App\\Models\\Highlight',
      payable_id: '00000000-0000-0000-0000-000000000000',
    });
    return response.data.data;
  }

  async generateHighlights(
    videoPath: string,
    paymentIntentId: string
  ): Promise<{ id: string; status: string }> {
    const response = await this.client.post<{
      data: { id: string; status: string };
    }>('/highlights/generate', {
      video_path: videoPath,
      payment_intent_id: paymentIntentId,
    });
    return response.data.data;
  }

  async getHighlights(
    params?: Record<string, unknown>
  ): Promise<ApiResponse<HighlightSummary[]>> {
    const response = await this.client.get<ApiResponse<HighlightSummary[]>>(
      '/highlights',
      { params }
    );
    return response.data;
  }

  async getHighlight(id: string): Promise<HighlightDetail> {
    const response = await this.client.get<{ data: HighlightDetail }>(
      `/highlights/${id}`
    );
    return response.data.data;
  }

  async getClipDownloadUrl(
    highlightId: string,
    clipId: string
  ): Promise<{ download_url: string; expires_at: string; filename: string }> {
    const response = await this.client.get<{
      data: { download_url: string; expires_at: string; filename: string };
    }>(`/highlights/${highlightId}/clips/${clipId}/download`);
    return response.data.data;
  }

  async shareHighlightToFeed(
    highlightId: string,
    clipIds: string[],
    caption?: string,
    visibility?: string
  ): Promise<{ id: string }> {
    const response = await this.client.post<{ data: { id: string } }>(
      `/highlights/${highlightId}/share`,
      { clip_ids: clipIds, caption, visibility }
    );
    return response.data.data;
  }

  async deleteHighlight(id: string): Promise<void> {
    await this.client.delete(`/highlights/${id}`);
  }
}

export const api = new ApiService();
