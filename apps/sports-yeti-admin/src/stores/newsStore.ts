import { create } from 'zustand';
import { NEWS_POSTS, type NewsPost } from '../mocks/insights';

interface NewsState {
  addedPosts: NewsPost[];
  addPost: (post: NewsPost) => void;
  updatePost: (id: string, patch: Partial<NewsPost>) => void;
  reset: () => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  addedPosts: [],
  addPost: (post) =>
    set((state) => ({ addedPosts: [post, ...state.addedPosts] })),
  updatePost: (id, patch) =>
    set((state) => ({
      addedPosts: state.addedPosts.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),
  reset: () => set({ addedPosts: [] }),
}));

/**
 * Returns the live news list (mock seed + composer-added), most-recent first.
 */
export function useAllNewsPosts(): NewsPost[] {
  const added = useNewsStore((s) => s.addedPosts);
  return [...added, ...NEWS_POSTS].sort((a, b) =>
    b.publishedAtIso.localeCompare(a.publishedAtIso),
  );
}
