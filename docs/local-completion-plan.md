# Sports Yeti — Local Completion Plan

Step-by-step guide to fully complete the Sports Yeti MVP in your local environment (Laravel Herd on macOS).

---

## Prerequisites

Ensure you have these installed:

| Tool | Version | Check |
|------|---------|-------|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer -V` |
| PostgreSQL | 14+ | `psql --version` |
| Redis | 7+ | `redis-cli ping` |
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| k6 | latest | `k6 version` (install: `brew install k6`) |
| Stripe CLI | latest | `stripe version` (install: `brew install stripe/stripe-cli/stripe`) |

---

## Step 1: Environment Setup (~15 min)

### 1.1 Pull the latest branch

```bash
cd ~/Herd/sports-yeti
git fetch origin cursor/project-plan-update-e834
git checkout cursor/project-plan-update-e834
# or merge into main:
# git merge origin/cursor/project-plan-update-e834
```

### 1.2 Install Node dependencies

```bash
npm install --legacy-peer-deps
```

### 1.3 Set up the API

```bash
cd apps/sports-yeti-api

# Install PHP dependencies
composer install

# Environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

### 1.4 Configure `.env` for PostgreSQL

Edit `apps/sports-yeti-api/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sports_yeti
DB_USERNAME=your_pg_user
DB_PASSWORD=your_pg_password

CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 1.5 Create database and seed

```bash
createdb sports_yeti

php artisan migrate
php artisan db:seed
```

### 1.6 Start services

```bash
# Terminal 1: API server
php artisan serve

# Terminal 2: Queue worker
php artisan queue:work

# Terminal 3: Stripe webhook forwarding (optional, for payment testing)
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
```

### 1.7 Verify

```bash
curl http://localhost:8000/api/v1/health
# Expected: {"status":"healthy","timestamp":"...","version":"v1"}
```

---

## Step 2: Run API Tests (~10 min)

This validates all 17 feature test files (including the 7 newly added).

```bash
cd apps/sports-yeti-api

# Run the full test suite
php artisan test --testdox

# Run with coverage report
php artisan test --coverage --min=60
```

**Expected:** All tests pass. If any fail, they likely need a minor adjustment for your local DB (e.g., UUID generation differences between SQLite and PostgreSQL).

### Fix any test issues

Common fixes:
- If using SQLite for tests, update `phpunit.xml` to uncomment the SQLite lines
- If using PostgreSQL for tests, ensure the test database exists: `createdb sports_yeti_test`

```bash
# Run a specific test to debug
php artisan test tests/Feature/LeagueControllerTest.php --testdox

# Run with verbose errors
php artisan test --verbose
```

**✅ Checkpoint:** All 17 feature test files pass.

---

## Step 3: Run Load Tests (~30 min)

### 3.1 Seed load test data

```bash
cd apps/sports-yeti-api

php artisan tinker --execute="
    \$user = \App\Models\User::firstOrCreate(
        ['email' => 'loadtest@example.com'],
        ['name' => 'Load Test User', 'password' => bcrypt('password')]
    );
    \$user->assignRole('player');
    \App\Models\Player::firstOrCreate(
        ['user_id' => \$user->id],
        ['experience_level' => 'advanced', 'availability_status' => 'available', 'is_private' => false]
    );
    echo 'Load test user ready: ' . \$user->id . PHP_EOL;
"
```

### 3.2 Run each k6 script

Make sure the API is running (`php artisan serve`), then:

```bash
cd ~/Herd/sports-yeti

# Auth (target: 100 RPS, p95 < 300ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-auth.js

# Bookings (target: 50 RPS, p95 < 500ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-bookings.js

# Payments (target: 25 RPS, p95 < 1s)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-payments.js

# Games + read endpoints (target: 75 RPS, p95 < 300ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-games.js

# Chat (target: 50 RPS, p95 < 500ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-chat.js
```

### 3.3 Save results

```bash
mkdir -p tests/load/results

