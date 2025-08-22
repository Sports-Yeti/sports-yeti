<?php

namespace App\Logging;

use Monolog\Formatter\FormatterInterface;
use Monolog\LogRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class DatadogFormatter implements FormatterInterface
{
    public function format(LogRecord $record): string
    {
        $user = Auth::user();
        $request = Request::instance();
        
        $data = [
            '@timestamp' => $record->datetime->toISOString(),
            'level' => strtolower($record->level->name),
            'message' => $record->message,
            'logger' => [
                'name' => 'sports-yeti-api',
                'version' => '1.0.0',
            ],
            'service' => 'sports-yeti-api',
            'env' => config('app.env'),
            'dd' => [
                'service' => 'sports-yeti-api',
                'version' => '1.0.0',
                'env' => config('app.env'),
                'trace_id' => $request->header('X-Trace-Id') ?? $record->context['trace_id'] ?? null,
                'span_id' => $record->context['span_id'] ?? null,
            ],
            'http' => [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'status_code' => $record->context['status_code'] ?? null,
                'user_agent' => $request->userAgent(),
                'client_ip' => $request->ip(),
            ],
            'user' => [
                'id' => $user ? hash('sha256', $user->id) : null,
                'league_id' => $user?->player?->league_id,
            ],
            'context' => $record->context,
            'extra' => $record->extra,
        ];

        // Add custom tags for Datadog
        $data['ddtags'] = implode(',', [
            'service:sports-yeti-api',
            'env:' . config('app.env'),
            'version:1.0.0',
            'league_id:' . ($user?->player?->league_id ?? 'none'),
        ]);

        // Remove null values
        $data = $this->removeNullValues($data);

        return json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
    }

    public function formatBatch(array $records): string
    {
        $formatted = '';
        foreach ($records as $record) {
            $formatted .= $this->format($record);
        }
        return $formatted;
    }

    private function removeNullValues(array $data): array
    {
        return array_filter($data, function ($value) {
            if (is_array($value)) {
                return !empty($this->removeNullValues($value));
            }
            return $value !== null && $value !== '';
        });
    }
}