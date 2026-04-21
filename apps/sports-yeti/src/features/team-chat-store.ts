import { create } from 'zustand';
import {
  INITIAL_COMMIT_POLLS,
  type CommitPoll,
  type CommitVote,
} from '../mocks/teams';
import {
  CHAT_MESSAGES,
  type ChatCard,
  type ChatMessage,
} from '../mocks/messages';
import { SARAH_AVATAR } from '../mocks/avatars';

const SARAH_PLAYER_ID = 'p-sarah';

interface TeamChatState {
  messagesByChat: Record<string, ChatMessage[]>;
  pollsById: Record<string, CommitPoll>;
  /** Append a plain text message authored by the current user. */
  appendUserMessage: (chatId: string, body: string) => void;
  /** Append a new captain message that posts a card into the named chat. */
  postCard: (chatId: string, body: string, card: ChatCard) => void;
  /** Cast / change the current user's vote on a commit poll. */
  votePoll: (pollId: string, vote: CommitVote) => void;
  /** Used by captain remove-player flow so the cached chat reflects the change. */
  removeMessageAuthor: (playerId: string) => void;
  ensureSeed: () => void;
}

function seedMessages(): Record<string, ChatMessage[]> {
  const seeded: Record<string, ChatMessage[]> = {};
  for (const [id, list] of Object.entries(CHAT_MESSAGES)) {
    seeded[id] = [...list];
  }
  return seeded;
}

export const useTeamChat = create<TeamChatState>((set, get) => ({
  messagesByChat: seedMessages(),
  pollsById: { ...INITIAL_COMMIT_POLLS },
  appendUserMessage: (chatId, body) => {
    const next: ChatMessage = {
      id: `m-${Date.now()}`,
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body,
      timestamp: 'Just now',
      isYou: true,
    };
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [...(state.messagesByChat[chatId] ?? []), next],
      },
    }));
  },
  postCard: (chatId, body, card) => {
    const next: ChatMessage = {
      id: `card-${Date.now()}`,
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body,
      timestamp: 'Just now',
      isYou: true,
      card,
    };
    if (card.kind === 'commit_poll' && !get().pollsById[card.pollId]) {
      set((state) => ({
        pollsById: {
          ...state.pollsById,
          [card.pollId]: {
            id: card.pollId,
            leagueId: card.leagueId,
            leagueName: card.leagueName,
            question: card.question,
            createdBy: 'Sarah Jenkins',
            createdAt: 'Just now',
            closesAt: card.closesAt,
            responses: {},
          },
        },
      }));
    }
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [...(state.messagesByChat[chatId] ?? []), next],
      },
    }));
  },
  votePoll: (pollId, vote) => {
    set((state) => {
      const existing = state.pollsById[pollId];
      if (!existing) return state;
      return {
        pollsById: {
          ...state.pollsById,
          [pollId]: {
            ...existing,
            responses: {
              ...existing.responses,
              [SARAH_PLAYER_ID]: vote,
            },
          },
        },
      };
    });
  },
  removeMessageAuthor: (playerId) => {
    set((state) => {
      const next: Record<string, ChatMessage[]> = {};
      for (const [chatId, list] of Object.entries(state.messagesByChat)) {
        next[chatId] = list.filter((m) => {
          // Strip the matching author so the chat reflects the roster removal.
          // We compare by handle since ChatMessage doesn't carry playerId.
          if (playerId === 'p-marcus' && m.authorHandle === '@marcus_strikes') return false;
          if (playerId === 'p-priya' && m.authorHandle === '@priya_serves') return false;
          if (playerId === 'p-leo' && m.authorHandle === '@leo_p') return false;
          if (playerId === 'p-tara' && m.authorHandle === '@tara_v') return false;
          if (playerId === 'p-eli' && m.authorHandle === '@eli_m') return false;
          return true;
        });
      }
      return { messagesByChat: next };
    });
  },
  ensureSeed: () => {
    if (Object.keys(get().messagesByChat).length === 0) {
      set({ messagesByChat: seedMessages(), pollsById: { ...INITIAL_COMMIT_POLLS } });
    }
  },
}));

export const SARAH_VOTER_ID = SARAH_PLAYER_ID;