k6 run --out json=tests/load/results/auth.json \
  --env API_URL=http://localhost:8000/api/v1 tests/load/k6-auth.js

# Repeat for each script...
```

### 3.4 Evaluate results

Check k6 output for:
- **`http_req_duration p(95)`** — must be below each script's threshold
- **`http_req_failed`** — must be below 1–2%
- **`checks`** — all should pass at 95%+

If thresholds fail on local dev (single `php artisan serve` process), that's expected — local dev isn't production. The key is that the shapes are reasonable. For real benchmarks, run against a staging server with proper PHP-FPM + nginx.

**✅ Checkpoint:** Load test scripts execute without errors. Results documented.

---

## Step 4: Security Audit (~2–3 hours)

Work through the checklist at `apps/sports-yeti-api/docs/security-audit-checklist.md`.

### 4.1 Static analysis

```bash
cd apps/sports-yeti-api

# Check for known vulnerabilities in PHP dependencies
composer audit

# Check Node dependencies
cd ~/Herd/sports-yeti
npm audit
```

### 4.2 Code review against checklist

Open `apps/sports-yeti-api/docs/security-audit-checklist.md` and work through each section:

1. **Authentication** — Verify JWT config in `config/jwt.php`, check TTL, refresh behavior
2. **Authorization** — Review all 6 policy files in `app/Policies/`
3. **Input validation** — Spot-check controllers for Validator usage
4. **SQL injection** — Search for `DB::raw` usage: `grep -r "DB::raw" app/`
5. **Error handling** — Verify `APP_DEBUG=false` is set in production `.env`
6. **Secrets** — Verify no secrets in git: `git log --all -p | grep -i "sk_live\|password.*=" | head -20`

### 4.3 Dynamic testing

```bash
# Test rate limiting
for i in $(seq 1 30); do
  curl -s -o /dev/null -w "%{http_code} " \
    -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
echo
# Should see 429 responses after the rate limit kicks in

# Test auth on protected endpoints
curl -s http://localhost:8000/api/v1/leagues | jq .status
# Expected: 401

# Test invalid webhook signature
curl -s -X POST http://localhost:8000/api/v1/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: invalid" \
  -d '{"type":"test"}' | jq .
# Expected: 403
```

### 4.4 Record findings

Update the checklist by checking off items and noting any findings at the bottom of the file.

**✅ Checkpoint:** Security audit checklist completed, findings documented.

---

## Step 5: Chaos Testing (~1–2 hours)

Refer to `tests/chaos/scenarios.md` for full details. Run these against your local environment.

### 5.1 Database failure test

```bash
# Stop PostgreSQL
brew services stop postgresql@16  # or your version

# Test API behavior
curl -s http://localhost:8000/api/v1/health | jq .
curl -s http://localhost:8000/api/v1/leagues \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
# Expected: Error responses, not crashes

# Restore
brew services start postgresql@16

# Verify recovery
curl -s http://localhost:8000/api/v1/health | jq .
# Expected: healthy
```

### 5.2 Redis failure test

```bash
# Stop Redis
brew services stop redis

# Test API still works (cache miss, direct DB queries)
curl -s http://localhost:8000/api/v1/leagues \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# Restore
brew services start redis
```

### 5.3 Queue worker crash test

```bash
# Find queue worker PID
ps aux | grep "queue:work" | grep -v grep

# Kill it
kill -9 <PID>

# Verify jobs are preserved
php artisan tinker --execute="echo 'Pending: ' . DB::table('jobs')->count();"

# Restart worker
php artisan queue:work &
```

### 5.4 Record results

Fill in the results table at the bottom of `tests/chaos/scenarios.md`:

| Scenario | Expected | Actual | Pass/Fail | Notes |
|----------|----------|--------|-----------|-------|
| DB down | 503, auto-recover | ... | ... | ... |
| Redis down | Degraded, functional | ... | ... | ... |
| Worker crash | Auto-restart, no loss | ... | ... | ... |

**✅ Checkpoint:** Chaos scenarios executed, results documented.

---

## Step 6: Verify Mobile & Admin Apps (~30 min)

### 6.1 Mobile app

```bash
cd ~/Herd/sports-yeti

