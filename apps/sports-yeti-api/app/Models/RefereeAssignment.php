<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefereeAssignment extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'referee_id',
        'game_id',
        'status',
        'assigned_rate',
        'is_bidding',
        'bid_amount',
        'admin_approved',
        'report',
        'rating_given',
    ];

    protected function casts(): array
    {
        return [
            'assigned_rate' => 'decimal:2',
            'is_bidding' => 'boolean',
            'bid_amount' => 'decimal:2',
            'admin_approved' => 'boolean',
            'rating_given' => 'decimal:2',
        ];
    }

    public function referee(): BelongsTo
    {
        return $this->belongsTo(Referee::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
