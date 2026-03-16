# Runbook: Queue Worker Issues

## Alert Trigger

- Queue size exceeds threshold (e.g., > 1000 pending jobs)
- Failed job count exceeds threshold
- Reconciliation or notification jobs not completing
- Queue worker process not running

## Severity

**P2** — Queue issues affect background processing (reconciliation, notifications)
**P1** — If payment reconciliation or critical notifications are affected

## Diagnosis Steps

### 1. Check Queue Worker Status

```bash
# Check if queue workers are running
ps aux | grep "queue:work"

# Check Supervisor status (if using Supervisor)
sudo supervisorctl status

# Check systemd status (if using systemd)
sudo systemctl status laravel-worker
```

### 2. Check Queue Size

```bash
# Check pending jobs count
php artisan tinker --execute="
    echo 'Pending jobs: ' . DB::table('jobs')->count();
    echo 'Failed jobs: ' . DB::table('failed_jobs')->count();
"

# Check queue sizes by queue name
php artisan tinker --execute="
    DB::table('jobs')
        ->select('queue', DB::raw('count(*) as count'))
        ->groupBy('queue')
        ->get()
        ->each(fn(\$q) => echo \$q->queue . ': ' . \$q->count . PHP_EOL);
"
```

### 3. Check Failed Jobs

```bash
# List recent failed jobs
php artisan queue:failed --limit=20

# Check failure reasons
php artisan tinker --execute="
    DB::table('failed_jobs')
        ->orderBy('failed_at', 'desc')
        ->limit(5)
        ->get(['id', 'queue', 'failed_at', 'exception'])
        ->each(fn(\$j) => echo \$j->id . ' | ' . \$j->queue . ' | ' . substr(\$j->exception, 0, 200) . PHP_EOL);
"
```

### 4. Check Redis (if using Redis driver)

```bash
# Check Redis connectivity
redis-cli ping

# Check Redis memory usage
redis-cli info memory

# Check Redis queue length
redis-cli llen queues:default
redis-cli llen queues:payments
redis-cli llen queues:notifications
```

## Resolution Actions

### Restart Queue Workers

```bash
# Graceful restart (finish current job, then restart)
php artisan queue:restart

# If using Supervisor
sudo supervisorctl restart laravel-worker:*

# If using systemd
sudo systemctl restart laravel-worker
```

### Process Stuck Jobs

```bash
# Clear all pending jobs (CAUTION — jobs will be lost)
# php artisan queue:clear

# Retry all failed jobs
php artisan queue:retry all

# Retry specific failed job
php artisan queue:retry <job-id>

# Delete old failed jobs
php artisan queue:flush
```

### If Redis Memory Full

```bash
# Check Redis maxmemory
redis-cli config get maxmemory

# Clear expired keys
redis-cli --scan --pattern "laravel:queue:*" | head -20

# If necessary, increase maxmemory
redis-cli config set maxmemory 512mb
```

### If Queue Table Lock (Database Driver)

```bash
# Check for table locks
psql -c "
    SELECT blocked_locks.pid AS blocked_pid,
           blocking_locks.pid AS blocking_pid,
           blocked_activity.query AS blocked_query
    FROM pg_catalog.pg_locks blocked_locks
    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
    JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    WHERE NOT blocked_locks.granted;
"

# Kill blocking queries if necessary
psql -c "SELECT pg_terminate_backend(<blocking_pid>);"
```

### Manual Job Execution

```bash
# Run reconciliation job manually
php artisan tinker --execute="
    dispatch(new \App\Jobs\ReconcilePaymentsJob());
"

# Process single job from queue
php artisan queue:work --once

# Process jobs with verbose output for debugging
php artisan queue:work --verbose --tries=1
```

## Supervisor Configuration Reference

```ini
# /etc/supervisor/conf.d/laravel-worker.conf
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/production/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=3
redirect_stderr=true
stdout_logfile=/var/www/production/storage/logs/worker.log
stopwaitsecs=3600
```

## Post-Incident

1. Review and retry all failed jobs
2. Verify reconciliation job completed successfully
3. Check notification delivery status
4. Review queue worker configuration (concurrency, memory limits)
5. Update monitoring thresholds if necessary

## Escalation

- **On-call engineer** → Slack #backend channel
- **If payment reconciliation affected** → Follow payment-failures runbook
- **If queue backlog growing rapidly** → Scale queue workers
