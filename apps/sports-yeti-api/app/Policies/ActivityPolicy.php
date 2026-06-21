<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Spatie\Activitylog\Models\Activity;

/**
 * Policy for accessing audit logs (activity logs).
 *
 * Only league admins and super admins can view audit logs.
 * Super admins can view all logs, while league admins can only
 * view logs for their league.
 */
class ActivityPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view the list of activities.
     */
    public function viewAny(User $user): bool
    {
        // Super admins can view all audit logs
        if ($user->hasRole('super-admin')) {
            return true;
        }

        // League admins can view audit logs for their league
        if ($user->hasRole('league-admin')) {
            return true;
        }

        // Check if user has explicit permission
        return $user->hasPermissionTo('audit.view');
    }

    /**
     * Determine if the user can view a specific activity.
     */
    public function view(User $user, Activity $activity): bool
    {
        // Super admins can view all activities
        if ($user->hasRole('super-admin')) {
            return true;
        }

        // League admins can view activities for their league
        if ($user->hasRole('league-admin')) {
            // If in tenant context, the activity should be scoped
            if (app()->bound('current_league_id')) {
                return $this->activityBelongsToLeague($activity, app('current_league_id'));
            }

            // If no tenant context, check if user is admin of any league
            // where this activity occurred
            return $this->userIsAdminOfActivityLeague($user, $activity);
        }

        // Check explicit permission
        return $user->hasPermissionTo('audit.view');
    }

    /**
     * Determine if the user can view audit statistics.
     */
    public function viewStats(User $user): bool
    {
        return $this->viewAny($user);
    }

    /**
     * Check if an activity belongs to a specific league.
     */
    protected function activityBelongsToLeague(Activity $activity, string $leagueId): bool
    {
        // Check if the activity's properties contain the league_id
        $properties = $activity->properties ?? collect();

        $attributesLeagueId = $properties->get('attributes.league_id')
            ?? data_get($properties->toArray(), 'attributes.league_id');

        $oldLeagueId = $properties->get('old.league_id')
            ?? data_get($properties->toArray(), 'old.league_id');

        if ($attributesLeagueId === $leagueId || $oldLeagueId === $leagueId) {
            return true;
        }

        // Check if the subject has a league_id
        if ($activity->subject && method_exists($activity->subject, 'getAttribute')) {
            $subjectLeagueId = $activity->subject->getAttribute('league_id');
            if ($subjectLeagueId === $leagueId) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a user is an admin of the league where an activity occurred.
     */
    protected function userIsAdminOfActivityLeague(User $user, Activity $activity): bool
    {
        // Get user's admin league IDs
        $adminLeagueIds = $user->leagueAdminRoles()->pluck('league_id')->toArray();

        if (empty($adminLeagueIds)) {
            return false;
        }

        // Check activity's league_id
        $properties = $activity->properties ?? collect();

        $attributesLeagueId = $properties->get('attributes.league_id')
            ?? data_get($properties->toArray(), 'attributes.league_id');

        if (in_array($attributesLeagueId, $adminLeagueIds)) {
            return true;
        }

        // Check subject's league_id
        if ($activity->subject && method_exists($activity->subject, 'getAttribute')) {
            $subjectLeagueId = $activity->subject->getAttribute('league_id');
            if (in_array($subjectLeagueId, $adminLeagueIds)) {
                return true;
            }
        }

        return false;
    }
}
