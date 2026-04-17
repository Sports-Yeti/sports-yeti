<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'game_id',
        'team_id',
        'requested_by',
        'position',
        'message',
        'status',
        'filled_by',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function filler(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'filled_by');
    }
}
