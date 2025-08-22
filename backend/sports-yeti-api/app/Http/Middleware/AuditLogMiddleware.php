<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only audit mutating operations and admin actions
        if ($this->shouldAudit($request, $response)) {
            $this->logAuditEvent($request, $response);
        }

        return $response;
    }

    private function shouldAudit(Request $request, Response $response): bool
    {
        // Audit successful mutating operations
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return false;
        }

        // Only audit successful operations (2xx responses)
        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return false;
        }

        // Check if it's an admin action or sensitive operation
        return $this->isAdminAction($request) || $this->isSensitiveOperation($request);
    }

    private function isAdminAction(Request $request): bool
    {
        $adminPaths = [
            '/api/v1/leagues',
            '/api/v1/divisions',
            '/api/v1/facilities',
            '/api/v1/teams',
            '/api/v1/payments',
        ];

        $path = $request->getPathInfo();
        
        foreach ($adminPaths as $adminPath) {
            if (Str::startsWith($path, $adminPath)) {
                return true;
            }
        }

        return false;
    }

    private function isSensitiveOperation(Request $request): bool
    {
        $sensitivePaths = [
            '/api/v1/auth',
            '/api/v1/payments',
            '/api/v1/bookings',
        ];

        $path = $request->getPathInfo();
        
        foreach ($sensitivePaths as $sensitivePath) {
            if (Str::startsWith($path, $sensitivePath)) {
                return true;
            }
        }

        return false;
    }

    private function logAuditEvent(Request $request, Response $response): void
    {
        $user = Auth::user();
        $traceId = $request->header('X-Trace-Id') ?? Str::uuid();
        
        // Extract resource information from route
        $route = $request->route();
        $resourceType = $this->extractResourceType($request);
        $resourceId = $route ? $route->parameter('id') : null;

        // Get league context
        $leagueId = $request->input('league_id') 
                   ?? $route?->parameter('league')?->id 
                   ?? $user?->player?->league_id;

        DB::table('audit_logs')->insert([
            'user_id' => $user?->id,
            'league_id' => $leagueId,
            'action' => $this->formatAction($request),
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'old_values' => null, // TODO: Implement for updates
            'new_values' => $this->getNewValues($request, $response),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'trace_id' => $traceId,
            'created_at' => now(),
        ]);
    }

    private function extractResourceType(Request $request): ?string
    {
        $path = $request->getPathInfo();
        
        if (preg_match('/\/api\/v1\/(\w+)/', $path, $matches)) {
            return $matches[1];
        }
        
        return null;
    }

    private function formatAction(Request $request): string
    {
        $method = $request->method();
        $resource = $this->extractResourceType($request);
        
        return strtolower($method) . '_' . ($resource ?? 'unknown');
    }

    private function getNewValues(Request $request, Response $response): ?array
    {
        // For creates, capture the request data
        if ($request->method() === 'POST') {
            return $request->except(['password', 'password_confirmation']);
        }
        
        // For updates, capture only the updated fields
        if (in_array($request->method(), ['PUT', 'PATCH'])) {
            return $request->except(['password', 'password_confirmation']);
        }
        
        return null;
    }
}
