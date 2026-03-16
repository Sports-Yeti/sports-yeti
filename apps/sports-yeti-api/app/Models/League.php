<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class League extends Model
{
    use HasFactory;
    use HasUuids;
    use LogsActivity;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'admin_id',
        'sport_type',
        'location',
        'timezone',
        'registration_fee',
        'is_active',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'registration_fee' => 'decimal:2',
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function admins(): HasMany
    {
        return $this->hasMany(LeagueAdmin::class);
    }

    public function players(): HasMany
    {
        return $this->hasMany(Player::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(Facility::class);
    }

    public function camps(): HasMany
    {
        return $this->hasMany(Camp::class);
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    public function waivers(): HasMany
    {
        return $this->hasMany(Waiver::class);
    }

    public function news(): HasMany
    {
        return $this->hasMany(LeagueNews::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }
}
