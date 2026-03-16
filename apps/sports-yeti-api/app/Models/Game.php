<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToLeague;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Game extends Model
{
    use BelongsToLeague;
    use HasFactory;
    use HasUuids;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'league_id',
        'team1_id',
        'team2_id',
        'facility_id',
        'space_id',
        'scheduled_at',
        'status',
        'team1_score',
        'team2_score',
        'winner_team_id',
        'game_type',
        'season_number',
        'week_number',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'team1_score' => 'integer',
            'team2_score' => 'integer',
            'season_number' => 'integer',
            'week_number' => 'integer',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function team1(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team1_id');
    }

    public function team2(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team2_id');
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_team_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(GameParticipant::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(GameReport::class);
    }

    public function chat(): HasOne
    {
        return $this->hasOne(Chat::class);
    }
}
