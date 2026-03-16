<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use OpenTelemetry\API\Globals;
use OpenTelemetry\API\Trace\TracerInterface;
use OpenTelemetry\API\Trace\TracerProviderInterface;
use OpenTelemetry\Context\Propagation\TextMapPropagatorInterface;
use OpenTelemetry\Contrib\Otlp\OtlpHttpTransportFactory;
use OpenTelemetry\Contrib\Otlp\SpanExporter;
use OpenTelemetry\SDK\Common\Attribute\Attributes;
use OpenTelemetry\SDK\Resource\ResourceInfo;
use OpenTelemetry\SDK\Resource\ResourceInfoFactory;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOffSampler;
use OpenTelemetry\SDK\Trace\Sampler\AlwaysOnSampler;
use OpenTelemetry\SDK\Trace\Sampler\ParentBased;
use OpenTelemetry\SDK\Trace\Sampler\TraceIdRatioBasedSampler;
use OpenTelemetry\SDK\Trace\SpanProcessor\BatchSpanProcessor;
use OpenTelemetry\SDK\Trace\SpanProcessor\SimpleSpanProcessor;
use OpenTelemetry\SDK\Trace\TracerProvider;
use OpenTelemetry\SemConv\ResourceAttributes;

class OpenTelemetryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(TracerProviderInterface::class, function () {
            return $this->createTracerProvider();
        });

        $this->app->singleton(TracerInterface::class, function ($app) {
            $config = config('opentelemetry');

            return $app->make(TracerProviderInterface::class)->getTracer(
                $config['service']['name'],
                $config['service']['version']
            );
        });

        $this->app->singleton(TextMapPropagatorInterface::class, function () {
            return Globals::propagator();
        });

        // Alias for easy resolution
        $this->app->alias(TracerInterface::class, 'otel.tracer');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        if (! config('opentelemetry.enabled')) {
            return;
        }

        // Register shutdown function to ensure spans are exported
        register_shutdown_function(function () {
            $tracerProvider = $this->app->make(TracerProviderInterface::class);
            if ($tracerProvider instanceof TracerProvider) {
                $tracerProvider->shutdown();
            }
        });
    }

    /**
     * Create the tracer provider.
     */
    protected function createTracerProvider(): TracerProviderInterface
    {
        $config = config('opentelemetry');

        if (! $config['enabled']) {
            // Return a no-op tracer provider when disabled
            return new TracerProvider;
        }

        // Build resource
        $resource = ResourceInfoFactory::defaultResource()->merge(
            ResourceInfo::create(Attributes::create([
                ResourceAttributes::SERVICE_NAME => $config['service']['name'],
                ResourceAttributes::SERVICE_VERSION => $config['service']['version'],
                ResourceAttributes::DEPLOYMENT_ENVIRONMENT_NAME => $config['service']['environment'],
                ...$config['resource_attributes'],
            ]))
        );

        // Create transport
        $endpoint = rtrim($config['exporter']['endpoint'], '/').'/v1/traces';
        $headers = $this->parseHeaders($config['exporter']['headers']);

        $transport = (new OtlpHttpTransportFactory)->create(
            $endpoint,
            'application/x-protobuf',
            $headers
        );

        // Create exporter
        $exporter = new SpanExporter($transport);

        // Create span processor
        $spanProcessor = $config['span_processor'] === 'simple'
            ? new SimpleSpanProcessor($exporter)
            : new BatchSpanProcessor(
                $exporter,
                null,
                null,
                $config['batch']['max_queue_size'],
                $config['batch']['schedule_delay'],
                $config['batch']['max_export_batch_size']
            );

        // Create sampler
        $sampler = $this->createSampler($config['sampler']);

        return TracerProvider::builder()
            ->setResource($resource)
            ->addSpanProcessor($spanProcessor)
            ->setSampler($sampler)
            ->build();
    }

    /**
     * Create a sampler based on configuration.
     */
    protected function createSampler(array $samplerConfig): \OpenTelemetry\SDK\Trace\SamplerInterface
    {
        return match ($samplerConfig['type']) {
            'always_off' => new AlwaysOffSampler,
            'traceidratio' => new TraceIdRatioBasedSampler($samplerConfig['ratio']),
            'parentbased_traceidratio' => new ParentBased(
                new TraceIdRatioBasedSampler($samplerConfig['ratio'])
            ),
            default => new AlwaysOnSampler,
        };
    }

    /**
     * Parse headers string into array.
     */
    protected function parseHeaders(string $headers): array
    {
        if (empty($headers)) {
            return [];
        }

        $result = [];
        foreach (explode(',', $headers) as $header) {
            $parts = explode('=', $header, 2);
            if (count($parts) === 2) {
                $result[trim($parts[0])] = trim($parts[1]);
            }
        }

        return $result;
    }
}
