<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | OpenTelemetry Configuration
    |--------------------------------------------------------------------------
    |
    | Configure distributed tracing with OpenTelemetry. Traces are sent to
    | an OTLP-compatible collector (Jaeger, Grafana Tempo, Honeycomb, etc.).
    |
    */

    'enabled' => env('OTEL_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Service Information
    |--------------------------------------------------------------------------
    */

    'service' => [
        'name' => env('OTEL_SERVICE_NAME', 'sports-yeti-api'),
        'version' => env('OTEL_SERVICE_VERSION', '1.0.0'),
        'environment' => env('OTEL_SERVICE_ENVIRONMENT', env('APP_ENV', 'local')),
    ],

    /*
    |--------------------------------------------------------------------------
    | OTLP Exporter Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the OTLP exporter endpoint. For local development with Jaeger:
    | - HTTP: http://localhost:4318/v1/traces
    | - gRPC: http://localhost:4317
    |
    | For Grafana Tempo: Use your Tempo endpoint
    | For Honeycomb: https://api.honeycomb.io:443
    | For New Relic: https://otlp.nr-data.net:4317
    |
    */

    'exporter' => [
        'endpoint' => env('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4318'),
        'protocol' => env('OTEL_EXPORTER_OTLP_PROTOCOL', 'http/protobuf'), // http/protobuf, http/json, or grpc
        'headers' => env('OTEL_EXPORTER_OTLP_HEADERS', ''), // Format: key1=value1,key2=value2
    ],

    /*
    |--------------------------------------------------------------------------
    | Sampling Configuration
    |--------------------------------------------------------------------------
    |
    | Control trace sampling rate. In production, you may want to sample
    | a percentage of requests to reduce overhead.
    |
    | Sampler types: always_on, always_off, traceidratio, parentbased_traceidratio
    |
    */

    'sampler' => [
        'type' => env('OTEL_TRACES_SAMPLER', 'always_on'),
        'ratio' => (float) env('OTEL_TRACES_SAMPLER_ARG', 1.0), // 0.0 to 1.0
    ],

    /*
    |--------------------------------------------------------------------------
    | Propagation
    |--------------------------------------------------------------------------
    |
    | Configure context propagation format for distributed tracing.
    | Supports: tracecontext (W3C), baggage, b3, b3multi, jaeger
    |
    */

    'propagators' => env('OTEL_PROPAGATORS', 'tracecontext,baggage'),

    /*
    |--------------------------------------------------------------------------
    | Resource Attributes
    |--------------------------------------------------------------------------
    |
    | Additional attributes to attach to all telemetry data.
    |
    */

    'resource_attributes' => [
        'deployment.environment' => env('OTEL_SERVICE_ENVIRONMENT', env('APP_ENV', 'local')),
        'host.name' => gethostname(),
    ],

    /*
    |--------------------------------------------------------------------------
    | Span Processors
    |--------------------------------------------------------------------------
    |
    | batch: Batches spans before sending (recommended for production)
    | simple: Sends spans immediately (useful for debugging)
    |
    */

    'span_processor' => env('OTEL_SPAN_PROCESSOR', 'batch'),

    /*
    |--------------------------------------------------------------------------
    | Batch Processor Settings
    |--------------------------------------------------------------------------
    */

    'batch' => [
        'max_queue_size' => (int) env('OTEL_BSP_MAX_QUEUE_SIZE', 2048),
        'schedule_delay' => (int) env('OTEL_BSP_SCHEDULE_DELAY', 5000), // milliseconds
        'max_export_batch_size' => (int) env('OTEL_BSP_MAX_EXPORT_BATCH_SIZE', 512),
    ],

];
