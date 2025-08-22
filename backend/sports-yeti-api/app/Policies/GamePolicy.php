<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Game;
use App\UserRole;
use App\Permission;

class GamePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission(Permission::VIEW_PROFILE);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Game $game): bool
    {
        // System admins can view all games
        if ($user->hasRole(UserRole::SYSTEM_ADMIN)) {
            return true;
        }
        
        // League admin can view games in their league
        if ($game->league->admin_id === $user->id) {
            return true;
        }
        
        // Players can view games they're participating in
        if ($game->participants()->where('player_id', $user->player?->id)->exists()) {
            return true;
        }
        
        // Team captains can view their team's games
        if ($user->player && (
            $game->team1_id === $user->player->captainedTeams()->pluck('id')->first() ||
            $game->team2_id === $user->player->captainedTeams()->pluck('id')->first()
        )) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::CREATE_GAME);
    }

    /**
     * Determine whether the user can participate in the game (for chat, etc.)
     */
    public function participate(User $user, Game $game): bool
    {
        // System admins can participate in any game
        if ($user->hasRole(UserRole::SYSTEM_ADMIN)) {
            return true;
        }
        
        // League admin can participate in games in their league
        if ($game->league->admin_id === $user->id) {
            return true;
        }
        
        // Players can participate if they're in the game
        if ($game->participants()->where('player_id', $user->player?->id)->exists()) {
            return true;
        }
        
        // Team members can participate in their team's games
        if ($user->player) {
            $playerTeamIds = $user->player->teams()->pluck('teams.id');
            if ($playerTeamIds->contains($game->team1_id) || $playerTeamIds->contains($game->team2_id)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Game $game): bool
    {
        // System admins can update any game
        if ($user->hasRole(UserRole::SYSTEM_ADMIN)) {
            return true;
        }
        
        // League admin can update games in their league
        if ($game->league->admin_id === $user->id) {
            return true;
        }
        
        // Team captains can update their team's games
        if ($user->player && (
            $game->team1->captain_id === $user->player->id ||
            $game->team2->captain_id === $user->player->id
        )) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Game $game): bool
    {
        return $this->update($user, $game);
    }
}
