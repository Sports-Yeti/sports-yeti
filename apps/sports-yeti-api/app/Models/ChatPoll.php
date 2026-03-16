<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatPoll extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'chat_id',
        'message_id',
        'created_by',
        'question',
        'options',
        'poll_type',
        'is_anonymous',
        'allows_multiple',
        'expires_at',
        'is_closed',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_anonymous' => 'boolean',
            'allows_multiple' => 'boolean',
            'expires_at' => 'datetime',
            'is_closed' => 'boolean',
        ];
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'message_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ChatPollVote::class, 'poll_id');
    }

    public function getVoteCounts(): array
    {
        $counts = [];
        foreach ($this->options as $index => $option) {
            $counts[$index] = $this->votes()->where('option_index', $index)->count();
        }

        return $counts;
    }
}
