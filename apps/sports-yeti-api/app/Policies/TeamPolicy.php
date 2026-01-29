<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('teams.view');
    }

    public function view(User $user, Team $team): bool
    {
        return $user->hasPermissionTo('teams.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('teams.create');
    }

    public function update(User $user, Team $team): bool
    {
        if (!$user->hasPermissionTo('teams.update')) {
            return false;
        }

        // Team captain can update their team
        if ($team->captain_id === $user->id) {
            return true;
        }

        // League admin can update any team in their league
        return $this->isLeagueAdminForTeam($user, $team);
    }

    public function delete(User $user, Team $team): bool
    {
        if (!$user->hasPermissionTo('teams.delete')) {
            return false;
        }

        return $this->isLeagueAdminForTeam($user, $team);
    }

    public function manageMembers(User $user, Team $team): bool
    {
        if (!$user->hasPermissionTo('teams.manage-members')) {
            return false;
        }

        // Team captain can manage members
        if ($team->captain_id === $user->id) {
            return true;
        }

        return $this->isLeagueAdminForTeam($user, $team);
    }

    private function isLeagueAdminForTeam(User $user, Team $team): bool
    {
        $league = $team->league;
        
        if (!$league) {
            return false;
        }

        if ($league->admin_id === $user->id) {
            return true;
        }

        return $league->admins()->where('user_id', $user->id)->exists();
    }
}
