<?php

declare(strict_types=1);

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Global scope that filters queries by league_id when in a tenant context.
 * 
 * This scope is automatically applied by the BelongsToLeague trait.
 * The league_id is set by the TenantScope middleware based on request context.
 */
class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     *
     * @param \Illuminate\Database\Eloquent\Builder $builder
     * @param \Illuminate\Database\Eloquent\Model $model
     * @return void
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Only apply if we're in a tenant context
        if (app()->bound('current_league_id')) {
            $leagueId = app('current_league_id');
            
            if ($leagueId !== null) {
                $builder->where($model->getTable() . '.league_id', $leagueId);
            }
        }
    }
}
