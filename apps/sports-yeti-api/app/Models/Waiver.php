<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Waiver extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'league_id',
        'title',
        'content',
        'document_url',
        'is_required',
        'is_active',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(WaiverSignature::class);
    }
}
