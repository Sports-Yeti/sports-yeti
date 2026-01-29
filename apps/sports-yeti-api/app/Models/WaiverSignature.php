<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaiverSignature extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'waiver_id',
        'user_id',
        'signed_at',
        'ip_address',
        'user_agent',
        'signature_hash',
    ];

    protected function casts(): array
    {
        return [
            'signed_at' => 'datetime',
        ];
    }

    public function waiver(): BelongsTo
    {
        return $this->belongsTo(Waiver::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
