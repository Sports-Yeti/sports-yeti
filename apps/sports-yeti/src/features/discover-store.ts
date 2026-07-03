import { useMemo } from 'react';
import { create } from 'zustand';
import { DISCOVER_GAMES, type DiscoverGame } from '../mocks/games';

/**
 * Session-created Discover listings. Games built in the Host-a-game wizard
 * land here so they show up in Discover, open in GameDetail, and appear in
 * the host's Schedule — the create journey completes instead of vanishing
 * into a toast. Resets on app restart (mock data only).
 */
interface DiscoverState {
  createdGames: DiscoverGame[];
  addGame: (game: DiscoverGame) => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  createdGames: [],
  addGame: (game) =>
    set((state) => ({ createdGames: [game, ...state.createdGames] })),
}));

/** Seeded + session-created games, newest creations first. */
export function useDiscoverGames(): DiscoverGame[] {
  const createdGames = useDiscoverStore((s) => s.createdGames);
  return useMemo(() => [...createdGames, ...DISCOVER_GAMES], [createdGames]);
}

/** Find a game across seeded + session-created listings. */
export function useDiscoverGame(id: string): DiscoverGame | undefined {
  const createdGames = useDiscoverStore((s) => s.createdGames);
  return useMemo(
    () =>
      createdGames.find((g) => g.id === id) ??
      DISCOVER_GAMES.find((g) => g.id === id),
    [createdGames, id],
  );
}
