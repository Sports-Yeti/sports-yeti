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
        // Register custom middleware aliases
        $middleware->alias([
            'rfc7807' => \App\Http\Middleware\RFC7807ErrorHandler::class,
            'tenancy' => \App\Http\Middleware\TenancyMiddleware::class,
            'audit' => \App\Http\Middleware\AuditLogMiddleware::class,
            'rate.limit' => \App\Http\Middleware\RateLimitMiddleware::class,
        ]);

        // Apply RFC7807 error handling to API routes
        $middleware->api(append: [
            \App\Http\Middleware\RFC7807ErrorHandler::class,
        ]);

        // Configure rate limiting tiers
        $middleware->throttleApi();
        
        // Add custom throttle configurations
        $middleware->throttleWithRedis();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Additional exception handling configuration
    })->create();
