<?php

return [
    'price' => env('HIGHLIGHT_PRICE', 1.99),
    'currency' => env('HIGHLIGHT_CURRENCY', 'usd'),
    'max_video_size_mb' => env('HIGHLIGHT_MAX_VIDEO_MB', 200),
    'max_video_duration_seconds' => env('HIGHLIGHT_MAX_DURATION', 3600),
    'max_clips_per_highlight' => env('HIGHLIGHT_MAX_CLIPS', 15),
    'storage_disk' => env('HIGHLIGHT_STORAGE_DISK', 'public'),
];
