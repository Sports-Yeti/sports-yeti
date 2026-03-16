# Chaos Engineering Test Scenarios

Sports Yeti API — Fault injection scenarios and expected behaviors.

## Purpose

Verify that the Sports Yeti platform degrades gracefully under failure conditions. Each scenario describes a failure to inject, the expected behavior, and how to verify the system response.

---

## Scenario 1: Database Connection Failure

### Injection
Simulate PostgreSQL becoming unreachable.

```bash
# Option A: Block database port with iptables
sudo iptables -A OUTPUT -p tcp --dport 5432 -j DROP

# Option B: Stop PostgreSQL service
sudo systemctl stop postgresql

# Option C: Change DB_HOST to an invalid address temporarily
```

### Expected Behavior
- API returns `503 Service Unavailable` for data-dependent endpoints
- Health endpoint reports `unhealthy`
- Error logged with trace_id
- No data corruption
- Application recovers automatically when database is restored

### Verification
```bash
# During outage
curl -s http://localhost:8000/api/v1/health | jq .status
# Expected: "unhealthy" or connection error

curl -s http://localhost:8000/api/v1/leagues -H "Authorization: Bearer $TOKEN" | jq .status
# Expected: 500 or 503

# After recovery
curl -s http://localhost:8000/api/v1/health | jq .status
# Expected: "healthy"

curl -s http://localhost:8000/api/v1/leagues -H "Authorization: Bearer $TOKEN" | jq .
# Expected: Normal 200 response
```

### Recovery Steps
```bash
# Restore database access
sudo iptables -D OUTPUT -p tcp --dport 5432 -j DROP
# or
sudo systemctl start postgresql

# Clear Laravel caches to reset connections
php artisan config:clear
php artisan cache:clear
```

---

## Scenario 2: Redis Unavailable

### Injection
Simulate Redis becoming unreachable.

```bash
# Stop Redis
sudo systemctl stop redis

# Or block Redis port
sudo iptables -A OUTPUT -p tcp --dport 6379 -j DROP
```

### Expected Behavior
- Rate limiting may fail open or closed (verify which)
- Cache misses — queries hit database directly (slower but functional)
- Queue jobs cannot be dispatched if using Redis queue driver
- Prometheus metrics with Redis storage stop updating
- Application continues serving requests (degraded performance)

### Verification
```bash
# Test rate limiting behavior
for i in $(seq 1 50); do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v1/auth/login \
    -X POST -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Observe if rate limiting still works or fails open

# Test API functionality
curl -s http://localhost:8000/api/v1/leagues -H "Authorization: Bearer $TOKEN" | jq .
# Should still return data (from DB, not cache)
```

### Recovery Steps
```bash
sudo systemctl start redis
php artisan cache:clear
php artisan queue:restart
```

---

## Scenario 3: Stripe API Timeout

### Injection
Simulate Stripe API being slow or unreachable.

```bash
# Block Stripe API IPs
sudo iptables -A OUTPUT -d api.stripe.com -j DROP

# Or use a network proxy to add latency
# toxiproxy-cli toxic add -t latency -a latency=10000 stripe
```

### Expected Behavior
- Payment intent creation times out with appropriate error
- Existing payments are not affected
- Webhook handler continues to process already-queued events
- Error is logged with trace_id and Stripe error details
- Client receives meaningful error (not generic 500)
- Retry logic with exponential backoff kicks in (if implemented)

### Verification
```bash
# Attempt to create a payment intent
curl -s http://localhost:8000/api/v1/payments/intent \
  -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"currency":"usd","description":"Chaos test"}' | jq .
# Expected: Error response with payment service unavailable message

# Verify no zombie payments created
php artisan tinker --execute="
    \App\Models\Payment::where('status', 'pending')
        ->where('created_at', '>', now()->subMinutes(5))
        ->count();
"
```

### Recovery Steps
```bash
sudo iptables -D OUTPUT -d api.stripe.com -j DROP

# Retry failed payment intents if needed
php artisan queue:retry all
```

---

## Scenario 4: SSE Connection Drop

### Injection
Simulate network interruption during SSE streaming.

```bash
# Kill a specific SSE connection
# (Get the PID of the PHP process serving the SSE request)
# kill -TERM <pid>

# Or simulate network blip
sudo iptables -A OUTPUT -p tcp --sport 8000 -j DROP
sleep 5
sudo iptables -D OUTPUT -p tcp --sport 8000 -j DROP
```

### Expected Behavior
- Client detects connection loss (EventSource `onerror` fires)
- Client automatically reconnects (mobile SSE client has reconnect logic)
- Client resumes from `Last-Event-ID` header
- No duplicate messages delivered
- Heartbeat mechanism detects stale connections

### Verification
```bash
# Start an SSE connection and observe reconnection
curl -N -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/event-stream" \
  http://localhost:8000/api/v1/chats/CHAT_ID/stream &

# Kill the connection
kill %1

# Reconnect — should resume without lost messages
curl -N -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/event-stream" \
  -H "Last-Event-ID: LAST_MESSAGE_ID" \
  http://localhost:8000/api/v1/chats/CHAT_ID/stream
```

