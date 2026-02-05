<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Prometheus\CollectorRegistry;
use Prometheus\Storage\InMemory;
use Prometheus\Storage\Redis;

class PrometheusServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(CollectorRegistry::class, function () {
            return $this->createRegistry();
        });

        $this->app->alias(CollectorRegistry::class, 'prometheus');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register default metrics
        if (config('prometheus.enabled')) {
            $this->registerDefaultMetrics();
        }
    }

    /**
     * Create the collector registry with configured storage.
     */
    protected function createRegistry(): CollectorRegistry
    {
        $storage = config('prometheus.storage', 'memory');

        return match ($storage) {
            'redis' => new CollectorRegistry($this->createRedisAdapter()),
            default => new CollectorRegistry(new InMemory()),
        };
    }

    /**
     * Create Redis adapter for Prometheus.
     */
    protected function createRedisAdapter(): Redis
    {
        $config = config('prometheus.redis');

        Redis::setDefaultOptions([
            'host' => $config['host'],
            'port' => $config['port'],
            'password' => $config['password'],
            'database' => $config['database'],
        ]);

        return new Redis([
            'host' => $config['host'],
            'port' => $config['port'],
            'password' => $config['password'],
            'database' => $config['database'],
        ]);
    }

    /**
     * Register default application metrics.
     */
    protected function registerDefaultMetrics(): void
    {
        $registry = $this->app->make(CollectorRegistry::class);
        $namespace = config('prometheus.namespace');

        // Register app info gauge
        $appInfo = $registry->getOrRegisterGauge(
            $namespace,
            'app_info',
            'Application information',
            ['version', 'environment']
        );
        $appInfo->set(1, [config('app.version', '1.0.0'), config('app.env')]);
    }
}
