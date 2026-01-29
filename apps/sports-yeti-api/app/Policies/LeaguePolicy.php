<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\League;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LeaguePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('leagues.view');
    }

    public function view(User $user, League $league): bool
    {
        return $user->hasPermissionTo('leagues.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('leagues.create');
    }

    public function update(User $user, League $league): bool
    {
        // Super admin or league admin for this league
        if ($user->hasPermissionTo('leagues.update')) {
            return $this->isLeagueAdmin($user, $league);
        }

        return false;
    }

    public function delete(User $user, League $league): bool
    {
        return $user->hasPermissionTo('leagues.delete');
    }

    public function manageAdmins(User $user, League $league): bool
    {
        if ($user->hasPermissionTo('leagues.manage-admins')) {
            return $this->isLeagueAdmin($user, $league);
        }

        return false;
    }

    private function isLeagueAdmin(User $user, League $league): bool
    {
        // Check if user is the league owner
        if ($league->admin_id === $user->id) {
            return true;
        }

        // Check if user is a league admin
        return $league->admins()->where('user_id', $user->id)->exists();
    }
}
