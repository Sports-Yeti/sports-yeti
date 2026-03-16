# Security Audit Checklist

Sports Yeti API — OWASP ASVS L2 aligned security review.

## Authentication (ASVS V2)

### JWT Configuration
- [ ] JWT secret is cryptographically strong (≥ 256 bits)
- [ ] JWT TTL is short (≤ 60 minutes)
- [ ] Refresh tokens rotate on use
- [ ] Refresh token has reasonable expiry (≤ 7 days)
- [ ] Expired tokens are properly rejected
- [ ] Token is not exposed in URL parameters or logs
- [ ] JWT algorithm is explicitly set (not `none`)

### Password Security
- [ ] Passwords are hashed with bcrypt (≥ 12 rounds in production)
- [ ] Minimum password length enforced (≥ 8 characters)
- [ ] Password confirmation required on registration
- [ ] No password in API response bodies
- [ ] Login rate limiting prevents brute force (throttle group: `auth`)

### Session Management
- [ ] Logout invalidates the token server-side
- [ ] Concurrent session limit considered
- [ ] Token not stored in localStorage (mobile uses SecureStore)

## Authorization (ASVS V4)

### RBAC/ABAC
- [ ] All endpoints require authentication (except health, metrics, webhooks, auth)
- [ ] Deny-by-default policy enforced
- [ ] `LeaguePolicy` — Only admin/owner can update/delete
- [ ] `TeamPolicy` — Only captain can update team, add/remove members
- [ ] `BookingPolicy` — Users can only cancel own bookings
- [ ] `GamePolicy` — Only authorized users can create/update games
- [ ] `PaymentPolicy` — Refund requires `payments.refund` permission
- [ ] `ActivityPolicy` — Audit logs scoped by tenant
- [ ] Player profiles — Only owner can update; privacy toggle respected
- [ ] Notifications — Users can only access/modify own notifications
- [ ] Chat messages — Users can only delete own messages
- [ ] Polls — Only creator can close polls

### Multi-Tenancy
- [ ] `TenantScope` middleware correctly filters by `league_id`
- [ ] No cross-tenant data leakage in list endpoints
- [ ] Tenant ID cannot be spoofed via request parameters
- [ ] Audit log queries are tenant-scoped

## Input Validation (ASVS V5)

### API Input
- [ ] All controllers use Validator or FormRequest classes
- [ ] String lengths are bounded (`max:255`, `max:2000` for messages)
- [ ] Numeric inputs have min/max constraints
- [ ] UUID format validated for ID parameters (`uuid` rule)
- [ ] Enum values validated with `in:` rule (status, role, etc.)
- [ ] Date inputs validated (`date`, `after:today`, `before:today`)
- [ ] Email format validated
- [ ] File uploads validated for type and size (if applicable)
- [ ] JSON payloads validated (no arbitrary nesting depth)

### SQL Injection
- [ ] All database queries use Eloquent ORM or parameterized queries
- [ ] No raw SQL with user input concatenation
- [ ] Search queries use `LIKE` with proper escaping
- [ ] No `DB::raw()` with unsanitized user input

### XSS Prevention
- [ ] API responses use `Content-Type: application/json`
- [ ] No HTML rendered from user input in API responses
- [ ] Chat messages are stored as-is, sanitized on display (client responsibility)
- [ ] Post/comment content does not allow HTML injection

## Cryptography (ASVS V6)

- [ ] HTTPS enforced in production (TLS 1.2+)
- [ ] JWT secret not hardcoded in source
- [ ] Stripe API keys not in version control
- [ ] `.env.example` contains only placeholder values
- [ ] Passwords hashed with bcrypt (not MD5/SHA1)
- [ ] Stripe webhook signatures verified with HMAC-SHA256

## Error Handling (ASVS V7)

- [ ] Error responses follow RFC 7807 Problem+JSON format
- [ ] Stack traces not exposed in production responses
- [ ] Internal server errors return generic message (no implementation details)
- [ ] Validation errors return field-specific messages
- [ ] 404 responses don't reveal resource existence to unauthorized users
- [ ] Debug mode disabled in production (`APP_DEBUG=false`)

## Data Protection (ASVS V8)

- [ ] Sensitive data not logged (passwords, tokens, payment details)
- [ ] User PII access controlled (player privacy toggle)
- [ ] Payment data handled via Stripe (no card numbers stored)
- [ ] Audit trail captures who/what/when for admin actions
- [ ] Database backups encrypted at rest
- [ ] Redis data (cache/queue) not persisted with sensitive data unencrypted

## Communication Security (ASVS V9)

