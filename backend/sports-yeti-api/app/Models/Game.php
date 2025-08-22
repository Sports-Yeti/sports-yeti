<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\GameStatus;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'team1_id',
        'team2_id',
        'facility_id',
        'space_id',
        'referee_id',
        'league_id',
        'division_id',
        'scheduled_at',
        'status',
        'game_type',
        'point_wager',
        'qr_code',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'point_wager' => 'integer',
            'status' => GameStatus::class,
        ];
    }

    // Relationships
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

    public function referee(): BelongsTo
    {
        return $this->belongsTo(Referee::class);
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(Player::class, 'game_participants');
    }

    public function chat(): HasOne
    {
        return $this->hasOne(Chat::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(GameReport::class);
    }

    // Helper methods
    public function generateQRCode(): string
    {
        $this->qr_code = bin2hex(random_bytes(16));
        $this->save();
        return $this->qr_code;
    }

    public function isUpcoming(): bool
    {
        return $this->scheduled_at > now() && $this->status === GameStatus::SCHEDULED;
    }

    public function hasConflictWith(Game $otherGame): bool
    {
        if ($this->facility_id !== $otherGame->facility_id || 
            $this->space_id !== $otherGame->space_id) {
            return false;
        }

        return $this->scheduled_at->between(
            $otherGame->scheduled_at->subHour(),
            $otherGame->scheduled_at->addHour()
        );
    }
}
