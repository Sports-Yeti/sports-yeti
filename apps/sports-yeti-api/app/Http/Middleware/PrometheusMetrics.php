<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Prometheus\CollectorRegistry;
use Symfony\Component\HttpFoundation\Response;

class PrometheusMetrics
{
    protected CollectorRegistry $registry;

    protected string $namespace;

    public function __construct(CollectorRegistry $registry)
    {
        $this->registry = $registry;
        $this->namespace = config('prometheus.namespace', 'sports_yeti_api');
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('prometheus.enabled') || ! config('prometheus.http.enabled')) {
            return $next($request);
        }

        // Check if path should be excluded
        $excludedPaths = config('prometheus.http.excluded_paths', []);
        if (in_array($request->getPathInfo(), $excludedPaths)) {
            return $next($request);
        }

        $startTime = microtime(true);

        $response = $next($request);

        $this->recordMetrics($request, $response, $startTime);

        return $response;
    }

    /**
     * Record HTTP metrics.
     */
    protected function recordMetrics(Request $request, Response $response, float $startTime): void
    {
        $duration = microtime(true) - $startTime;
        $method = $request->getMethod();
        $route = $this->getRouteName($request);
        $status = (string) $response->getStatusCode();
        $statusClass = substr($status, 0, 1).'xx';

        // Request counter
        $counter = $this->registry->getOrRegisterCounter(
            $this->namespace,
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'route', 'status', 'status_class']
        );
        $counter->inc([$method, $route, $status, $statusClass]);

        // Request duration histogram
        $histogram = $this->registry->getOrRegisterHistogram(
            $this->namespace,
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'route', 'status'],
            config('prometheus.http.histogram_buckets', [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10])
        );
        $histogram->observe($duration, [$method, $route, $status]);

        // Request size (if available)
        $requestSize = $request->header('Content-Length');
        if ($requestSize) {
            $requestSizeHistogram = $this->registry->getOrRegisterHistogram(
                $this->namespace,
                'http_request_size_bytes',
                'HTTP request size in bytes',
                ['method', 'route'],
                [100, 1000, 10000, 100000, 1000000]
            );
            $requestSizeHistogram->observe((float) $requestSize, [$method, $route]);
        }

        // Response size
        $responseSize = strlen($response->getContent() ?: '');
        if ($responseSize > 0) {
            $responseSizeHistogram = $this->registry->getOrRegisterHistogram(
                $this->namespace,
                'http_response_size_bytes',
                'HTTP response size in bytes',
                ['method', 'route'],
                [100, 1000, 10000, 100000, 1000000]
            );
            $responseSizeHistogram->observe($responseSize, [$method, $route]);
        }

        // Track in-flight requests (gauge)
        // Note: This is approximated since PHP doesn't maintain state between requests
    }

    /**
     * Get a normalized route name for metrics.
     */
    protected function getRouteName(Request $request): string
    {
        $route = $request->route();

        if ($route) {
            // Use route name if available
            if ($name = $route->getName()) {
                return $name;
            }

            // Use route URI pattern (replaces dynamic segments)
            $uri = $route->uri();

            // Normalize route parameters to placeholders
            return preg_replace('/\{[^}]+\}/', '{id}', $uri) ?? $uri;
        }

        // Fallback to path
        return $request->getPathInfo();
    }
}
