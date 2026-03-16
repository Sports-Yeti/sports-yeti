<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\League;
use App\Models\LeagueAdmin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware that establishes the tenant (league) context for requests.
 *
 * The league context can be determined from:
 * 1. X-League-ID header (for explicit league selection)
 * 2. league_id query parameter
 * 3. Route parameter (e.g., /leagues/{league}/...)
 * 4. User's primary league (first admin role or first team membership)
 *
 * When a league context is established, all models using the BelongsToLeague
 * trait will automatically scope their queries to that league.
 */
class TenantScope
{
    /**
     * Handle an incoming request.
     *
     * @param  bool  $required  Whether a league context is required
     */
    public function handle(Request $request, Closure $next, bool $required = false): Response
    {
        $leagueId = $this->resolveLeagueId($request);

        if ($leagueId !== null) {
            // Validate UUID format first
            if (! preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $leagueId)) {
                return $this->leagueNotFoundResponse($leagueId);
            }

            // Validate that the league exists and user has access
            $league = League::find($leagueId);

            if (! $league) {
                return $this->leagueNotFoundResponse($leagueId);
            }

            // Verify user has access to this league
            if (! $this->userHasLeagueAccess($request->user(), $league)) {
                return $this->accessDeniedResponse($leagueId);
            }

            // Bind the league ID to the container for global scope access
            app()->instance('current_league_id', $leagueId);
            app()->instance('current_league', $league);
        } elseif ($required) {
            return $this->leagueRequiredResponse();
        }

        return $next($request);
    }

    /**
     * Resolve the league ID from the request.
     */
    protected function resolveLeagueId(Request $request): ?string
    {
        // Priority 1: X-League-ID header
        if ($request->hasHeader('X-League-ID')) {
            return $request->header('X-League-ID');
        }

        // Priority 2: Query parameter
        if ($request->has('league_id')) {
            return $request->query('league_id');
        }

        // Priority 3: Route parameter
        if ($request->route('league')) {
            $league = $request->route('league');

            return $league instanceof League ? $league->id : $league;
        }

        // Priority 4: User's primary league (auto-select)
        if ($user = $request->user()) {
            return $this->getUserPrimaryLeague($user);
        }

        return null;
    }

    /**
     * Get the user's primary league ID.
     */
    protected function getUserPrimaryLeague($user): ?string
    {
        // First, check if user is a league admin
        $adminRole = LeagueAdmin::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->first();

        if ($adminRole) {
            return $adminRole->league_id;
        }

        // Then check if user has a player profile with team memberships
        if ($user->player) {
            $teamMember = $user->player->teamMemberships()
                ->whereHas('team.league')
                ->orderBy('created_at', 'asc')
                ->with('team:id,league_id')
                ->first();

            if ($teamMember) {
                return $teamMember->team->league_id;
            }
        }

        return null;
    }

    /**
     * Check if the user has access to the given league.
     */
    protected function userHasLeagueAccess($user, League $league): bool
    {
        // Super admins have access to all leagues
        if ($user && $user->hasRole('super-admin')) {
            return true;
        }

        // Check if user is a league admin
        if ($user) {
            $isAdmin = LeagueAdmin::where('user_id', $user->id)
                ->where('league_id', $league->id)
                ->exists();

            if ($isAdmin) {
                return true;
            }

            // Check if user is a member of any team in the league
            if ($user->player) {
                $isMember = $user->player->teamMemberships()
                    ->whereHas('team', function ($query) use ($league) {
                        $query->where('league_id', $league->id);
                    })
                    ->exists();

                if ($isMember) {
                    return true;
                }
            }
        }

        // Public leagues are accessible to all authenticated users
        if ($league->is_active && ! ($league->settings['private'] ?? false)) {
            return true;
        }

        return false;
    }

    /**
     * Return a league not found response.
     */
    protected function leagueNotFoundResponse(string $leagueId): Response
    {
        return response()->json([
            'type' => 'https://httpstatuses.io/404',
            'title' => 'League Not Found',
            'status' => 404,
            'detail' => "The league with ID '{$leagueId}' does not exist.",
        ], 404, ['Content-Type' => 'application/problem+json']);
    }

    /**
     * Return an access denied response.
     */
    protected function accessDeniedResponse(string $leagueId): Response
    {
        return response()->json([
            'type' => 'https://httpstatuses.io/403',
            'title' => 'Access Denied',
            'status' => 403,
            'detail' => "You do not have access to league '{$leagueId}'.",
        ], 403, ['Content-Type' => 'application/problem+json']);
    }

    /**
     * Return a league required response.
     */
    protected function leagueRequiredResponse(): Response
    {
        return response()->json([
            'type' => 'https://httpstatuses.io/400',
            'title' => 'League Context Required',
            'status' => 400,
            'detail' => 'A league context is required for this request. Please provide X-League-ID header, league_id parameter, or ensure you are a member of at least one league.',
        ], 400, ['Content-Type' => 'application/problem+json']);
    }
}
