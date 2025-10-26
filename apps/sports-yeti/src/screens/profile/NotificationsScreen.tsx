import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList, Notification } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getNotificationsByUser } from '../../mocks/data';
import Button from '../../components/common/Button';

type NotificationsScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Notifications'
>;

interface Props {
  navigation: NotificationsScreenNavigationProp;
}

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(
    user ? getNotificationsByUser(user.id) : []
  );

  const getNotificationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      game_reminder: '🏀',
      payment_confirmation: '💳',
      team_invitation: '👥',
      chat_message: '💬',
      achievement_unlocked: '🏆',
      booking_confirmation: '📅',
      system_update: '🔔',
      friend_request: '🤝',
      league_news: '📰',
    };
    return iconMap[type] || '🔔';
  };

  const handleMarkAsRead = (notificationId: string) => {
    // TODO: Implement mark as read API call
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId
          ? { ...n, read: true, readAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    // TODO: Implement mark all as read API call
    setNotifications(
      notifications.map((n) => ({
        ...n,
        read: true,
        readAt: new Date().toISOString(),
      }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    // TODO: Implement delete notification API call
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.notificationUnread]}
      onPress={() => !item.read && handleMarkAsRead(item.id)}
    >
      <Text style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </Text>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔔</Text>
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateSubtitle}>You're all caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
    textAlign: 'center',
  },
  markAllButton: {
    fontSize: 14,
    color: '#007AFF',
  },
  unreadBanner: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  unreadText: {
    fontSize: 14,
    color: '#0c5460',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  notificationUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    backgroundColor: '#f8f9ff',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#6c757d',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default NotificationsScreen;
