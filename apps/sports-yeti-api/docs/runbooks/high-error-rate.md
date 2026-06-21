# Runbook: High Error Rate

## Alert Trigger

- Error rate exceeds 1% of total requests over a 5-minute window
- SLO burn rate alert fires (e.g., >14.4x burn rate over 1 hour)

## Severity

**P1** if affecting payments or authentication
**P2** if affecting other API endpoints

## Diagnosis Steps

### 1. Check Error Distribution

```bash
# Check recent error logs
tail -100 /var/www/production/storage/logs/laravel.log | grep -i "error\|exception"

# Check error rate by endpoint via Prometheus
# Query: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```

### 2. Identify Affected Endpoints

```bash
# Check which endpoints are returning errors
grep "HTTP/1.1\" 5" /var/log/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -20
```

### 3. Check Infrastructure Health

```bash
# Database connectivity
php artisan tinker --execute="DB::connection()->getPdo();"

# Redis connectivity
redis-cli ping

# Queue status
php artisan queue:monitor

# Disk space
df -h
```

### 4. Check for Recent Deployments

```bash
# Recent deployment timestamp
stat /var/www/production/bootstrap/cache/config.php

# Git log for recent changes
cd /var/www/production && git log --oneline -5
```

## Resolution Actions

### If Database Issues

```bash
# Check connection pool
php artisan tinker --execute="DB::select('SHOW processlist');"

# Restart database connections
php artisan config:clear
php artisan cache:clear

# If connection pool exhausted, restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

### If Redis Issues

```bash
# Check Redis memory usage
redis-cli info memory

# Flush cache if necessary
php artisan cache:clear

# Restart Redis if unresponsive
sudo systemctl restart redis
```

### If Application Errors

```bash
# Enable maintenance mode if critical
php artisan down --retry=60

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Rollback last migration if deployment-related
php artisan migrate:rollback --step=1

# Disable maintenance mode after fix
php artisan up
```

### If External Service Failure (Stripe, etc.)

```bash
# Check Stripe API status: https://status.stripe.com/
# Verify webhook endpoint is responding
curl -I https://your-api.com/api/v1/webhooks/stripe
```

## Post-Incident

1. Update the incident timeline in the incident log
2. Determine root cause
3. Create follow-up tickets for prevention
4. Update this runbook if new failure modes are discovered
5. Review error budget impact

## Escalation

- **On-call engineer** → Slack #incidents channel
- **If unresolved after 30 minutes** → Engineering lead
- **If payment-related** → Notify finance team
