<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'captain_id',
        'league_id',
        'division_id',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }

    // Relationships
    public function captain(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'captain_id');
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'team_members');
    }

    public function homeGames(): HasMany
    {
        return $this->hasMany(Game::class, 'team1_id');
    }

    public function awayGames(): HasMany
    {
        return $this->hasMany(Game::class, 'team2_id');
    }

    public function games()
    {
        return Game::where('team1_id', $this->id)
                   ->orWhere('team2_id', $this->id);
    }

    public function chat(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    // Helper methods
    public function isFull(): bool
    {
        return $this->players()->count() >= ($this->settings['max_players'] ?? 10);
    }

    public function canAddPlayer(): bool
    {
        return !$this->isFull();
    }
}
