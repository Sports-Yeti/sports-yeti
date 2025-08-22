<?php

use Monolog\Formatter\JsonFormatter;
use Monolog\Handler\StreamHandler;

return [
    'default' => env('LOG_CHANNEL', 'stack'),

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['stdout'],
        ],

        'stdout' => [
            'driver' => 'monolog',
            'handler' => StreamHandler::class,
            'with' => [
                'stream' => 'php://stdout',
            ],
            'formatter' => JsonFormatter::class,
            'formatter_with' => [
                'batch_mode' => JsonFormatter::BATCH_MODE_NEWLINES,
                'append_newline' => true,
            ],
            'level' => env('LOG_LEVEL', 'debug'),
        ],
    ],
];


