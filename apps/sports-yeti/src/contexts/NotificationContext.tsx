import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationContextType, Notification } from '../types';
import { useAuth } from './AuthContext';
import websocketService from '../services/websocket';
import {
  initializePushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  setBadgeCount,
} from '../services/notifications';
import { getNotificationsByUser } from '../mocks/data';
import { debugLog } from '../utils/config';

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && isAuthenticated) {
      // Load notifications
      loadNotifications();

      // Initialize push notifications
      initializePushNotifications();

      // Set up listeners
      const receivedListener = addNotificationReceivedListener(
        (notification) => {
          debugLog('Notification received:', notification);
          handleNotificationReceived(notification);
        }
      );

      const responseListener = addNotificationResponseListener((response) => {
        debugLog('Notification tapped:', response);
        handleNotificationResponse(response);
      });

      // Connect to WebSocket for real-time notifications
      if (websocketService.isConnected()) {
        setupWebSocketListeners();
      }

      return () => {
        receivedListener.remove();
        responseListener.remove();
      };
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Update badge count when unread changes
    setBadgeCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    // Handle app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => {
      subscription?.remove();
    };
  }, []);

  const loadNotifications = () => {
    if (!user) return;

    // TODO: Load from API
    // const result = await apiGetNotifications();
    // setNotifications(result.data);

    // For now, use mock data
    const mockData = getNotificationsByUser(user.id);
    setNotifications(mockData);
    updateUnreadCount(mockData);
  };

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter((n) => !n.read).length;
    setUnreadCount(count);
  };

  const handleNotificationReceived = (
    notification: Notifications.Notification
  ) => {
    // Add to notifications list
    const newNotification: Notification = {
      id: notification.request.identifier,
      userId: user?.id || '',
      type: 'system_update',
      title: notification.request.content.title || '',
      message: notification.request.content.body || '',
      data: notification.request.content.data || {},
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const handleNotificationResponse = (
    response: Notifications.NotificationResponse
  ) => {
    const { data } = response.notification.request.content;

    // Handle notification tap based on type
    if (data?.type === 'game_reminder' && data?.gameId) {
      // TODO: Navigate to game details
      debugLog('Navigate to game:', data.gameId);
    } else if (data?.type === 'chat_message' && data?.chatId) {
      // TODO: Navigate to chat
      debugLog('Navigate to chat:', data.chatId);
    } else if (data?.type === 'team_invitation' && data?.teamId) {
      // TODO: Navigate to team
      debugLog('Navigate to team:', data.teamId);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground - refresh notifications
      loadNotifications();
    }
  };

  const setupWebSocketListeners = () => {
    // Listen for real-time notifications
    websocketService.onNotification((notification) => {
      debugLog('Real-time notification received:', notification);

      const newNotif: Notification = {
        ...notification,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      // TODO: Call API
      // await apiMarkNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      debugLog('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      // TODO: Call API
      // await apiMarkAllNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
          readAt: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      debugLog('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      // TODO: Call API
      // await apiDeleteNotification(notificationId);

      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      debugLog('Error deleting notification:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};
