<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Facility;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FacilityPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('facilities.view');
    }

    public function view(User $user, Facility $facility): bool
    {
        return $user->hasPermissionTo('facilities.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('facilities.view');
    }

    public function update(User $user, Facility $facility): bool
    {
        if ($this->isLeagueAdmin($user, $facility)) {
            return true;
        }

        return $user->hasPermissionTo('facilities.update');
    }

    public function delete(User $user, Facility $facility): bool
    {
        if ($this->isLeagueAdmin($user, $facility)) {
            return true;
        }

        return $user->hasPermissionTo('facilities.delete');
    }

    private function isLeagueAdmin(User $user, Facility $facility): bool
    {
        $league = $facility->league;
        if (! $league) {
            return false;
        }

        return $league->admin_id === $user->id;
    }
}
