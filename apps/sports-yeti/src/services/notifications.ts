// Push Notifications Service
// Handle push notifications with Expo Notifications

import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog } from '../utils/config';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request push notification permissions
export async function requestPushNotificationPermissions(): Promise<boolean> {
  try {
    const isDevice = Constants.isDevice;
    if (!isDevice) {
      // Running on simulator/emulator
      debugLog('Push notifications are not available on simulator');
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notification Permission',
        'Enable notifications to receive game reminders and updates.'
      );
      return false;
    }

    return true;
  } catch (error) {
    debugLog('Error requesting push notification permissions:', error);
    return false;
  }
}

// Get Expo push token
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const isDevice = Constants.isDevice;
    if (!isDevice) {
      debugLog('Cannot get push token on simulator');
      return null;
    }

    const hasPermission = await requestPushNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // TODO: Update with your Expo project ID
    });

    debugLog('Expo Push Token:', token.data);

    // Store token locally
    await AsyncStorage.setItem('expoPushToken', token.data);

    // TODO: Send token to backend
    // await apiRegisterPushToken(token.data);

    return token.data;
  } catch (error) {
    debugLog('Error getting Expo push token:', error);
    return null;
  }
}

// Configure notification channels (Android)
export async function configureNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });

    await Notifications.setNotificationChannelAsync('game-reminders', {
      name: 'Game Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });

    await Notifications.setNotificationChannelAsync('chat-messages', {
      name: 'Chat Messages',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#007AFF',
    });

    await Notifications.setNotificationChannelAsync('social-updates', {
      name: 'Social Updates',
      importance: Notifications.AndroidImportance.LOW,
    });
  }
}

// Schedule a local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  trigger?: Date | null
): Promise<string> {
  try {
    const triggerInput: Notifications.NotificationTriggerInput | null = trigger
      ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger }
      : null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: triggerInput,
    });

    debugLog('Scheduled notification:', id);
    return id;
  } catch (error) {
    debugLog('Error scheduling notification:', error);
    throw error;
  }
}

// Schedule game reminder notification
export async function scheduleGameReminder(
  gameId: string,
  gameTime: string,
  opponentName: string,
  facilityName: string
): Promise<void> {
  try {
    const gameDate = new Date(gameTime);
    const reminderTime = new Date(gameDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before

    if (reminderTime > new Date()) {
      await scheduleLocalNotification(
        'Game Reminder',
        `Your game against ${opponentName} starts in 2 hours at ${facilityName}`,
        { type: 'game_reminder', gameId },
        reminderTime
      );

      debugLog('Game reminder scheduled for:', reminderTime);
    }
  } catch (error) {
    debugLog('Error scheduling game reminder:', error);
  }
}

// Cancel a scheduled notification
export async function cancelNotification(
  notificationId: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    debugLog('Cancelled notification:', notificationId);
  } catch (error) {
    debugLog('Error cancelling notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    debugLog('Cancelled all notifications');
  } catch (error) {
    debugLog('Error cancelling all notifications:', error);
  }
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    debugLog('Error getting badge count:', error);
    return 0;
  }
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
    debugLog('Badge count set to:', count);
  } catch (error) {
    debugLog('Error setting badge count:', error);
  }
}

// Clear all notifications from notification center
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
    debugLog('Cleared all notifications');
  } catch (error) {
    debugLog('Error clearing notifications:', error);
  }
}

// Add notification received listener
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Add notification response listener (when user taps notification)
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Initialize push notifications
export async function initializePushNotifications(): Promise<void> {
  try {
    // Configure channels
    await configureNotificationChannels();

    // Get push token
    const token = await getExpoPushToken();
    if (token) {
      debugLog('Push notifications initialized with token:', token);
    }
  } catch (error) {
    debugLog('Error initializing push notifications:', error);
  }
}

// Send a test notification
export async function sendTestNotification(): Promise<void> {
  await scheduleLocalNotification(
    'Test Notification',
    'This is a test notification from Sports Yeti!',
    { type: 'test' }
  );
}

export default {
  requestPushNotificationPermissions,
  getExpoPushToken,
  configureNotificationChannels,
  scheduleLocalNotification,
  scheduleGameReminder,
  cancelNotification,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  clearAllNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  initializePushNotifications,
  sendTestNotification,
};
