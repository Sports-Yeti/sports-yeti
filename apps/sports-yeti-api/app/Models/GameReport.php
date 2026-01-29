<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameReport extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'game_id',
        'captain_id',
        'report_type',
        'details',
        'absent_players',
        'equipment_damage',
        'equipment_damage_description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'absent_players' => 'array',
            'equipment_damage' => 'boolean',
        ];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function captain(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'captain_id');
    }
}
