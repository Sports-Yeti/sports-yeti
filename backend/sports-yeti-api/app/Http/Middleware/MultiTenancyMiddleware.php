<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MultiTenancyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $pathLeagueId = $request->route('leagueId');
        $headerLeagueId = $request->headers->get('X-League-Id');

        if ($pathLeagueId !== null) {
            if ($headerLeagueId === null || (string) $pathLeagueId !== (string) $headerLeagueId) {
                return response()->json([
                    'type' => 'about:blank',
                    'title' => 'Forbidden',
                    'status' => 403,
                    'detail' => 'League scope mismatch',
                    'instance' => '/'.$request->path(),
                    'trace_id' => $request->attributes->get('trace_id'),
                ], 403, ['Content-Type' => 'application/problem+json']);
            }
            $request->attributes->set('league_id', (int) $pathLeagueId);
        }

        return $next($request);
    }
}


