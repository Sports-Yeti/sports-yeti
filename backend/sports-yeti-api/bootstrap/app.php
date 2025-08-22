<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Attach a Trace-Id to every request/response for correlation
        $middleware->append(App\Http\Middleware\TraceIdMiddleware::class);
        // Log RED metrics to stdout (JSON)
        $middleware->append(App\Http\Middleware\RequestMetricsMiddleware::class);
        // Enforce league scope when leagueId is present
        $middleware->append(App\Http\Middleware\MultiTenancyMiddleware::class);
        // Audit mutations
        $middleware->append(App\Http\Middleware\AuditLogMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Render RFC7807 problem+json for API requests
        $exceptions->render(function (Throwable $e, Illuminate\Http\Request $request) {
            $wantsJson = $request->expectsJson() || str_starts_with($request->path(), 'api/');
            if (! $wantsJson) {
                return null; // fall back to default
            }

            $status = $e instanceof Symfony\Component\HttpKernel\Exception\HttpExceptionInterface
                ? $e->getStatusCode()
                : 500;

            $title = $e instanceof Symfony\Component\HttpKernel\Exception\HttpExceptionInterface
                ? (Symfony\Component\HttpFoundation\Response::$statusTexts[$status] ?? 'Error')
                : 'Internal Server Error';

            $traceId = $request->headers->get('Trace-Id') ?? $request->attributes->get('trace_id');

            $problem = [
                'type' => 'about:blank',
                'title' => $title,
                'status' => $status,
                'detail' => config('app.debug') ? $e->getMessage() : null,
                'instance' => '/'.$request->path(),
                'trace_id' => $traceId,
            ];

            return response()->json(array_filter($problem, fn ($v) => $v !== null), $status, [
                'Content-Type' => 'application/problem+json',
            ]);
        });
    })->create();

