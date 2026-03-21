<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HighlightClip extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'highlight_id',
        'clip_path',
        'thumbnail_path',
        'title',
        'description',
        'start_time',
        'end_time',
        'excitement_score',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'float',
            'end_time' => 'float',
            'excitement_score' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function highlight(): BelongsTo
    {
        return $this->belongsTo(Highlight::class);
    }

    public function getDurationAttribute(): float
    {
        return $this->end_time - $this->start_time;
    }
}
