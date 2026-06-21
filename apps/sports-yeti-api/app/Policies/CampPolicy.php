<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Camp;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CampPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('camps.view');
    }

    public function view(User $user, Camp $camp): bool
    {
        return $user->hasPermissionTo('camps.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('camps.view');
    }

    public function update(User $user, Camp $camp): bool
    {
        if ($this->isLeagueAdmin($user, $camp)) {
            return true;
        }

        return $user->hasPermissionTo('camps.update');
    }

    public function delete(User $user, Camp $camp): bool
    {
        if ($this->isLeagueAdmin($user, $camp)) {
            return true;
        }

        return $user->hasPermissionTo('camps.delete');
    }

    private function isLeagueAdmin(User $user, Camp $camp): bool
    {
        $league = $camp->league;
        if (! $league) {
            return false;
        }

        return $league->admin_id === $user->id;
    }
}
