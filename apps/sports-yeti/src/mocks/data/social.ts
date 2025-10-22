import { Post, Comment, Like, Notification, PointTransaction } from '../../types';
import { mockPlayers } from './users';

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    userId: mockPlayers[0].id,
    content: 'Just finished an amazing pickup game at Manhattan Sports Center! 🏀 The new courts are incredible. Who wants to join next time?',
    mediaUrls: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    ],
    likesCount: 12,
    commentsCount: 3,
    leagueId: 'league-1',
    createdAt: '2024-01-23T16:30:00Z',
    user: mockPlayers[0],
    comments: [
      {
        id: 'comment-1',
        postId: 'post-1',
        userId: 'player-4',
        content: 'Looks awesome! Count me in for next time!',
        createdAt: '2024-01-23T16:45:00Z',
        user: {
          id: 'player-4',
          email: 'sarah.wilson@example.com',
          firstName: 'Sarah',
          lastName: 'Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          createdAt: '2024-01-14T08:00:00Z',
          updatedAt: '2024-01-14T08:00:00Z'
        } as any
      }
    ],
    likes: []
  },
  {
    id: 'post-2',
    userId: mockPlayers[1].id,
    content: 'Great soccer match today! The weather was perfect and we had a full team turnout. Thanks to everyone who showed up! ⚽',
    mediaUrls: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop'
    ],
    likesCount: 8,
    commentsCount: 2,
    leagueId: 'league-2',
    createdAt: '2024-01-22T18:15:00Z',
    user: mockPlayers[1],
    comments: [],
    likes: []
  },
  {
    id: 'post-3',
    userId: mockPlayers[2].id,
    content: 'As a referee, I love seeing the sportsmanship in our community games. Keep up the great work everyone! Remember, the game is about having fun and staying active. 🏆',
    mediaUrls: [],
    likesCount: 15,
    commentsCount: 5,
    createdAt: '2024-01-21T14:20:00Z',
    user: mockPlayers[2],
    comments: [],
    likes: []
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notification-1',
    userId: mockPlayers[0].id,
    type: 'game_reminder',
    title: 'Game Reminder',
    message: 'Your game against Queens United starts in 2 hours at Manhattan Sports Center',
    data: { gameId: 'game-1', facilityId: 'facility-1' },
    read: false,
    createdAt: '2024-01-25T13:00:00Z'
  },
  {
    id: 'notification-2',
    userId: mockPlayers[0].id,
    type: 'team_invitation',
    title: 'Team Invitation',
    message: 'You have been invited to join the Brooklyn Nets basketball team',
    data: { teamId: 'team-3', inviterId: mockPlayers[2].id },
    read: false,
    createdAt: '2024-01-24T10:30:00Z'
  },
  {
    id: 'notification-3',
    userId: mockPlayers[0].id,
    type: 'achievement_unlocked',
    title: 'Achievement Unlocked!',
    message: 'You earned the "Team Captain" achievement for creating your first team',
    data: { achievementId: 'ach-2' },
    read: true,
    readAt: '2024-01-20T13:00:00Z',
    createdAt: '2024-01-20T12:00:00Z'
  },
  {
    id: 'notification-4',
    userId: mockPlayers[0].id,
    type: 'chat_message',
    title: 'New Message',
    message: 'Sarah Wilson: "Hey team, are we still on for practice tomorrow?"',
    data: { chatId: 'chat-1', senderId: 'player-4' },
    read: false,
    createdAt: '2024-01-23T15:45:00Z'
  }
];

export const mockPointTransactions: PointTransaction[] = [
  {
    id: 'transaction-1',
    userId: mockPlayers[0].id,
    pointsEarned: 50,
    pointsSpent: 0,
    balance: 2850,
    transactionType: 'earned_game',
    description: 'Points earned from game victory',
    referenceId: 'game-3',
    createdAt: '2024-01-24T20:30:00Z'
  },
  {
    id: 'transaction-2',
    userId: mockPlayers[0].id,
    pointsEarned: 100,
    pointsSpent: 0,
    balance: 2800,
    transactionType: 'earned_achievement',
    description: 'Team Captain achievement unlocked',
    referenceId: 'ach-2',
    createdAt: '2024-01-20T12:00:00Z'
  },
  {
    id: 'transaction-3',
    userId: mockPlayers[0].id,
    pointsEarned: 0,
    pointsSpent: 100,
    balance: 2700,
    transactionType: 'spent_booking',
    description: 'Facility booking - Court 1',
    referenceId: 'booking-1',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'transaction-4',
    userId: mockPlayers[0].id,
    pointsEarned: 25,
    pointsSpent: 0,
    balance: 2600,
    transactionType: 'earned_content',
    description: 'Points earned from social post engagement',
    referenceId: 'post-1',
    createdAt: '2024-01-19T14:00:00Z'
  },
  {
    id: 'transaction-5',
    userId: mockPlayers[0].id,
    pointsEarned: 0,
    pointsSpent: 200,
    balance: 2400,
    transactionType: 'wagered_game',
    description: 'Point wager for mock game',
    referenceId: 'game-3',
    createdAt: '2024-01-18T16:00:00Z'
  }
];

export const getPostsByUser = (userId: string): Post[] =>
  mockPosts.filter(post => post.userId === userId);

export const getPostsByLeague = (leagueId: string): Post[] =>
  mockPosts.filter(post => post.leagueId === leagueId);

export const getNotificationsByUser = (userId: string): Notification[] =>
  mockNotifications.filter(notification => notification.userId === userId);

export const getUnreadNotifications = (userId: string): Notification[] =>
  mockNotifications.filter(notification =>
    notification.userId === userId && !notification.read
  );

export const getPointTransactionsByUser = (userId: string): PointTransaction[] =>
  mockPointTransactions.filter(transaction => transaction.userId === userId);

export const getRecentPosts = (): Post[] =>
  mockPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());