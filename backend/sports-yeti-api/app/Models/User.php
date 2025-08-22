<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\UserRole;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email', 
        'password',
        'avatar',
        'phone',
        'language_preference',
        'timezone',
        'email_verified_at',
        'phone_verified_at',
        'settings',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'settings' => 'array',
        ];
    }

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'roles' => $this->roles,
            'permissions' => $this->permissions,
            'league_id' => $this->player?->league_id,
        ];
    }

    // Relationships
    public function player(): HasOne
    {
        return $this->hasOne(Player::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members', 'player_id', 'team_id')
                    ->through(Player::class);
    }

    public function leagues(): BelongsToMany
    {
        return $this->belongsToMany(League::class, 'players', 'user_id', 'league_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    // Role and Permission Methods
    public function hasRole(UserRole $role): bool
    {
        return in_array($role->value, $this->roles ?? []);
    }

    public function hasPermission(Permission $permission): bool
    {
        foreach ($this->roles ?? [] as $roleValue) {
            $role = UserRole::from($roleValue);
            if (in_array($permission, $role->permissions())) {
                return true;
            }
        }
        return false;
    }

    public function getRolesAttribute(): array
    {
        $roles = [UserRole::PLAYER->value];
        
        if ($this->player?->teams()->where('captain_id', $this->player->id)->exists()) {
            $roles[] = UserRole::CAPTAIN->value;
        }
        
        if ($this->administeredLeagues()->exists()) {
            $roles[] = UserRole::LEAGUE_ADMIN->value;
        }
        
        return $roles;
    }

    public function getPermissionsAttribute(): array
    {
        $permissions = [];
        foreach ($this->roles as $roleValue) {
            $role = UserRole::from($roleValue);
            $permissions = array_merge($permissions, array_map(
                fn($permission) => $permission->value, 
                $role->permissions()
            ));
        }
        return array_unique($permissions);
    }

    public function administeredLeagues(): HasMany
    {
        return $this->hasMany(League::class, 'admin_id');
    }
}
