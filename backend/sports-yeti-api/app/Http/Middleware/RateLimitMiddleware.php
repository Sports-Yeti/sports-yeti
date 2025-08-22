<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $tier = 'default'): Response
    {
        $limits = $this->getLimitsForTier($tier);
        
        // Check IP-based rate limit
        $ipKey = 'rate_limit:ip:' . $request->ip();
        if ($this->isRateLimited($ipKey, $limits['ip'])) {
            return $this->rateLimitResponse($ipKey, $limits['ip'], $request);
        }
        
        // Check user-based rate limit if authenticated
        if (Auth::check()) {
            $userKey = 'rate_limit:user:' . Auth::id();
            if ($this->isRateLimited($userKey, $limits['user'])) {
                return $this->rateLimitResponse($userKey, $limits['user'], $request);
            }
            
            $this->incrementCounter($userKey, $limits['user']['window']);
        }
        
        $this->incrementCounter($ipKey, $limits['ip']['window']);
        
        return $next($request);
    }

    private function getLimitsForTier(string $tier): array
    {
        return match($tier) {
            'auth' => [
                'ip' => ['requests' => 10, 'window' => 60],
                'user' => ['requests' => 5, 'window' => 60],
            ],
            'payments' => [
                'ip' => ['requests' => 20, 'window' => 60],
                'user' => ['requests' => 10, 'window' => 60],
            ],
            'chat' => [
                'ip' => ['requests' => 200, 'window' => 60],
                'user' => ['requests' => 100, 'window' => 60],
            ],
            default => [
                'ip' => ['requests' => 100, 'window' => 60],
                'user' => ['requests' => 200, 'window' => 60],
            ],
        };
    }

    private function isRateLimited(string $key, array $limit): bool
    {
        $current = Cache::get($key, 0);
        return $current >= $limit['requests'];
    }

    private function incrementCounter(string $key, int $window): void
    {
        $current = Cache::get($key, 0);
        Cache::put($key, $current + 1, $window);
    }

    private function rateLimitResponse(string $key, array $limit, Request $request): Response
    {
        $traceId = $request->header('X-Trace-Id') ?? Str::uuid();
        $retryAfter = Cache::get($key . ':reset', $limit['window']);
        
        return response()->json([
            'type' => 'https://tools.ietf.org/html/rfc6585#section-4',
            'title' => 'Too Many Requests',
            'status' => 429,
            'detail' => "Rate limit exceeded. Try again in {$retryAfter} seconds.",
            'instance' => $request->getUri(),
            'trace_id' => $traceId,
            'retry_after' => $retryAfter,
        ], 429, [
            'Content-Type' => 'application/problem+json',
            'Retry-After' => $retryAfter,
            'X-Trace-Id' => $traceId,
        ]);
    }
}