- [ ] All API communication over HTTPS in production
- [ ] CORS configured to allow only authorized origins
- [ ] SSE endpoint uses proper headers (`X-Accel-Buffering: no`)
- [ ] Webhook endpoints verify source (Stripe HMAC)
- [ ] Rate limiting applied to all endpoints:
  - `auth` — Strict rate limit on login/register
  - `payments` — Strict rate limit on payment operations
  - `webhooks` — Rate limit on webhook endpoint
  - `api` — General rate limit on all other endpoints

## API Security

### Rate Limiting
- [ ] Rate limits return `429 Too Many Requests` with `Retry-After` header
- [ ] Rate limits are per-user and per-IP
- [ ] Rate limits are configurable per environment
- [ ] Payment endpoints have stricter limits than read endpoints

### Idempotency
- [ ] Booking creation supports `idempotency_key`
- [ ] Payment intent creation supports `idempotency_key`
- [ ] Duplicate requests with same key return original response (not error)
- [ ] Idempotency keys expire after 24 hours

### Webhook Security
- [ ] Stripe webhook signature verified on every request
- [ ] Invalid signatures return 403
- [ ] Webhook endpoint is rate-limited
- [ ] Webhook processing is idempotent (safe to replay)
- [ ] Webhook failures don't expose internal state

## Infrastructure Security

### Secrets Management
- [ ] No secrets in git history
- [ ] `.env` file excluded from version control
- [ ] Production secrets in secure store (AWS SM, Vault, etc.)
- [ ] Secret rotation procedure documented
- [ ] CI/CD uses GitHub Secrets for sensitive values

### Dependencies
- [ ] PHP dependencies audited (`composer audit`)
- [ ] Node.js dependencies audited (`npm audit`)
- [ ] No known critical vulnerabilities in dependencies
- [ ] Dependency lock files committed (`composer.lock`, `package-lock.json`)

### Deployment
- [ ] Production deployment requires passing test suite
- [ ] Maintenance mode available during deploys
- [ ] Rollback procedure documented and tested
- [ ] Database migrations are backward-compatible

## Mobile App Security

- [ ] API tokens stored in Expo SecureStore (not AsyncStorage)
- [ ] No sensitive data in client-side logs
- [ ] API URL not hardcoded (uses environment variable)
- [ ] Sentry DSN configured (no sensitive data in crash reports)
- [ ] Certificate pinning considered for production

## Audit Trail

- [ ] All admin actions logged (create, update, delete)
- [ ] Audit entries include `user_id`, `action`, `timestamp`, `trace_id`
- [ ] Audit log is append-only (no modification/deletion)
- [ ] Audit entries are tenant-scoped
- [ ] Audit log accessible to authorized admins only

---

## How to Conduct the Audit

1. **Static analysis** — Review code against each checklist item
2. **Dynamic testing** — Run the API and test each security control
3. **Dependency scan** — Run `composer audit` and `npm audit`
4. **Penetration testing** — Test with tools like OWASP ZAP or Burp Suite
5. **Configuration review** — Verify production `.env` and infrastructure config

## Findings (Audit Date: 2026-03-16)

| # | Category | Severity | Finding | Status |
|---|----------|----------|---------|--------|
| 1 | Dependencies | Medium | `league/commonmark` <= 2.8.0 — CVE-2026-30838 DisallowedRawHtml bypass | Open |
| 2 | Dependencies | Medium | `psy/psysh` <= 0.12.18 — CVE-2026-25129 local privilege escalation via .psysh.php | Open |
| 3 | Dependencies | High | npm audit: 53 vulnerabilities (9 low, 10 moderate, 33 high, 1 critical) primarily in webpack | Open |
| 4 | CORS | Medium | No `config/cors.php` exists — default CORS settings likely allow `*` origins | Open |
| 5 | Auth | Low | Password validation only enforces `min:8` — no complexity rules (uppercase, numbers, symbols) | Open |
| 6 | Config | Low | `.env.example` missing JWT_SECRET, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET entries | Open |
| 7 | Config | Info | APP_DEBUG=true in .env.example — production must override to false | Noted |
| 8 | Rate Limiting | Pass | Auth rate limit (10/min) verified — returns 429 after 10 attempts | Verified |
| 9 | Auth | Pass | Protected endpoints return 401 for unauthenticated requests | Verified |
| 10 | Webhooks | Pass | Invalid Stripe signatures handled properly (returns error, no crash) | Verified |
| 11 | SQL Injection | Pass | No DB::raw() with user input found — all queries use Eloquent ORM | Verified |
| 12 | Error Handling | Pass | RFC 7807 Problem+JSON format correctly implemented | Verified |
| 13 | Secrets | Pass | .env excluded from git via .gitignore; no secrets found in git history | Verified |
| 14 | JWT | Pass | RS256 algorithm, 60-min TTL, blacklist enabled | Verified |
| 15 | Passwords | Pass | Bcrypt with 12 rounds configured | Verified |

**Severity levels:** Critical, High, Medium, Low, Info
