<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class TenancyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return $next($request);
        }

        // Get allowed league IDs for the user
        $allowedLeagueIds = $this->getAllowedLeagueIds($user);
        
        // Add league context to request for repository filtering
        $request->merge(['_allowed_league_ids' => $allowedLeagueIds]);
        
        // If request contains league_id, validate access
        if ($request->has('league_id') || $request->route('league')) {
            $requestedLeagueId = $request->input('league_id') ?? $request->route('league')?->id;
            
            if ($requestedLeagueId && !in_array($requestedLeagueId, $allowedLeagueIds)) {
                return response()->json([
                    'type' => 'https://tools.ietf.org/html/rfc7231#section-6.5.3',
                    'title' => 'Access Forbidden',
                    'status' => 403,
                    'detail' => 'You do not have access to this league.',
                    'instance' => $request->getUri(),
                    'trace_id' => $request->header('X-Trace-Id') ?? \Illuminate\Support\Str::uuid(),
                ], 403, [
                    'Content-Type' => 'application/problem+json'
                ]);
            }
        }

        return $next($request);
    }

    private function getAllowedLeagueIds($user): array
    {
        $leagueIds = [];
        
        // User's own league from player profile
        if ($user->player?->league_id) {
            $leagueIds[] = $user->player->league_id;
        }
        
        // Leagues where user is admin
        $adminLeagueIds = $user->administeredLeagues()->pluck('id')->toArray();
        $leagueIds = array_merge($leagueIds, $adminLeagueIds);
        
        // System admins can access all leagues
        if ($user->hasRole(\App\UserRole::SYSTEM_ADMIN)) {
            return ['*']; // Special marker for all leagues
        }
        
        return array_unique($leagueIds);
    }
}
