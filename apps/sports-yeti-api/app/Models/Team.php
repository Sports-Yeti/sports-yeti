<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToLeague;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Team extends Model
{
    use BelongsToLeague;
    use HasFactory;
    use HasUuids;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'league_id',
        'captain_id',
        'description',
        'logo_url',
        'status',
        'max_roster_size',
        'stats',
    ];

    protected function casts(): array
    {
        return [
            'max_roster_size' => 'integer',
            'stats' => 'array',
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

    public function captain(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'captain_id');
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'team_members')
            ->withPivot(['role', 'payment_status', 'waiver_signed', 'joined_at'])
            ->withTimestamps();
    }

    public function homeGames(): HasMany
    {
        return $this->hasMany(Game::class, 'team1_id');
    }

    public function awayGames(): HasMany
    {
        return $this->hasMany(Game::class, 'team2_id');
    }

    public function wonGames(): HasMany
    {
        return $this->hasMany(Game::class, 'winner_team_id');
    }

    public function chat(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
