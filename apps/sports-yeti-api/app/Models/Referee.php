<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Referee extends Model
{
    use HasFactory;
    use HasUuids;
    use LogsActivity;

    protected $fillable = [
        'user_id',
        'league_id',
        'sport_types',
        'experience_level',
        'certification',
        'hourly_rate',
        'rating',
        'total_games',
        'is_available',
        'bio',
    ];

    protected function casts(): array
    {
        return [
            'sport_types' => 'array',
            'hourly_rate' => 'decimal:2',
            'rating' => 'decimal:2',
            'total_games' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(RefereeAssignment::class);
    }

    public function games(): HasManyThrough
    {
        return $this->hasManyThrough(Game::class, RefereeAssignment::class, 'referee_id', 'id', 'id', 'game_id');
    }
}
