import { create } from 'zustand';
import {
  INITIAL_COMMIT_POLLS,
  type CommitPoll,
  type CommitVote,
  type CustomPoll,
} from '../mocks/teams';
import {
  CHAT_MESSAGES,
  type ChatCard,
  type ChatMessage,
} from '../mocks/messages';
import { PLAYER_AVATARS, SARAH_AVATAR } from '../mocks/avatars';

const SARAH_PLAYER_ID = 'p-sarah';

/** How long the demo waits before the "league office" approves a registration. */
const REGISTRATION_APPROVAL_DELAY_MS = 6000;

export interface LeagueRegistrationLive {
  teamId: string;
  leagueId: string;
  leagueName: string;
  teamName: string;
  status: 'pending' | 'approved';
  requestedAt: string;
}

interface TeamChatState {
  messagesByChat: Record<string, ChatMessage[]>;
  pollsById: Record<string, CommitPoll>;
  customPollsById: Record<string, CustomPoll>;
  /** Live league-registration status keyed by teamId (drives chat + payments). */
  registrationsByTeam: Record<string, LeagueRegistrationLive>;
  /** Append a plain text message authored by the current user. */
  appendUserMessage: (chatId: string, body: string) => void;
  /** Append a message from the "league office" (used for approval updates). */
  appendLeagueMessage: (chatId: string, body: string) => void;
  /** Append a new captain message that posts a card into the named chat. */
  postCard: (chatId: string, body: string, card: ChatCard) => void;
  /**
   * Submit a league registration: marks the team pending, posts a registration
   * card into its chat, and simulates league approval after a short delay.
   */
  requestRegistration: (args: {
    teamId: string;
    chatId: string;
    leagueId: string;
    leagueName: string;
    teamName: string;
  }) => void;
  /** Flip a pending registration to approved + post the enrollment update. */
  approveRegistration: (teamId: string) => void;
  /** Cast / change the current user's vote on a commit poll. */
  votePoll: (pollId: string, vote: CommitVote) => void;
  /**
   * Toggle the current user's selection of an option on a custom poll.
   * Single-select polls keep one option; multi-select polls toggle freely.
   */
  voteCustomPoll: (pollId: string, optionId: string) => void;
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
  customPollsById: {},
  registrationsByTeam: {},
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
  appendLeagueMessage: (chatId, body) => {
    const next: ChatMessage = {
      id: `lg-${Date.now()}`,
      authorName: 'League Office',
      authorHandle: '@league',
      authorAvatar: PLAYER_AVATARS[7] ?? SARAH_AVATAR,
      body,
      timestamp: 'Just now',
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
    if (card.kind === 'custom_poll' && !get().customPollsById[card.pollId]) {
      set((state) => ({
        customPollsById: {
          ...state.customPollsById,
          [card.pollId]: {
            id: card.pollId,
            question: card.question,
            options: card.options.map((o) => ({ ...o })),
            allowMultiple: card.allowMultiple,
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
  voteCustomPoll: (pollId, optionId) => {
    set((state) => {
      const existing = state.customPollsById[pollId];
      if (!existing) return state;
      const current = existing.responses[SARAH_PLAYER_ID] ?? [];
      const isSelected = current.includes(optionId);
      let next: string[];
      if (existing.allowMultiple) {
        next = isSelected
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        // Single-select: tapping the chosen option again clears it.
        next = isSelected ? [] : [optionId];
      }
      return {
        customPollsById: {
          ...state.customPollsById,
          [pollId]: {
            ...existing,
            responses: {
              ...existing.responses,
              [SARAH_PLAYER_ID]: next,
            },
          },
        },
      };
    });
  },
  requestRegistration: ({ teamId, chatId, leagueId, leagueName, teamName }) => {
    set((state) => ({
      registrationsByTeam: {
        ...state.registrationsByTeam,
        [teamId]: {
          teamId,
          leagueId,
          leagueName,
          teamName,
          status: 'pending',
          requestedAt: 'Just now',
        },
      },
    }));
    get().postCard(
      chatId,
      `I submitted our registration for ${leagueName}. We're pending the league's approval — I'll keep you posted here.`,
      { kind: 'league_registration', teamId, leagueId, leagueName, teamName },
    );
    // Simulate the league admin reviewing and approving the entry.
    setTimeout(() => get().approveRegistration(teamId), REGISTRATION_APPROVAL_DELAY_MS);
  },
  approveRegistration: (teamId) => {
    const existing = get().registrationsByTeam[teamId];
    if (!existing || existing.status === 'approved') return;
    set((state) => ({
      registrationsByTeam: {
        ...state.registrationsByTeam,
        [teamId]: { ...existing, status: 'approved' },
      },
    }));
    get().appendLeagueMessage(
      `chat-${teamId}`,
      `${existing.teamName} is approved and officially enrolled in ${existing.leagueName}. Player payments are now open.`,
    );
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
      set({
        messagesByChat: seedMessages(),
        pollsById: { ...INITIAL_COMMIT_POLLS },
        customPollsById: {},
        registrationsByTeam: {},
      });
    }
  },
}));

export const SARAH_VOTER_ID = SARAH_PLAYER_ID;
