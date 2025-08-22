<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'league_id',
        'name',
        'address',
        'contact_info',
        'operating_hours',
        'liability_info',
    ];

    protected function casts(): array
    {
        return [
            'contact_info' => 'array',
            'operating_hours' => 'array',
        ];
    }

    // Relationships
    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function spaces(): HasMany
    {
        return $this->hasMany(Space::class);
    }

    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'space_id');
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    // Helper methods
    public function isOpen(Carbon $dateTime): bool
    {
        $dayOfWeek = strtolower($dateTime->format('l'));
        $time = $dateTime->format('H:i');
        
        $hours = $this->operating_hours[$dayOfWeek] ?? null;
        
        if (!$hours || !isset($hours['open']) || !isset($hours['close'])) {
            return false;
        }
        
        return $time >= $hours['open'] && $time <= $hours['close'];
    }

    public function getAvailableSpaces(Carbon $startTime, Carbon $endTime): \Illuminate\Database\Eloquent\Collection
    {
        $bookedSpaceIds = $this->bookings()
            ->where('status', 'confirmed')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function ($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                      });
            })
            ->pluck('space_id');

        return $this->spaces()->whereNotIn('id', $bookedSpaceIds)->get();
    }
}
