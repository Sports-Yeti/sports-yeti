<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Booking;
use App\Models\Game;
use App\Models\League;
use App\Models\Payment;
use App\Models\Team;
use App\Policies\BookingPolicy;
use App\Policies\GamePolicy;
use App\Policies\LeaguePolicy;
use App\Policies\PaymentPolicy;
use App\Policies\TeamPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected array $policies = [
        League::class => LeaguePolicy::class,
        Team::class => TeamPolicy::class,
        Booking::class => BookingPolicy::class,
        Game::class => GamePolicy::class,
        Payment::class => PaymentPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
        $this->configureRateLimiting();

        // Super admin bypasses all permissions
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super-admin') ? true : null;
        });
    }

    /**
     * Register the application's policies.
     */
    protected function registerPolicies(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // General API rate limit - 60 requests per minute for unauthenticated
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // Authenticated API rate limit - 120 requests per minute
        RateLimiter::for('api-authenticated', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        // Strict rate limit for sensitive operations (auth, payments)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // Payment operations - stricter limit
        RateLimiter::for('payments', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        // Webhooks - higher limit for external services
        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(100)->by($request->ip());
        });
    }
}
