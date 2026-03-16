# Runbook: Database Recovery

## Alert Trigger

- Database connection failures
- Replication lag exceeds threshold
- Backup verification failure
- Data corruption detected

## Severity

**P1** — Database issues affect all application functionality.

## Recovery Targets

- **RPO (Recovery Point Objective):** ≤ 15 minutes
- **RTO (Recovery Time Objective):** ≤ 2 hours

## Diagnosis Steps

### 1. Check Database Status

```bash
# PostgreSQL connection test
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE -c "SELECT 1;"

# Check active connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check for long-running queries
psql -c "
    SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
    FROM pg_stat_activity
    WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
    ORDER BY duration DESC;
"

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('$DB_DATABASE'));"
```

### 2. Check Replication (if applicable)

```bash
# Check replication status
psql -c "SELECT * FROM pg_stat_replication;"

# Check replication lag
psql -c "
    SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
"
```

### 3. Check Disk Space

```bash
# PostgreSQL data directory space
df -h /var/lib/postgresql/

# Check WAL directory size
du -sh /var/lib/postgresql/*/main/pg_wal/
```

## Backup Procedures

### Automated Backups

```bash
# Verify latest backup exists
ls -la /var/backups/postgresql/

# Check backup age
stat /var/backups/postgresql/latest.sql.gz
```

### Manual Backup

```bash
# Create immediate backup
pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE \
  --format=custom \
  --compress=9 \
  --file="/var/backups/postgresql/manual-$(date +%Y%m%d-%H%M%S).dump"

# Verify backup integrity
pg_restore --list "/var/backups/postgresql/manual-*.dump" | head -20
```

## Restore Procedures

### Point-in-Time Recovery

```bash
# 1. Stop the application
php artisan down --retry=60

# 2. Stop PostgreSQL
sudo systemctl stop postgresql

# 3. Restore from base backup
# (Follow PostgreSQL PITR documentation for your version)

# 4. Set recovery target
# Edit postgresql.conf:
# recovery_target_time = '2026-02-16 10:00:00 UTC'

# 5. Start PostgreSQL in recovery mode
sudo systemctl start postgresql

# 6. Verify data integrity
php artisan tinker --execute="
    echo 'Users: ' . \App\Models\User::count();
    echo 'Leagues: ' . \App\Models\League::count();
    echo 'Payments: ' . \App\Models\Payment::count();
"

# 7. Bring application back up
php artisan up
```

### Full Restore from Dump

```bash
# 1. Stop the application
php artisan down --retry=60

# 2. Drop and recreate the database
psql -U postgres -c "DROP DATABASE IF EXISTS sports_yeti;"
psql -U postgres -c "CREATE DATABASE sports_yeti OWNER $DB_USERNAME;"

# 3. Restore from backup
pg_restore -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE \
  --no-owner --no-privileges \
  /var/backups/postgresql/latest.dump

# 4. Run any pending migrations
php artisan migrate --force

# 5. Clear caches
php artisan config:cache
php artisan cache:clear

# 6. Verify data
php artisan tinker --execute="
    echo 'Users: ' . \App\Models\User::count();
    echo 'Leagues: ' . \App\Models\League::count();
"

# 7. Bring application back up
php artisan up
```

## Connection Pool Exhaustion

```bash
# Kill idle connections
psql -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE state = 'idle'
    AND query_start < now() - interval '30 minutes';
"

# Restart PHP-FPM to reset connection pool
sudo systemctl restart php8.2-fpm
```

## Post-Incident

1. Verify all data integrity after restore
2. Run reconciliation job to verify payment data
3. Notify users if any data loss occurred
4. Review backup schedule and retention
5. Update monitoring thresholds if necessary
6. Document lessons learned

## Backup Verification Schedule

- **Daily:** Verify automated backup completed
- **Weekly:** Test restore to staging environment
- **Monthly:** Full restore drill to verify RPO/RTO targets

## Escalation

- **On-call engineer** → Slack #database channel
- **If data loss suspected** → CTO + Engineering lead
- **If RPO/RTO targets at risk** → All hands
