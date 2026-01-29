<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Space extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $fillable = [
        'facility_id',
        'name',
        'description',
        'sport_type',
        'capacity',
        'hourly_rate',
        'surface_type',
        'is_indoor',
        'is_active',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'hourly_rate' => 'decimal:2',
            'is_indoor' => 'boolean',
            'is_active' => 'boolean',
            'features' => 'array',
        ];
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    public function campSessions(): HasMany
    {
        return $this->hasMany(CampSession::class);
    }
}
