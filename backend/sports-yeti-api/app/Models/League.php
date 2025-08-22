<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'admin_id',
        'sport_type',
        'location',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }

    // Relationships
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(Facility::class);
    }

    public function divisions(): HasMany
    {
        return $this->hasMany(Division::class);
    }

    public function camps(): HasMany
    {
        return $this->hasMany(Camp::class);
    }

    // Statistics methods
    public function getStatsAttribute(): array
    {
        return [
            'total_teams' => $this->teams()->count(),
            'total_players' => $this->players()->count(),
            'total_games' => $this->games()->count(),
            'total_camps' => $this->camps()->count(),
        ];
    }
}
