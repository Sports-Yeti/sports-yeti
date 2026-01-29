<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatPollVote extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'poll_id',
        'user_id',
        'option_index',
    ];

    protected function casts(): array
    {
        return [
            'option_index' => 'integer',
        ];
    }

    public function poll(): BelongsTo
    {
        return $this->belongsTo(ChatPoll::class, 'poll_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