---

## Scenario 5: Queue Worker Crash

### Injection
Kill queue worker processes.

```bash
# Find queue worker PIDs
ps aux | grep "queue:work"

# Kill the worker (simulate crash)
kill -9 <worker_pid>
```

### Expected Behavior
- Supervisor/systemd restarts the worker automatically
- Jobs remain in the queue and are not lost
- Failed jobs are recorded in `failed_jobs` table
- Reconciliation job runs on next schedule
- No data corruption from partially processed jobs

### Verification
```bash
# Check queue size before and after
php artisan tinker --execute="echo DB::table('jobs')->count();"

# Kill worker
kill -9 <worker_pid>

# Wait for supervisor to restart (usually < 5 seconds)
sleep 10

# Verify worker restarted
ps aux | grep "queue:work"

# Verify no jobs were lost
php artisan tinker --execute="echo DB::table('jobs')->count();"
php artisan tinker --execute="echo DB::table('failed_jobs')->count();"
```

### Recovery Steps
```bash
# If supervisor doesn't restart:
sudo supervisorctl start laravel-worker:*

# Retry failed jobs
php artisan queue:retry all
```

---

## Scenario 6: Disk Space Exhaustion

### Injection
Fill the disk to trigger storage-related errors.

```bash
# Create a large file to fill disk (CAREFUL — use a temp directory)
# dd if=/dev/zero of=/tmp/diskfill bs=1M count=10000

# Or fill log directory
# (More realistic scenario)
```

### Expected Behavior
- Log writes fail gracefully (don't crash the application)
- File uploads rejected with meaningful error
- Database writes may fail if WAL directory is affected
- Application returns errors but doesn't crash
- Alert fires from disk space monitoring

### Verification
```bash
# Check disk space
df -h

# Verify API still responds
curl -s http://localhost:8000/api/v1/health | jq .
```

### Recovery Steps
```bash
# Remove the fill file
rm /tmp/diskfill

# Rotate logs
php artisan log:clear  # or truncate log files
find /var/www/production/storage/logs -name "*.log" -mtime +7 -delete

# Verify recovery
df -h
curl -s http://localhost:8000/api/v1/health | jq .
```

---

## Scenario 7: High Memory Pressure

### Injection
Simulate memory pressure on the application server.

```bash
# Use stress tool
stress --vm 4 --vm-bytes 512M --timeout 60s

# Or limit PHP-FPM memory
# Edit php.ini: memory_limit = 32M (artificially low)
```

### Expected Behavior
- PHP-FPM workers may be killed by OOM killer
- Requests return 502/503 from nginx
- Application recovers after memory pressure is relieved
- No data corruption from killed processes

### Verification
```bash
# During pressure
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v1/health
# May return 502 or 503

# After pressure is relieved
curl -s http://localhost:8000/api/v1/health | jq .
# Should return healthy
```

---

## Running Chaos Tests

### Prerequisites
1. Staging environment with monitoring enabled
2. Baseline performance metrics established
3. On-call engineer aware of the test window
4. Rollback procedures ready

### Execution Checklist
- [ ] Notify team of chaos test window
- [ ] Establish baseline metrics (error rate, latency, queue size)
- [ ] Execute each scenario one at a time
- [ ] Record observations for each scenario
- [ ] Verify recovery after each scenario
- [ ] Document any unexpected behaviors
- [ ] Create tickets for issues found
- [ ] Restore all systems to normal state

### Results Template

| Scenario | Expected | Actual | Pass/Fail | Notes |
|----------|----------|--------|-----------|-------|
| DB down | 503, auto-recover | Requests hang/timeout during outage; auto-recovers when DB resumes | Partial Pass | Health endpoint returns static data (no DB check). Data endpoints hang rather than returning 503. Recovery is automatic. |
| Redis down | Degraded, functional | Requests hang/timeout due to rate limiter dependency on Redis | Fail | Rate limiter (ThrottleRequests middleware) blocks on Redis connection. Consider configuring fallback cache driver or making rate limiter Redis-optional. Recovery is automatic. |
| Stripe timeout | Error response, retry | Not tested locally | Skipped | Requires Stripe API blocking which is impractical in local dev. |
| SSE drop | Auto-reconnect | Not tested locally | Skipped | Requires client-side testing. |
| Worker crash | Auto-restart, no loss | Not tested (no queue worker running) | Skipped | Queue uses database driver; jobs persist in DB. No supervisor configured for auto-restart in local dev. |
| Disk full | Graceful errors | Not tested locally | Skipped | Too risky for local dev environment. |
| Memory pressure | 502/503, recover | Not tested locally | Skipped | Too risky for local dev environment. |

**Audit Date:** 2026-03-16
**Environment:** Local development (macOS, Laravel Herd, single PHP process)