# Start the mobile app
npx nx serve sports-yeti
# or: cd apps/sports-yeti && npx expo start

# Press 'w' for web, 'i' for iOS simulator, 'a' for Android
```

Walk through:
- [ ] Login/Register flow
- [ ] Dashboard loads with data
- [ ] Facilities list and detail
- [ ] Games list and detail
- [ ] Teams list and detail
- [ ] Bookings flow (create, view, cancel)
- [ ] QR scanner opens
- [ ] Chat screen connects
- [ ] Profile screen displays user info

### 6.2 Admin dashboard

```bash
npx nx serve sports-yeti-admin
# or: cd apps/sports-yeti-admin && npx expo start --web
```

Walk through:
- [ ] Admin login
- [ ] Dashboard with stats
- [ ] Leagues management (list, create, edit)
- [ ] Teams management (list, detail)
- [ ] Players management (list, detail)
- [ ] Facilities management (list, detail, create)
- [ ] Booking calendar view
- [ ] Payments list and detail
- [ ] Audit log viewer

**✅ Checkpoint:** Both apps launch and core flows work against the local API.

---

## Step 7: Backup/Restore Drill (~30 min)

### 7.1 Create a backup

```bash
pg_dump -h 127.0.0.1 -U your_pg_user -d sports_yeti \
  --format=custom --compress=9 \
  --file="backups/sports_yeti_$(date +%Y%m%d_%H%M%S).dump"
```

### 7.2 Verify backup

```bash
pg_restore --list backups/sports_yeti_*.dump | head -20
```

### 7.3 Test restore

```bash
# Create a test restore database
createdb sports_yeti_restore_test

# Restore
pg_restore -h 127.0.0.1 -U your_pg_user -d sports_yeti_restore_test \
  --no-owner --no-privileges \
  backups/sports_yeti_*.dump

# Verify data
psql -d sports_yeti_restore_test -c "SELECT count(*) FROM users;"
psql -d sports_yeti_restore_test -c "SELECT count(*) FROM leagues;"

# Cleanup
dropdb sports_yeti_restore_test
```

### 7.4 Record results

Document:
- Backup file size: ___
- Backup duration: ___
- Restore duration: ___
- Data verified: Yes/No
- RPO met (≤15min): Yes/No
- RTO met (≤2hr): Yes/No

**✅ Checkpoint:** Backup/restore drill completed successfully.

---

## Step 8: Final Validation & Status Update (~15 min)

### 8.1 Update tasks.md

Check off remaining items:

```markdown
- [x] Execute load tests against running API
- [x] Execute chaos test scenarios in staging
- [x] Conduct security audit using checklist
- [x] Backup/restore drill
```

### 8.2 Run code style check

```bash
cd apps/sports-yeti-api
vendor/bin/pint --test
# Fix any issues: vendor/bin/pint
```

### 8.3 Commit results

```bash
cd ~/Herd/sports-yeti
git add -A
git commit -m "chore: Complete Phase 9 - load test results, security audit, chaos test results"
git push
```

---

## Summary Checklist

| # | Step | Est. Time | Status |
|---|------|-----------|--------|
| 1 | Environment setup | 15 min | ⬜ |
| 2 | Run API tests (17 files) | 10 min | ⬜ |
| 3 | Run k6 load tests (5 scripts) | 30 min | ⬜ |
| 4 | Security audit (checklist) | 2–3 hrs | ⬜ |
| 5 | Chaos testing (7 scenarios) | 1–2 hrs | ⬜ |
| 6 | Verify mobile & admin apps | 30 min | ⬜ |
| 7 | Backup/restore drill | 30 min | ⬜ |
| 8 | Final validation & commit | 15 min | ⬜ |

**Total estimated time: ~5–7 hours**

After completing all steps, the Sports Yeti MVP Phase 9 (Hardening, Testing & Launch) is complete and the platform is ready for pilot launch.
