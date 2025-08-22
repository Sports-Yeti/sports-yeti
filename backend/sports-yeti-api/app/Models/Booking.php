<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\BookingStatus;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'user_id',
        'start_time',
        'end_time',
        'status',
        'point_cost',
        'cash_cost',
        'qr_code',
        'idempotency_key',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'status' => BookingStatus::class,
            'point_cost' => 'integer',
            'cash_cost' => 'decimal:2',
        ];
    }

    // Relationships
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function equipment(): BelongsToMany
    {
        return $this->belongsToMany(Equipment::class, 'equipment_bookings')
                    ->withPivot(['quantity', 'point_cost', 'cash_cost'])
                    ->withTimestamps();
    }

    // Helper methods
    public function generateQRCode(): string
    {
        $this->qr_code = bin2hex(random_bytes(16));
        $this->save();
        return $this->qr_code;
    }

    public function getTotalCostAttribute(): float
    {
        $equipmentCost = $this->equipment->sum(function ($equipment) {
            return $equipment->pivot->cash_cost + ($equipment->pivot->point_cost * 0.01);
        });
        
        return $this->cash_cost + ($this->point_cost * 0.01) + $equipmentCost;
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [BookingStatus::PENDING, BookingStatus::CONFIRMED]);
    }

    public function scopeForSpace($query, $spaceId)
    {
        return $query->where('space_id', $spaceId);
    }

    public function scopeInTimeRange($query, $startTime, $endTime)
    {
        return $query->where(function ($q) use ($startTime, $endTime) {
            $q->whereBetween('start_time', [$startTime, $endTime])
              ->orWhereBetween('end_time', [$startTime, $endTime])
              ->orWhere(function ($query) use ($startTime, $endTime) {
                  $query->where('start_time', '<=', $startTime)
                        ->where('end_time', '>=', $endTime);
              });
        });
    }
}
