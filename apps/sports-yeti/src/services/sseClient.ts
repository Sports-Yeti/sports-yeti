/**
 * SSE (Server-Sent Events) Client for React Native
 *
 * A custom implementation using fetch with streaming since
 * React Native doesn't have native EventSource support.
 * Handles automatic reconnection, heartbeat detection, and
 * proper cleanup.
 */
import * as Sentry from '@sentry/react-native';
import { api } from './api';
import { API_BASE_URL } from '../constants';
import { generateTraceparent } from '../utils/tracing';

export type SSEEventType = 'message' | 'poll_update' | 'heartbeat' | 'error' | 'open' | 'close';

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  id?: string;
}

export interface SSEMessageData {
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

export interface SSEPollUpdateData {
  id: string;
  question: string;
  options: string[];
  vote_counts: Record<string, number>;
  is_closed: boolean;
}

export interface SSEHeartbeatData {
  timestamp: string;
}

export type SSEEventHandler<T = unknown> = (event: SSEEvent<T>) => void;

interface SSEClientOptions {
  /** URL to connect to (relative to API base URL) */
  url: string;
  /** Event handlers by event type */
  onMessage?: SSEEventHandler<SSEMessageData>;
  onPollUpdate?: SSEEventHandler<SSEPollUpdateData>;
  onHeartbeat?: SSEEventHandler<SSEHeartbeatData>;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  /** Maximum reconnection attempts before giving up (default: 10) */
  maxReconnectAttempts?: number;
  /** Base reconnection delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Maximum reconnection delay in ms (default: 30000) */
  maxReconnectDelay?: number;
  /** Heartbeat timeout in ms - disconnect if no heartbeat received (default: 60000) */
  heartbeatTimeout?: number;
}

export class SSEClient {
  private url: string;
  private options: Required<Omit<SSEClientOptions, 'url' | 'onMessage' | 'onPollUpdate' | 'onHeartbeat' | 'onOpen' | 'onClose' | 'onError'>> & {
    onMessage?: SSEEventHandler<SSEMessageData>;
    onPollUpdate?: SSEEventHandler<SSEPollUpdateData>;
    onHeartbeat?: SSEEventHandler<SSEHeartbeatData>;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Error) => void;
  };
  private abortController: AbortController | null = null;
  private reconnectAttempts = 0;
  private lastEventId: string | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isClosed = false;

  constructor(options: SSEClientOptions) {
    this.url = `${API_BASE_URL}${options.url}`;
    this.options = {
      onMessage: options.onMessage,
      onPollUpdate: options.onPollUpdate,
      onHeartbeat: options.onHeartbeat,
      onOpen: options.onOpen,
      onClose: options.onClose,
      onError: options.onError,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      reconnectDelay: options.reconnectDelay ?? 1000,
      maxReconnectDelay: options.maxReconnectDelay ?? 30000,
      heartbeatTimeout: options.heartbeatTimeout ?? 60000,
    };
  }

  /**
   * Connect to the SSE endpoint
   */
  async connect(): Promise<void> {
    if (this.isClosed) return;

    try {
      const token = await api.getToken();
      this.abortController = new AbortController();

      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        traceparent: generateTraceparent(),
        tracestate: 'sports-yeti=true',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (this.lastEventId) {
        headers['Last-Event-ID'] = this.lastEventId;
      }

      Sentry.addBreadcrumb({
        category: 'sse',
        message: `SSE Connecting to ${this.url}`,
        level: 'info',
      });

      const response = await fetch(this.url, {
        method: 'GET',
        headers,
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('SSE response has no body');
      }

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeatTimer();
      this.options.onOpen?.();

      Sentry.addBreadcrumb({
        category: 'sse',
        message: 'SSE Connected',
        level: 'info',
      });

      await this.processStream(response.body);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Connection was intentionally closed
        return;
      }

      Sentry.captureException(error, {
        tags: { type: 'sse_connection_error' },
        extra: { url: this.url },
      });

      this.handleError(error instanceof Error ? error : new Error(String(error)));
      this.scheduleReconnect();
    }
  }

