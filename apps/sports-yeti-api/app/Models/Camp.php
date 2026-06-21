<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\BelongsToLeague;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Camp extends Model
{
    use BelongsToLeague;
    use HasFactory;
    use HasUuids;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'league_id',
        'name',
        'description',
        'start_date',
        'end_date',
        'registration_fee',
        'max_participants',
        'skill_level',
        'age_group',
        'status',
        'image_url',
        'requirements',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'registration_fee' => 'decimal:2',
            'max_participants' => 'integer',
            'requirements' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CampSession::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(CampRegistration::class);
    }

    public function registeredPlayersCount(): int
    {
        return $this->registrations()->count();
    }

    public function hasAvailableSpots(): bool
    {
        return $this->registeredPlayersCount() < $this->max_participants;
    }
}
