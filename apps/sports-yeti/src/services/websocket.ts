// WebSocket Service
// Real-time communication for chat, game updates, and live features

import { debugLog } from '../utils/config';
import { ChatMessage } from '../types';

type MessageHandler = (message: any) => void;
type ConnectionHandler = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private isIntentionalClose = false;

  // TODO: Update with your WebSocket server URL
  private wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

  constructor() {
    debugLog('WebSocket service initialized');
  }

  // Connect to WebSocket server
  connect(authToken: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      debugLog('WebSocket already connected');
      return;
    }

    try {
      this.isIntentionalClose = false;
      this.ws = new WebSocket(`${this.wsUrl}?token=${authToken}`);

      this.ws.onopen = () => {
        debugLog('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.connectionHandlers.forEach((handler) => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          debugLog('WebSocket message received:', data);

          const { type, payload } = data;
          const handlers = this.messageHandlers.get(type);
          if (handlers) {
            handlers.forEach((handler) => handler(payload));
          }

          // Also call generic message handlers
          const genericHandlers = this.messageHandlers.get('*');
          if (genericHandlers) {
            genericHandlers.forEach((handler) => handler(data));
          }
        } catch (error) {
          debugLog('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        debugLog('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        debugLog('WebSocket disconnected');
        this.disconnectionHandlers.forEach((handler) => handler());

        // Attempt to reconnect if not intentional
        if (!this.isIntentionalClose) {
          this.attemptReconnect(authToken);
        }
      };
    } catch (error) {
      debugLog('Error connecting to WebSocket:', error);
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    debugLog('WebSocket disconnected intentionally');
  }

  // Attempt to reconnect
  private attemptReconnect(authToken: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      debugLog('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    debugLog(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect(authToken);
      this.reconnectDelay *= 2; // Exponential backoff
    }, this.reconnectDelay);
  }

  // Send message through WebSocket
  send(type: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.ws.send(message);
      debugLog('Sent WebSocket message:', { type, payload });
    } else {
      debugLog('Cannot send message - WebSocket not connected');
    }
  }

  // Subscribe to specific message type
  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  // Subscribe to connection events
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  // Subscribe to disconnection events
  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.add(handler);
    return () => {
      this.disconnectionHandlers.delete(handler);
    };
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ============================================================================
  // CHAT-SPECIFIC METHODS
  // ============================================================================

  // Join a chat room
  joinChat(chatId: string): void {
    this.send('join_chat', { chatId });
  }

  // Leave a chat room
  leaveChat(chatId: string): void {
    this.send('leave_chat', { chatId });
  }

  // Send chat message
  sendChatMessage(chatId: string, message: string): void {
    this.send('chat_message', {
      chatId,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  // Subscribe to chat messages
  onChatMessage(handler: (message: ChatMessage) => void): () => void {
    return this.on('chat_message', handler);
  }

  // Send typing indicator
  sendTypingIndicator(chatId: string, isTyping: boolean): void {
    this.send('typing', { chatId, isTyping });
  }

  // Subscribe to typing indicators
  onTyping(
    handler: (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => void
  ): () => void {
    return this.on('typing', handler);
  }

  // ============================================================================
  // GAME-SPECIFIC METHODS
  // ============================================================================

  // Subscribe to game updates
  subscribeToGame(gameId: string): void {
    this.send('subscribe_game', { gameId });
  }

  // Unsubscribe from game updates
  unsubscribeFromGame(gameId: string): void {
    this.send('unsubscribe_game', { gameId });
  }

  // Listen for game updates
  onGameUpdate(handler: (update: any) => void): () => void {
    return this.on('game_update', handler);
  }

  // Listen for attendance updates
  onAttendanceUpdate(handler: (update: any) => void): () => void {
    return this.on('attendance_update', handler);
  }

  // ============================================================================
  // NOTIFICATION METHODS
  // ============================================================================

  // Listen for real-time notifications
  onNotification(handler: (notification: any) => void): () => void {
    return this.on('notification', handler);
  }

  // Listen for point updates
  onPointUpdate(
    handler: (update: { points: number; reason: string }) => void
  ): () => void {
    return this.on('point_update', handler);
  }
}

// Export singleton instance
const websocketService = new WebSocketService();

export default websocketService;

// Export class for testing
export { WebSocketService };
