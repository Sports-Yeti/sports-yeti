import { create } from 'zustand';

/**
 * Tracks which discoverable events the player is "watching" for live
 * updates (spots changing, host posts, score updates, cancellation).
 *
 * Stored in-memory only for now. When the backend lands, swap the actions
 * to call `api.watchEvent(id)` / `api.unwatchEvent(id)` and rehydrate the
 * set from `api.listWatchedEvents()` on app start.
 */
interface WatchState {
  watchedIds: Set<string>;
  toggle: (id: string) => boolean;
  isWatching: (id: string) => boolean;
  count: () => number;
}

export const useWatchStore = create<WatchState>((set, get) => ({
  watchedIds: new Set<string>(),

  toggle: (id) => {
    const next = new Set(get().watchedIds);
    let nowWatching: boolean;
    if (next.has(id)) {
      next.delete(id);
      nowWatching = false;
    } else {
      next.add(id);
      nowWatching = true;
    }
    set({ watchedIds: next });
    return nowWatching;
  },

  isWatching: (id) => get().watchedIds.has(id),

  count: () => get().watchedIds.size,
}));
