import { create } from 'zustand';
import { DEFAULT_FOLLOWING } from '../mocks/profile';

interface FollowState {
  /** playerIds the current user follows, most-recent first. */
  followingIds: string[];
  isFollowing: (playerId: string) => boolean;
  /** Returns true when the player is followed after the toggle. */
  toggleFollow: (playerId: string) => boolean;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  followingIds: [...DEFAULT_FOLLOWING],
  isFollowing: (playerId) => get().followingIds.includes(playerId),
  toggleFollow: (playerId) => {
    const isNowFollowing = !get().followingIds.includes(playerId);
    set((state) => ({
      followingIds: isNowFollowing
        ? [playerId, ...state.followingIds]
        : state.followingIds.filter((id) => id !== playerId),
    }));
    return isNowFollowing;
  },
}));
