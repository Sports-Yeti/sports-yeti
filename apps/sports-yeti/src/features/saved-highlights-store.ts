import { create } from 'zustand';
import {
  HIGHLIGHT_REELS,
  REEL_COMMENTS,
  type HighlightReel,
  type ReelComment,
} from '../mocks/highlights';
import { SARAH_AVATAR } from '../mocks/avatars';

const SARAH_HANDLE = '@jenkins_yeti';

interface SavedHighlightsState {
  /** Set of reel ids the current user has bookmarked. */
  bookmarkedIds: Set<string>;
  /** Per-reel comment timeline (seeded from REEL_COMMENTS, mutated by addComment). */
  commentsByReel: Record<string, ReelComment[]>;
  /** Per-reel comment count delta (so UI can show updated counts without rewriting reels). */
  commentDeltaByReel: Record<string, number>;
  toggleBookmark: (reelId: string) => boolean;
  addComment: (reelId: string, body: string) => ReelComment | null;
  getCommentsFor: (reelId: string) => ReelComment[];
  getCommentCount: (reel: HighlightReel) => number;
  isBookmarked: (reelId: string) => boolean;
  getBookmarkedReels: () => HighlightReel[];
  /** Clear every saved highlight (used by the Bookmarks screen "Remove all"). */
  clearAllBookmarks: () => void;
}

// Seed two bookmarks so the Bookmarks screen has populated content out of
// the box for demos / first-launch experience.
const SEED_BOOKMARKS: string[] = [
  'avalanche-buzzer-beater',
  'beach-volley-ace',
];

function seedComments(): Record<string, ReelComment[]> {
  const seeded: Record<string, ReelComment[]> = {};
  for (const [id, list] of Object.entries(REEL_COMMENTS)) {
    seeded[id] = [...list];
  }
  return seeded;
}

export const useSavedHighlights = create<SavedHighlightsState>((set, get) => ({
  bookmarkedIds: new Set<string>(SEED_BOOKMARKS),
  commentsByReel: seedComments(),
  commentDeltaByReel: {},

  toggleBookmark: (reelId) => {
    const next = new Set(get().bookmarkedIds);
    const wasBookmarked = next.has(reelId);
    if (wasBookmarked) next.delete(reelId);
    else next.add(reelId);
    set({ bookmarkedIds: next });
    return !wasBookmarked;
  },

  addComment: (reelId, body) => {
    const trimmed = body.trim();
    if (!trimmed) return null;
    const comment: ReelComment = {
      id: `c-${Date.now()}`,
      username: SARAH_HANDLE,
      avatar: SARAH_AVATAR,
      body: trimmed,
      timestamp: 'Just now',
      likes: 0,
    };
    set((state) => ({
      commentsByReel: {
        ...state.commentsByReel,
        [reelId]: [...(state.commentsByReel[reelId] ?? []), comment],
      },
      commentDeltaByReel: {
        ...state.commentDeltaByReel,
        [reelId]: (state.commentDeltaByReel[reelId] ?? 0) + 1,
      },
    }));
    return comment;
  },

  getCommentsFor: (reelId) => get().commentsByReel[reelId] ?? [],

  getCommentCount: (reel) => reel.comments + (get().commentDeltaByReel[reel.id] ?? 0),

  isBookmarked: (reelId) => get().bookmarkedIds.has(reelId),

  getBookmarkedReels: () => {
    const ids = get().bookmarkedIds;
    return HIGHLIGHT_REELS.filter((r) => ids.has(r.id));
  },

  clearAllBookmarks: () => set({ bookmarkedIds: new Set<string>() }),
}));
