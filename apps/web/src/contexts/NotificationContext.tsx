import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Snackbar, Alert, Badge, IconButton } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotification: (type: Notification['type'], message: string, link?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentSnackbar, setCurrentSnackbar] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const showNotification = useCallback((type: Notification['type'], message: string, link?: string) => {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      link,
    };

    setNotifications(prev => [notification, ...prev]);
    setCurrentSnackbar(notification);
    setSnackbarOpen(true);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotifications = [
        { type: 'info' as const, message: 'New team registered for Brooklyn Soccer League' },
        { type: 'success' as const, message: 'Game report submitted successfully' },
        { type: 'warning' as const, message: 'Assignment confirmation needed for tomorrow\'s game' },
        { type: 'info' as const, message: 'New camp registration received' },
      ];

      const random = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
      
      // Only show notification 20% of the time to avoid spam
      if (Math.random() < 0.2) {
        showNotification(random.type, random.message);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={currentSnackbar?.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {currentSnackbar?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Notification Bell Component
export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <IconButton color="inherit">
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
}
