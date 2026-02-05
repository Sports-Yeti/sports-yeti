<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenTelemetry\API\Trace\SpanKind;
use OpenTelemetry\API\Trace\StatusCode;
use OpenTelemetry\API\Trace\TracerInterface;
use OpenTelemetry\Context\Context;
use OpenTelemetry\Context\Propagation\TextMapPropagatorInterface;
use OpenTelemetry\SemConv\TraceAttributes;
use Symfony\Component\HttpFoundation\Response;

class TraceRequest
{
    protected TracerInterface $tracer;
    protected TextMapPropagatorInterface $propagator;

    public function __construct(TracerInterface $tracer, TextMapPropagatorInterface $propagator)
    {
        $this->tracer = $tracer;
        $this->propagator = $propagator;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('opentelemetry.enabled')) {
            return $next($request);
        }

        // Extract context from incoming request headers (for distributed tracing)
        $context = $this->propagator->extract($request->headers->all());

        // Create span for this request
        $span = $this->tracer->spanBuilder($this->getSpanName($request))
            ->setParent($context)
            ->setSpanKind(SpanKind::KIND_SERVER)
            ->setAttribute(TraceAttributes::HTTP_REQUEST_METHOD, $request->getMethod())
            ->setAttribute(TraceAttributes::URL_FULL, $request->fullUrl())
            ->setAttribute(TraceAttributes::URL_PATH, $request->getPathInfo())
            ->setAttribute(TraceAttributes::URL_SCHEME, $request->getScheme())
            ->setAttribute(TraceAttributes::SERVER_ADDRESS, $request->getHost())
            ->setAttribute(TraceAttributes::SERVER_PORT, $request->getPort())
            ->setAttribute(TraceAttributes::CLIENT_ADDRESS, $request->ip())
            ->setAttribute(TraceAttributes::USER_AGENT_ORIGINAL, $request->userAgent() ?? '')
            ->startSpan();

        // Activate the span context
        $scope = $span->activate();

        // Store trace ID in request for logging correlation
        $traceId = $span->getContext()->getTraceId();
        $spanId = $span->getContext()->getSpanId();
        $request->attributes->set('trace_id', $traceId);
        $request->attributes->set('span_id', $spanId);

        // Add trace context to log context
        Log::shareContext([
            'trace_id' => $traceId,
            'span_id' => $spanId,
        ]);

        try {
            $response = $next($request);

            // Record response attributes
            $span->setAttribute(TraceAttributes::HTTP_RESPONSE_STATUS_CODE, $response->getStatusCode());

            // Set span status based on HTTP status code
            if ($response->getStatusCode() >= 400) {
                $span->setStatus(
                    $response->getStatusCode() >= 500 ? StatusCode::STATUS_ERROR : StatusCode::STATUS_UNSET,
                    'HTTP ' . $response->getStatusCode()
                );
            } else {
                $span->setStatus(StatusCode::STATUS_OK);
            }

            // Add trace ID to response headers for debugging
            $response->headers->set('X-Trace-Id', $traceId);

            return $response;
        } catch (\Throwable $e) {
            // Record exception
            $span->recordException($e);
            $span->setStatus(StatusCode::STATUS_ERROR, $e->getMessage());

            throw $e;
        } finally {
            $span->end();
            $scope->detach();
        }
    }

    /**
     * Get a descriptive span name.
     */
    protected function getSpanName(Request $request): string
    {
        $method = $request->getMethod();
        $route = $request->route();

        if ($route) {
            // Use route name or URI pattern
            $name = $route->getName() ?? $route->uri();
            return "{$method} {$name}";
        }

        return "{$method} {$request->getPathInfo()}";
    }
}