  /**
   * Process the SSE stream
   */
  private async processStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream ended - might need to reconnect
          if (!this.isClosed) {
            this.scheduleReconnect();
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = this.parseEvents(buffer);
        buffer = events.remaining;

        for (const event of events.parsed) {
          this.handleEvent(event);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse SSE events from buffer
   */
  private parseEvents(buffer: string): { parsed: Array<{ event: string; data: string; id?: string }>; remaining: string } {
    const parsed: Array<{ event: string; data: string; id?: string }> = [];
    const lines = buffer.split('\n');
    let currentEvent: { event: string; data: string[]; id?: string } = { event: 'message', data: [] };
    let remaining = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is the last line and might be incomplete
      if (i === lines.length - 1 && line !== '') {
        remaining = line;
        continue;
      }

      if (line === '') {
        // End of event
        if (currentEvent.data.length > 0) {
          parsed.push({
            event: currentEvent.event,
            data: currentEvent.data.join('\n'),
            id: currentEvent.id,
          });
        }
        currentEvent = { event: 'message', data: [] };
        continue;
      }

      const colonIndex = line.indexOf(':');
      if (colonIndex === 0) {
        // Comment, ignore
        continue;
      }

      const field = colonIndex > 0 ? line.slice(0, colonIndex) : line;
      const value = colonIndex > 0 ? line.slice(colonIndex + 1).trimStart() : '';

      switch (field) {
        case 'event':
          currentEvent.event = value;
          break;
        case 'data':
          currentEvent.data.push(value);
          break;
        case 'id':
          currentEvent.id = value;
          break;
        case 'retry':
          // Could update reconnect delay here
          break;
      }
    }

    return { parsed, remaining };
  }

  /**
   * Handle a parsed SSE event
   */
  private handleEvent(event: { event: string; data: string; id?: string }): void {
    if (event.id) {
      this.lastEventId = event.id;
    }

    // Reset heartbeat timer on any event
    this.resetHeartbeatTimer();

    try {
      const data = JSON.parse(event.data);

      switch (event.event) {
        case 'message':
          this.options.onMessage?.({
            type: 'message',
            data: data as SSEMessageData,
            id: event.id,
          });
          break;
        case 'poll_update':
          this.options.onPollUpdate?.({
            type: 'poll_update',
            data: data as SSEPollUpdateData,
            id: event.id,
          });
          break;
        case 'heartbeat':
          this.options.onHeartbeat?.({
            type: 'heartbeat',
            data: data as SSEHeartbeatData,
            id: event.id,
          });
          break;
        default:
          // Unknown event type, log but don't error
          Sentry.addBreadcrumb({
            category: 'sse',
            message: `Unknown SSE event type: ${event.event}`,
            level: 'warning',
            data: { event: event.event },
          });
      }
    } catch (parseError) {
      Sentry.captureException(parseError, {
        tags: { type: 'sse_parse_error' },
        extra: { event },
      });
    }
  }

  /**
   * Handle connection error
   */
  private handleError(error: Error): void {
    this.isConnected = false;
    this.clearHeartbeatTimer();
    this.options.onError?.(error);
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.isClosed) return;

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      Sentry.captureMessage('SSE max reconnection attempts reached', {
        level: 'error',
        extra: { url: this.url, attempts: this.reconnectAttempts },
      });
      this.options.onError?.(new Error('Max reconnection attempts reached'));
      return;
    }

    // Exponential backoff with jitter
    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000,
      this.options.maxReconnectDelay
    );

    this.reconnectAttempts++;

    Sentry.addBreadcrumb({
      category: 'sse',
      message: `SSE reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
      level: 'info',
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeatTimer(): void {
    this.clearHeartbeatTimer();
    this.heartbeatTimer = setTimeout(() => {
      if (this.isConnected) {
        Sentry.addBreadcrumb({
          category: 'sse',
          message: 'SSE heartbeat timeout',
          level: 'warning',
        });
        this.disconnect();
        this.scheduleReconnect();
      }
    }, this.options.heartbeatTimeout);
  }

  /**
   * Reset heartbeat timer
   */
  private resetHeartbeatTimer(): void {
    this.startHeartbeatTimer();
  }

  /**
   * Clear heartbeat timer
   */
  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Disconnect from SSE (allows reconnection)
   */
  disconnect(): void {
    this.isConnected = false;
    this.clearHeartbeatTimer();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.options.onClose?.();
  }

  /**
   * Close the SSE connection permanently
   */
  close(): void {
    this.isClosed = true;
    this.disconnect();

    Sentry.addBreadcrumb({
      category: 'sse',
      message: 'SSE connection closed',
      level: 'info',
    });
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

/**
 * Create a new SSE client for a chat
 */
export function createChatSSEClient(
  chatId: string,
  options: Omit<SSEClientOptions, 'url'>
): SSEClient {
  return new SSEClient({
    ...options,
    url: `/chats/${chatId}/stream`,
  });
}
