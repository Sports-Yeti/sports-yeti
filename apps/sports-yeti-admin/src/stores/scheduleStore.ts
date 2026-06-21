import { create } from 'zustand';
import { GAMES, type Game } from '../mocks/games';

/**
 * Mock-only schedule store. Holds two layers on top of the static
 * `GAMES` mock so the rest of the admin can mutate the schedule
 * without backend wiring:
 *
 * - `addedGames` — games created by the fixture generator or the
 *   GameForm "new game" path.
 * - `gameEdits`  — partial overrides applied on top of either base
 *   games or added games (used by GameForm edit + game cancel).
 *
 * Selectors merge the layers so consumers (Schedule, GameDetail,
 * Dashboard) see one consistent list.
 */

interface ScheduleState {
  addedGames: Game[];
  gameEdits: Record<string, Partial<Game>>;

  // Mutations
  addGames: (games: Game[]) => void;
  upsertGame: (game: Game) => void;
  applyEdit: (id: string, patch: Partial<Game>) => void;
  cancelGame: (id: string) => void;
  removeAddedGame: (id: string) => void;
  reset: () => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  addedGames: [],
  gameEdits: {},

  addGames: (games) =>
    set((state) => ({ addedGames: [...state.addedGames, ...games] })),

  upsertGame: (game) =>
    set((state) => {
      const baseExists = GAMES.some((g) => g.id === game.id);
      const addedExists = state.addedGames.some((g) => g.id === game.id);
      if (baseExists) {
        // Edit a static mock game via gameEdits to keep the source clean.
        return {
          gameEdits: { ...state.gameEdits, [game.id]: game },
        };
      }
      if (addedExists) {
        return {
          addedGames: state.addedGames.map((g) => (g.id === game.id ? game : g)),
        };
      }
      return { addedGames: [...state.addedGames, game] };
    }),

  applyEdit: (id, patch) =>
    set((state) => ({
      gameEdits: {
        ...state.gameEdits,
        [id]: { ...(state.gameEdits[id] ?? {}), ...patch },
      },
    })),

  cancelGame: (id) =>
    set((state) => ({
      gameEdits: {
        ...state.gameEdits,
        [id]: { ...(state.gameEdits[id] ?? {}), status: 'cancelled' as const },
      },
    })),

  removeAddedGame: (id) =>
    set((state) => ({
      addedGames: state.addedGames.filter((g) => g.id !== id),
    })),

  reset: () => set({ addedGames: [], gameEdits: {} }),
}));

/**
 * Returns the full live game list (base + added + edits applied).
 * Stable reference per render; downstream `useMemo` for filtering.
 */
export function useAllGames(): Game[] {
  const addedGames = useScheduleStore((s) => s.addedGames);
  const gameEdits = useScheduleStore((s) => s.gameEdits);
  const merged = [...GAMES, ...addedGames];
  return merged.map((g) =>
    gameEdits[g.id] ? { ...g, ...gameEdits[g.id] } : g,
  );
}

export function gameByIdLive(id: string, addedGames: Game[], gameEdits: Record<string, Partial<Game>>): Game | undefined {
  const base = GAMES.find((g) => g.id === id) ?? addedGames.find((g) => g.id === id);
  if (!base) return undefined;
  return gameEdits[id] ? { ...base, ...gameEdits[id] } : base;
}

export function useGameById(id: string): Game | undefined {
  const addedGames = useScheduleStore((s) => s.addedGames);
  const gameEdits = useScheduleStore((s) => s.gameEdits);
  return gameByIdLive(id, addedGames, gameEdits);
}
