import { create } from 'zustand';

/**
 * Tracks which discoverable entities the player is "watching" for live
 * updates — games (spots changing, host posts, score updates, cancellation)
 * and teams (roster openings, new games, league registration).
 *
 * Games and teams are kept in separate sets so their ids can't collide.
 *
 * Stored in-memory only for now. When the backend lands, swap the actions
 * to call `api.watchEvent(id)` / `api.unwatchEvent(id)` (and the team
 * equivalents) and rehydrate the sets from the API on app start.
 */
interface WatchState {
  watchedIds: Set<string>;
  watchedTeamIds: Set<string>;
  toggle: (id: string) => boolean;
  toggleTeam: (id: string) => boolean;
  isWatching: (id: string) => boolean;
  isWatchingTeam: (id: string) => boolean;
  count: () => number;
  teamCount: () => number;
}

function toggleIn(current: Set<string>, id: string): [Set<string>, boolean] {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
    return [next, false];
  }
  next.add(id);
  return [next, true];
}

export const useWatchStore = create<WatchState>((set, get) => ({
  watchedIds: new Set<string>(),
  watchedTeamIds: new Set<string>(),

  toggle: (id) => {
    const [watchedIds, nowWatching] = toggleIn(get().watchedIds, id);
    set({ watchedIds });
    return nowWatching;
  },

  toggleTeam: (id) => {
    const [watchedTeamIds, nowWatching] = toggleIn(get().watchedTeamIds, id);
    set({ watchedTeamIds });
    return nowWatching;
  },

  isWatching: (id) => get().watchedIds.has(id),

  isWatchingTeam: (id) => get().watchedTeamIds.has(id),

  count: () => get().watchedIds.size,

  teamCount: () => get().watchedTeamIds.size,
}));
