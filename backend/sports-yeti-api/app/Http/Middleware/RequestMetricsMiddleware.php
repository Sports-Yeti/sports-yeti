<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class RequestMetricsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        /** @var Response $response */
        $response = $next($request);
        $durationMs = (int) ((microtime(true) - $start) * 1000);

        $traceId = $request->attributes->get('trace_id');
        Log::info('http_request', [
            'type' => 'red_metrics',
            'method' => $request->getMethod(),
            'path' => '/'.$request->path(),
            'status' => $response->getStatusCode(),
            'duration_ms' => $durationMs,
            'trace_id' => $traceId,
        ]);

        return $response;
    }
}


