<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameParticipant extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'game_id',
        'player_id',
        'team_id',
        'attendance_confirmed',
        'attendance_response',
        'qr_checkin_time',
        'stats',
    ];

    protected function casts(): array
    {
        return [
            'attendance_confirmed' => 'boolean',
            'qr_checkin_time' => 'datetime',
            'stats' => 'array',
        ];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
