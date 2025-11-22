import { Chat, ChatMessage, ChatPoll, PollOption, PollVote } from '../../types';
import { mockPlayers } from './users';

export const mockChatPolls: ChatPoll[] = [
  {
    id: 'poll-1',
    chatId: 'chat-1',
    question: 'Are we still playing tomorrow?',
    options: [
      { id: 'option-1', text: 'Yes, I\'m in!', voteCount: 3 },
      { id: 'option-2', text: 'Maybe, depends on weather', voteCount: 1 },
      { id: 'option-3', text: 'No, I can\'t make it', voteCount: 0 }
    ],
    votes: [
      { id: 'vote-1', pollId: 'poll-1', userId: mockPlayers[0].id, optionId: 'option-1', createdAt: '2024-01-23T10:00:00Z' },
      { id: 'vote-2', pollId: 'poll-1', userId: 'player-4', optionId: 'option-1', createdAt: '2024-01-23T10:15:00Z' }
    ],
    createdBy: mockPlayers[0].id,
    createdAt: '2024-01-23T09:30:00Z'
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'message-1',
    chatId: 'chat-1',
    userId: mockPlayers[0].id,
    message: 'Hey team! Ready for tomorrow\'s game?',
    messageType: 'text',
    createdAt: '2024-01-23T09:00:00Z',
    user: mockPlayers[0]
  },
  {
    id: 'message-2',
    chatId: 'chat-1',
    userId: 'player-4',
    message: 'Absolutely! I\'ve been practicing my three-pointers all week 💪',
    messageType: 'text',
    createdAt: '2024-01-23T09:15:00Z',
    user: {
      id: 'player-4',
      email: 'sarah.wilson@example.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      createdAt: '2024-01-14T08:00:00Z',
      updatedAt: '2024-01-14T08:00:00Z'
    } as any
  },
  {
    id: 'message-3',
    chatId: 'chat-1',
    userId: mockPlayers[0].id,
    message: 'Let\'s create a quick poll to confirm attendance',
    messageType: 'text',
    createdAt: '2024-01-23T09:30:00Z',
    user: mockPlayers[0]
  },
  {
    id: 'message-4',
    chatId: 'chat-1',
    userId: 'player-5',
    message: 'I\'m definitely coming! The weather looks good too',
    messageType: 'text',
    createdAt: '2024-01-23T10:30:00Z',
    user: {
      id: 'player-5',
      email: 'alex.brown@example.com',
      firstName: 'Alex',
      lastName: 'Brown',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2024-01-10T12:00:00Z'
    } as any
  }
];

export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    gameId: 'game-1',
    type: 'game',
    participants: [
      {
        id: 'chat-participant-1',
        chatId: 'chat-1',
        userId: mockPlayers[0].id,
        role: 'admin',
        joinedAt: '2024-01-20T10:00:00Z',
        user: mockPlayers[0]
      }
    ],
    messages: mockChatMessages.filter(msg => msg.chatId === 'chat-1'),
    polls: mockChatPolls.filter(poll => poll.chatId === 'chat-1'),
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'chat-2',
    teamId: 'team-1',
    type: 'team',
    participants: [],
    messages: [],
    polls: [],
    createdAt: '2024-01-15T10:00:00Z'
  }
];

export const getChatById = (id: string): Chat | undefined =>
  mockChats.find(chat => chat.id === id);

export const getMessagesByChat = (chatId: string): ChatMessage[] =>
  mockChatMessages.filter(message => message.chatId === chatId);

export const getPollsByChat = (chatId: string): ChatPoll[] =>
  mockChatPolls.filter(poll => poll.chatId === chatId);