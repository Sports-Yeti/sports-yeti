<?php

declare(strict_types=1);

namespace App\Logging;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;
use OpenTelemetry\API\Trace\Span;
use OpenTelemetry\Context\Context;

/**
 * Monolog processor that adds OpenTelemetry trace context to log records.
 */
class TraceContextProcessor implements ProcessorInterface
{
    /**
     * Process a log record and add trace context.
     */
    public function __invoke(LogRecord $record): LogRecord
    {
        $span = Span::fromContext(Context::getCurrent());
        $spanContext = $span->getContext();

        if ($spanContext->isValid()) {
            $extra = $record->extra;
            $extra['trace_id'] = $spanContext->getTraceId();
            $extra['span_id'] = $spanContext->getSpanId();
            $extra['trace_flags'] = $spanContext->getTraceFlags();

            return $record->with(extra: $extra);
        }

        return $record;
    }
}
