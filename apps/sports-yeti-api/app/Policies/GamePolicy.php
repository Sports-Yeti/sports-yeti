<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Game;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class GamePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('games.view');
    }

    public function view(User $user, Game $game): bool
    {
        return $user->hasPermissionTo('games.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('games.create');
    }

    public function update(User $user, Game $game): bool
    {
        if (!$user->hasPermissionTo('games.update')) {
            return false;
        }

        return $this->isGameManager($user, $game);
    }

    public function delete(User $user, Game $game): bool
    {
        if (!$user->hasPermissionTo('games.delete')) {
            return false;
        }

        return $this->isGameManager($user, $game);
    }

    public function manageParticipants(User $user, Game $game): bool
    {
        if (!$user->hasPermissionTo('games.manage-participants')) {
            return false;
        }

        return $this->isGameManager($user, $game);
    }

    public function submitReport(User $user, Game $game): bool
    {
        if (!$user->hasPermissionTo('games.submit-report')) {
            return false;
        }

        // Check if user is a team captain for one of the teams in this game
        return $this->isTeamCaptainInGame($user, $game);
    }

    private function isGameManager(User $user, Game $game): bool
    {
        // Check if user is a team captain
        if ($this->isTeamCaptainInGame($user, $game)) {
            return true;
        }

        // Check if user is a league admin
        $league = $game->league;
        if ($league && ($league->admin_id === $user->id || $league->admins()->where('user_id', $user->id)->exists())) {
            return true;
        }

        return false;
    }

    private function isTeamCaptainInGame(User $user, Game $game): bool
    {
        $homeTeam = $game->homeTeam;
        $awayTeam = $game->awayTeam;

        if ($homeTeam && $homeTeam->captain_id === $user->id) {
            return true;
        }

        if ($awayTeam && $awayTeam->captain_id === $user->id) {
            return true;
        }

        return false;
    }
}
