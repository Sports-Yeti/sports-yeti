/**
 * useChatSSE Hook
 *
 * React hook for managing SSE (Server-Sent Events) connection
 * to the chat stream endpoint. Handles:
 * - Connection lifecycle
 * - Real-time message updates
 * - Poll vote updates
 * - Reconnection on disconnect
 * - Heartbeat monitoring
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import {
  SSEClient,
  createChatSSEClient,
  SSEMessageData,
  SSEPollUpdateData,
} from '../services/sseClient';

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
}

export interface ChatPoll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  user_vote?: string;
  is_closed: boolean;
  closes_at?: string;
}

interface UseChatSSEOptions {
  /** Chat ID to connect to */
  chatId: string;
  /** Callback when a new message is received */
  onMessage?: (message: ChatMessage) => void;
  /** Callback when poll votes are updated */
  onPollUpdate?: (poll: { id: string; votes: Record<string, number>; is_closed: boolean }) => void;
  /** Whether the SSE connection should be enabled (default: true) */
  enabled?: boolean;
}

interface UseChatSSEResult {
  /** Whether the SSE connection is currently active */
  isConnected: boolean;
  /** Number of reconnection attempts since last successful connection */
  reconnectAttempts: number;
  /** Last error that occurred, if any */
  error: Error | null;
  /** Manually reconnect the SSE connection */
  reconnect: () => void;
  /** Disconnect the SSE connection */
  disconnect: () => void;
}

export function useChatSSE({
  chatId,
  onMessage,
  onPollUpdate,
  enabled = true,
}: UseChatSSEOptions): UseChatSSEResult {
  const clientRef = useRef<SSEClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Store callbacks in refs to avoid recreating SSE client on callback changes
  const onMessageRef = useRef(onMessage);
  const onPollUpdateRef = useRef(onPollUpdate);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onPollUpdateRef.current = onPollUpdate;
  }, [onPollUpdate]);

  // Connect to SSE
  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.close();
    }

    setError(null);

    const client = createChatSSEClient(chatId, {
      onMessage: (event) => {
        const data = event.data as SSEMessageData;
        
        // Transform SSE message format to ChatMessage format
        const message: ChatMessage = {
          id: data.id,
          content: data.message,
          user_id: String(data.user_id),
          user: {
            id: data.user.id,
            name: data.user.name,
            avatar_url: data.user.avatar_url,
          },
          created_at: data.created_at,
        };

        Sentry.addBreadcrumb({
          category: 'chat',
          message: 'SSE message received',
          level: 'info',
          data: { messageId: message.id },
        });

        onMessageRef.current?.(message);
      },
      onPollUpdate: (event) => {
        const data = event.data as SSEPollUpdateData;

        Sentry.addBreadcrumb({
          category: 'chat',
          message: 'SSE poll update received',
          level: 'info',
          data: { pollId: data.id },
        });

        onPollUpdateRef.current?.({
          id: data.id,
          votes: data.vote_counts,
          is_closed: data.is_closed,
        });
      },
      onHeartbeat: () => {
        // Heartbeat received, connection is healthy
        setReconnectAttempts(0);
      },
      onOpen: () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        setError(null);

        Sentry.addBreadcrumb({
          category: 'chat',
          message: 'SSE connected',
          level: 'info',
          data: { chatId },
        });
      },
      onClose: () => {
        setIsConnected(false);
      },
      onError: (err) => {
        setIsConnected(false);
        setError(err);
        
        const status = clientRef.current?.getConnectionStatus();
        if (status) {
          setReconnectAttempts(status.reconnectAttempts);
        }
      },
    });

    clientRef.current = client;
    client.connect();
  }, [chatId]);

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.close();
      clientRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  // Setup and cleanup
  useEffect(() => {
    if (!enabled || !chatId) {
      disconnect();
      return;
    }

    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
      }
    };
  }, [chatId, enabled, connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
    error,
    reconnect,
    disconnect,
  };
}
