import axios, { AxiosInstance, AxiosError } from 'axios';
import { Platform } from 'react-native';

class ApiClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: this.getBaseURL(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private getBaseURL(): string {
    if (__DEV__) {
      // Development URLs
      if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000/api/v1';
      } else if (Platform.OS === 'ios') {
        return 'http://localhost:8000/api/v1';
      } else {
        return 'http://localhost:8000/api/v1';
      }
    }
    
    // Production URL
    return 'https://api.sportsyeti.com/api/v1';
  }

  private setupInterceptors(): void {
    // Request interceptor for auth and tracing
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add trace ID for observability
        const traceId = this.generateTraceId();
        config.headers['X-Trace-Id'] = traceId;
        config.headers['traceparent'] = this.generateTraceparent(traceId);

        // Add platform context
        config.headers['X-Platform'] = Platform.OS;
        config.headers['X-App-Version'] = '1.0.0';

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && this.authToken) {
          try {
            // Try to refresh token
            const authStore = await import('../store/authStore');
            await authStore.useAuthStore.getState().refreshAccessToken();
            
            // Retry original request
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${this.authToken}`;
              return this.instance.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            const authStore = await import('../store/authStore');
            authStore.useAuthStore.getState().logout();
            return Promise.reject(error);
          }
        }

        // Handle RFC7807 Problem+JSON errors
        if (error.response?.headers['content-type']?.includes('application/problem+json')) {
          const problemDetails = error.response.data;
          throw new ApiError(
            problemDetails.title || 'API Error',
            problemDetails.detail || 'An error occurred',
            error.response.status,
            problemDetails.trace_id
          );
        }

        throw new ApiError(
          'Network Error',
          error.message || 'Unable to connect to server',
          error.response?.status || 0
        );
      }
    );
  }

  private generateTraceId(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateTraceparent(traceId: string): string {
    const spanId = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    return `00-${traceId}-${spanId}-01`;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  // HTTP methods
  async get(url: string, config = {}) {
    return this.instance.get(url, config);
  }

  async post(url: string, data = {}, config = {}) {
    return this.instance.post(url, data, config);
  }

  async put(url: string, data = {}, config = {}) {
    return this.instance.put(url, data, config);
  }

  async patch(url: string, data = {}, config = {}) {
    return this.instance.patch(url, data, config);
  }

  async delete(url: string, config = {}) {
    return this.instance.delete(url, config);
  }

  // Idempotent requests for payments and bookings
  async postIdempotent(url: string, data = {}, idempotencyKey?: string) {
    const headers: any = {};
    
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    return this.instance.post(url, data, { headers });
  }

  // SSE connection for real-time chat
  createSSEConnection(url: string, onMessage: (data: any) => void, onError?: (error: any) => void): EventSource {
    const fullUrl = this.getBaseURL().replace('/api/v1', '') + url;
    
    const eventSource = new EventSource(fullUrl, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'X-Trace-Id': this.generateTraceId(),
      },
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      if (onError) {
        onError(error);
      }
    };

    return eventSource;
  }
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly traceId?: string;

  constructor(title: string, detail: string, status: number, traceId?: string) {
    super(`${title}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.traceId = traceId;
  }
}

export const apiClient = new ApiClient();