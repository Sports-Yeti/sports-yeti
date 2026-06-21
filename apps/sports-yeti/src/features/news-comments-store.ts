import { create } from 'zustand';
import { NEWS_COMMENT_SEED, type NewsComment } from '../mocks/news';
import { PROFILE_USER } from '../mocks/profile';

// ----------------------------------------------------------------------------
// Community comments for news articles. Seeds from NEWS_COMMENT_SEED and keeps
// the live timeline + like state in memory for the session (mirrors the
// saved-highlights store pattern). Swap the seed/append calls for an API layer
// when the backend lands.
// ----------------------------------------------------------------------------

interface NewsCommentsState {
  /** Per-article comment timeline (seeded, then appended to by addComment). */
  commentsByArticle: Record<string, NewsComment[]>;
  /** Comment ids the current user has liked this session. */
  likedIds: Set<string>;
  addComment: (articleId: string, body: string) => NewsComment | null;
  toggleLike: (commentId: string) => boolean;
  getComments: (articleId: string) => NewsComment[];
  getCount: (articleId: string) => number;
  isLiked: (commentId: string) => boolean;
}

function seedComments(): Record<string, NewsComment[]> {
  const seeded: Record<string, NewsComment[]> = {};
  for (const [id, list] of Object.entries(NEWS_COMMENT_SEED)) {
    seeded[id] = [...list];
  }
  return seeded;
}

export const useNewsComments = create<NewsCommentsState>((set, get) => ({
  commentsByArticle: seedComments(),
  likedIds: new Set<string>(),

  addComment: (articleId, body) => {
    const trimmed = body.trim();
    if (!trimmed) return null;
    const comment: NewsComment = {
      id: `nc-${Date.now()}`,
      authorName: PROFILE_USER.name,
      authorHandle: PROFILE_USER.handle,
      avatar: PROFILE_USER.avatar,
      body: trimmed,
      timeAgo: 'Just now',
      likes: 0,
    };
    set((state) => ({
      commentsByArticle: {
        ...state.commentsByArticle,
        // Newest first so the reader sees their comment immediately.
        [articleId]: [comment, ...(state.commentsByArticle[articleId] ?? [])],
      },
    }));
    return comment;
  },

  toggleLike: (commentId) => {
    const liked = get().likedIds.has(commentId);
    const nextLiked = new Set(get().likedIds);
    if (liked) nextLiked.delete(commentId);
    else nextLiked.add(commentId);
    set((state) => {
      const next: Record<string, NewsComment[]> = {};
      for (const [articleId, list] of Object.entries(state.commentsByArticle)) {
        next[articleId] = list.map((c) =>
          c.id === commentId
            ? { ...c, likes: c.likes + (liked ? -1 : 1) }
            : c,
        );
      }
      return { commentsByArticle: next, likedIds: nextLiked };
    });
    return !liked;
  },

  getComments: (articleId) => get().commentsByArticle[articleId] ?? [],

  getCount: (articleId) => (get().commentsByArticle[articleId] ?? []).length,

  isLiked: (commentId) => get().likedIds.has(commentId),
}));
