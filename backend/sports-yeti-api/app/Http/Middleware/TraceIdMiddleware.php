<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TraceIdMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $incomingTraceId = $request->headers->get('Trace-Id');
        $traceId = is_string($incomingTraceId) && $incomingTraceId !== ''
            ? $incomingTraceId
            : bin2hex(random_bytes(16));

        $request->attributes->set('trace_id', $traceId);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set('Trace-Id', $traceId);
        return $response;
    }
}


