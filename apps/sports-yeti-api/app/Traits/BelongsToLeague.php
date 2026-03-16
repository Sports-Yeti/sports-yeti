<?php

declare(strict_types=1);

namespace App\Traits;

use App\Scopes\TenantScope;

/**
 * Trait for models that belong to a league and require tenant scoping.
 *
 * This trait automatically applies a global scope to filter queries
 * by league_id when the user is in a tenant context.
 *
 * Requirements:
 * - Model must have a 'league_id' column
 * - Model should define its own league() relationship
 */
trait BelongsToLeague
{
    /**
     * Boot the trait and apply the tenant scope.
     */
    public static function bootBelongsToLeague(): void
    {
        static::addGlobalScope(new TenantScope);

        // Automatically set league_id when creating if in tenant context
        static::creating(function ($model) {
            if (! $model->league_id && app()->bound('current_league_id')) {
                $model->league_id = app('current_league_id');
            }
        });
    }

    /**
     * Scope a query to a specific league.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForLeague($query, string $leagueId)
    {
        return $query->where($this->getTable().'.league_id', $leagueId);
    }

    /**
     * Scope a query to exclude the global tenant scope.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithoutTenantScope($query)
    {
        return $query->withoutGlobalScope(TenantScope::class);
    }
}
