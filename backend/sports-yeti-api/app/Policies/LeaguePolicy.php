<?php

namespace App\Policies;

use App\Models\User;
use App\Models\League;
use App\UserRole;
use App\Permission;

class LeaguePolicy
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
    public function view(User $user, League $league): bool
    {
        // System admins can view all leagues
        if ($user->hasRole(UserRole::SYSTEM_ADMIN)) {
            return true;
        }
        
        // League admin can view their own league
        if ($league->admin_id === $user->id) {
            return true;
        }
        
        // Players can view leagues they're part of
        if ($user->player && $user->player->league_id === $league->id) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission(Permission::MANAGE_LEAGUE) || 
               $user->hasRole(UserRole::SYSTEM_ADMIN);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, League $league): bool
    {
        // System admins can update any league
        if ($user->hasRole(UserRole::SYSTEM_ADMIN)) {
            return true;
        }
        
        // League admin can update their own league
        return $league->admin_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, League $league): bool
    {
        // System admins can delete any league
        if ($user->hasRole(UserRole::SYSTEM_ADMIN)) {
            return true;
        }
        
        // League admin can delete their own league
        return $league->admin_id === $user->id;
    }
}
