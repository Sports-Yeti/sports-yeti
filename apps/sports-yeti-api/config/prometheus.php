<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Prometheus Metrics Configuration
    |--------------------------------------------------------------------------
    |
    | Configure Prometheus metrics collection for the API.
    |
    */

    'enabled' => env('PROMETHEUS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Metrics Namespace
    |--------------------------------------------------------------------------
    |
    | The namespace prefix for all metrics (e.g., sports_yeti_api_http_requests_total)
    |
    */

    'namespace' => env('PROMETHEUS_NAMESPACE', 'sports_yeti_api'),

    /*
    |--------------------------------------------------------------------------
    | Storage Adapter
    |--------------------------------------------------------------------------
    |
    | Storage backend for metrics. Options:
    | - memory: In-memory (resets on restart, good for development)
    | - redis: Persistent storage using Redis (recommended for production)
    | - apc: APCu storage (if available)
    |
    */

    'storage' => env('PROMETHEUS_STORAGE', 'memory'),

    /*
    |--------------------------------------------------------------------------
    | Redis Configuration (when using redis storage)
    |--------------------------------------------------------------------------
    */

    'redis' => [
        'host' => env('PROMETHEUS_REDIS_HOST', env('REDIS_HOST', '127.0.0.1')),
        'port' => (int) env('PROMETHEUS_REDIS_PORT', env('REDIS_PORT', 6379)),
        'password' => env('PROMETHEUS_REDIS_PASSWORD', env('REDIS_PASSWORD', null)),
        'database' => (int) env('PROMETHEUS_REDIS_DATABASE', 1),
        'prefix' => env('PROMETHEUS_REDIS_PREFIX', 'prom:'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Labels
    |--------------------------------------------------------------------------
    |
    | Labels to attach to all metrics.
    |
    */

    'default_labels' => [
        'app' => 'sports-yeti-api',
        'environment' => env('APP_ENV', 'local'),
    ],

    /*
    |--------------------------------------------------------------------------
    | HTTP Metrics
    |--------------------------------------------------------------------------
    |
    | Configure HTTP request metrics collection.
    |
    */

    'http' => [
        'enabled' => true,
        'histogram_buckets' => [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        'excluded_paths' => [
            '/v1/health',
            '/metrics',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Metrics
    |--------------------------------------------------------------------------
    */

    'database' => [
        'enabled' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Metrics
    |--------------------------------------------------------------------------
    */

    'queue' => [
        'enabled' => true,
    ],

];
