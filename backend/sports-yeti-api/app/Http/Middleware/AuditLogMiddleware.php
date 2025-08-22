<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);
        if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            Log::info('audit', [
                'actor' => optional($request->user())->id,
                'method' => $request->getMethod(),
                'path' => '/'.$request->path(),
                'status' => $response->getStatusCode(),
                'trace_id' => $request->attributes->get('trace_id'),
            ]);
        }
        return $response;
    }
}


