<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'league_id',
        'bio',
        'experience_level',
        'availability_status',
        'is_private',
        'sport_preferences',
        'point_balance',
    ];

    protected function casts(): array
    {
        return [
            'sport_preferences' => 'array',
            'is_private' => 'boolean',
            'point_balance' => 'integer',
        ];
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members');
    }

    public function captainedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'captain_id');
    }

    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'game_participants');
    }

    public function camps(): BelongsToMany
    {
        return $this->belongsToMany(Camp::class, 'camp_registrations');
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(Point::class, 'user_id', 'user_id');
    }

    // Helper methods
    public function isCaptain(): bool
    {
        return $this->captainedTeams()->exists();
    }

    public function isLeagueAdmin(): bool
    {
        return $this->league && $this->league->admin_id === $this->user_id;
    }

    public function scopePublic($query)
    {
        return $query->where('is_private', false);
    }

    public function scopeAvailable($query)
    {
        return $query->where('availability_status', 'available');
    }

    public function scopeInLeague($query, $leagueId)
    {
        return $query->where('league_id', $leagueId);
    }
}
