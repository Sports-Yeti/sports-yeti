<?php

namespace App\Logging;

use Monolog\Formatter\FormatterInterface;
use Monolog\LogRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class JsonFormatter implements FormatterInterface
{
    public function format(LogRecord $record): string
    {
        $user = Auth::user();
        $request = Request::instance();
        
        $data = [
            'timestamp' => $record->datetime->format('Y-m-d\TH:i:s.u\Z'),
            'level' => $record->level->name,
            'message' => $record->message,
            'context' => $record->context,
            'extra' => $record->extra,
            'service' => 'sports-yeti-api',
            'version' => '1.0.0',
            'environment' => config('app.env'),
            'trace_id' => $request->header('X-Trace-Id') ?? $record->context['trace_id'] ?? null,
            'user_id' => $user ? hash('sha256', $user->id) : null, // Hashed for privacy
            'league_id' => $user?->player?->league_id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'method' => $request->method(),
            'uri' => $request->getRequestUri(),
        ];

        // Remove null values to keep logs clean
        $data = array_filter($data, fn($value) => $value !== null);

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
}