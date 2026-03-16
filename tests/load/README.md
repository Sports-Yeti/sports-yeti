# Load Testing with k6

Performance and load test scripts for the Sports Yeti API.

## Prerequisites

Install [k6](https://k6.io/docs/get-started/installation/):

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Running Tests

### Quick Run (local development)

```bash
# Auth endpoints
k6 run --env API_URL=http://localhost:8000/api/v1 k6-auth.js

# Booking endpoints
k6 run --env API_URL=http://localhost:8000/api/v1 k6-bookings.js

# Payment endpoints
k6 run --env API_URL=http://localhost:8000/api/v1 k6-payments.js

# Game/listing endpoints
k6 run --env API_URL=http://localhost:8000/api/v1 k6-games.js

# Chat endpoints
k6 run --env API_URL=http://localhost:8000/api/v1 k6-chat.js
```

### Against Staging

```bash
k6 run --env API_URL=https://staging-api.sportsyeti.com/api/v1 k6-auth.js
```

### With Docker

```bash
docker run --rm -i grafana/k6 run --env API_URL=http://host.docker.internal:8000/api/v1 - < k6-auth.js
```

### Save Results to JSON

```bash
k6 run --out json=results/auth-results.json --env API_URL=http://localhost:8000/api/v1 k6-auth.js
```

## Test Descriptions

| Script | Target | RPS | p95 Threshold | Description |
|--------|--------|-----|---------------|-------------|
| `k6-auth.js` | Auth endpoints | 100 | < 300ms | Registration, login, token refresh |
| `k6-bookings.js` | Booking endpoints | 50 | < 500ms | Booking creation, conflict detection |
| `k6-payments.js` | Payment endpoints | 25 | < 1000ms | Payment intent creation (includes Stripe latency) |
| `k6-games.js` | Read endpoints | 75 | < 300ms | Games, leagues, teams, facilities, players listing |
| `k6-chat.js` | Chat endpoints | 50 | < 500ms | Message sending, listing, polls |

## SLO Targets

These thresholds align with the SLO definitions in `apps/sports-yeti-api/docs/slo-definitions.md`:

| Metric | Target | Script Threshold |
|--------|--------|-----------------|
| Auth p95 latency | < 300ms | `http_req_duration: p(95)<300` |
| Booking p95 latency | < 500ms | `http_req_duration: p(95)<500` |
| Payment p95 latency | < 1000ms | `http_req_duration: p(95)<1000` |
| Read endpoint p95 | < 300ms | `http_req_duration: p(95)<300` |
| Error rate | < 1% | `http_req_failed: rate<0.01` |

## Setup Requirements

Before running load tests:

1. **Database seeded** — Run `php artisan db:seed` to ensure test data exists
2. **Queue workers running** — `php artisan queue:work` for async operations
3. **Redis available** — For rate limiting and caching
4. **Stripe test mode** — Payment tests require Stripe test credentials

### Pre-seeding for Load Tests

```bash
cd apps/sports-yeti-api

# Seed roles and permissions
php artisan db:seed --class=RolesAndPermissionsSeeder

# Create a load test user
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
    echo 'Load test user ready: ' . \$user->id;
"
```

## Interpreting Results

k6 will output a summary like:

```
     ✓ login: status is 200
     ✓ login: returns token

     checks.........................: 100.00% ✓ 5000  ✗ 0
     http_req_duration..............: avg=45ms  min=12ms  med=38ms  max=890ms  p(90)=95ms  p(95)=145ms
     http_req_failed................: 0.00%   ✓ 0     ✗ 5000
```

**Key metrics to watch:**
- `http_req_duration p(95)` — Must be below threshold
- `http_req_failed` — Must be below 1%
- `checks` — All assertions should pass
- Custom metrics (e.g., `login_duration`, `create_booking_duration`) — Domain-specific latency

**Red flags:**
- p95 > threshold → Performance degradation
- Error rate > 1% → Stability issue
- Increasing latency over time → Memory leak or connection pool exhaustion
- Sudden spike in errors → Resource limit hit (connections, rate limiting)

## Continuous Performance Testing

For CI integration, add to `.github/workflows/ci.yml`:

```yaml
  load-test:
    name: Performance Smoke Test
    needs: [api-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/k6-auth.js
        env:
          API_URL: http://localhost:8000/api/v1
```
