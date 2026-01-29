<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Player extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'user_id',
        'league_id',
        'bio',
        'experience_level',
        'availability_status',
        'is_private',
        'position',
        'height_inches',
        'weight_lbs',
        'date_of_birth',
        'stats',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
            'height_inches' => 'integer',
            'weight_lbs' => 'integer',
            'date_of_birth' => 'date',
            'stats' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }

    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members')
            ->withPivot(['role', 'payment_status', 'waiver_signed', 'joined_at'])
            ->withTimestamps();
    }

    public function captainedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'captain_id');
    }

    public function campRegistrations(): HasMany
    {
        return $this->hasMany(CampRegistration::class);
    }

    public function gameParticipations(): HasMany
    {
        return $this->hasMany(GameParticipant::class);
    }

    public function gameReports(): HasMany
    {
        return $this->hasMany(GameReport::class, 'captain_id');
    }
}
