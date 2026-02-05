<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->throttleApi();

        // Add observability middleware to all API routes
        $middleware->api(prepend: [
            \App\Http\Middleware\TraceRequest::class,
            \App\Http\Middleware\PrometheusMetrics::class,
        ]);
        
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'tenant' => \App\Http\Middleware\TenantScope::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // RFC7807 Problem+JSON error responses
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'type' => 'https://httpstatuses.com/' . $e->getStatusCode(),
                    'title' => $e->getMessage() ?: 'An error occurred',
                    'status' => $e->getStatusCode(),
                    'detail' => $e->getMessage(),
                    'instance' => $request->getRequestUri(),
                ], $e->getStatusCode(), ['Content-Type' => 'application/problem+json']);
            }
        });
    })->create();
