# 🏀 Sports Yeti

A comprehensive sports community platform for basketball league management, featuring team organization, facility booking, camp management, real-time chat, Stripe payments, and an admin dashboard.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [API Backend](#api-backend-laravel)
  - [Mobile App](#mobile-app-react-native)
  - [Admin Dashboard](#admin-dashboard-react-native-web)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Observability](#observability)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

---

## Overview

Sports Yeti is a full-stack sports management platform built as an Nx monorepo with three applications:

- **Laravel 11 API** — RESTful backend with JWT authentication, Stripe payments, real-time SSE, multi-tenancy, audit logging, and distributed tracing
- **React Native Mobile App** — Cross-platform mobile app built with Expo, featuring facility booking, game chat, QR check-in, and crash reporting
- **React Native Web Admin** — Admin dashboard for league management, booking calendars, payment management, and audit log viewing

### Key Features

- 🏆 **League & team management** — Create leagues, manage teams and rosters, assign captains
- 👤 **Player profiles** — Player discovery, privacy controls, availability status
- 🏟️ **Facility booking** — Browse facilities, book spaces, conflict detection, QR code check-in
- ⛺ **Camp management** — Training camps with sessions and registration
- 💳 **Stripe payments** — Payment intents, webhook handling (HMAC verified), refunds, nightly reconciliation
- 💬 **Real-time chat** — Server-Sent Events (SSE) for game/team chat with attendance polls
- 🔔 **Notifications** — Push notifications (Expo), email, in-app with preference management
- 📊 **Admin dashboard** — League stats, booking calendar, payment management, audit log viewer
- 📝 **Social feed** — Posts, comments, likes, and league news
- 🔐 **Multi-tenancy** — League-scoped data isolation with tenant guards
- 📋 **Audit logging** — Immutable audit trail with filterable admin views
- 🔭 **Observability** — OpenTelemetry tracing, Prometheus metrics, Sentry crash reporting

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Laravel | 11 | API framework |
| PHP | 8.2+ | Runtime |
| PostgreSQL | 14+ | Primary database |
| Redis | 7+ | Cache, queues, Prometheus storage |
| JWT (tymon/jwt-auth) | — | Authentication |
| Stripe SDK | — | Payment processing |
| spatie/laravel-permission | — | RBAC/ABAC |
| spatie/laravel-activitylog | — | Audit logging |
| OpenTelemetry | — | Distributed tracing |
| Prometheus | — | RED metrics |

### Mobile
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.79.5 | Mobile framework |
| Expo | 53 | Build & development tooling |
| React | 19 | UI library |
| React Navigation | 7 | Navigation |
| Zustand | 5 | State management |
| TanStack React Query | 5 | Data fetching & caching |
| Axios | — | HTTP client |
| Sentry | — | Crash reporting & tracing |
| expo-camera | — | QR code scanning |

### Admin Dashboard
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native Web | 0.20 | Web rendering |
| React Native Paper | 5 | Material Design components |
| React Navigation | 7 | Sidebar + stack navigation |
| Zustand | 5 | State management |
| Axios | — | HTTP client |

### DevOps
| Technology | Purpose |
|------------|---------|
| Nx | 21.3 — Monorepo management |
| GitHub Actions | CI/CD (API tests, mobile builds, staging deploy) |
| PHPUnit | API testing |
| Jest | Mobile & admin testing |
| Playwright | E2E testing |

---

## Prerequisites

### Required
- **Node.js** >= 20.x
- **npm** >= 10.x
- **PHP** >= 8.2 with extensions: mbstring, pdo, pdo_pgsql, redis, bcmath, gd
- **Composer** >= 2.x
- **PostgreSQL** >= 14

### Optional
- **Redis** — for caching, queues, and Prometheus metric storage
- **Stripe CLI** — for local webhook testing
- **iOS:** Xcode (macOS only) for iOS simulator
- **Android:** Android Studio with SDK for Android emulator
- **Expo Go** app on your mobile device

---

## Project Structure

```
sports-yeti/
├── apps/
│   ├── sports-yeti-api/              # Laravel 11 API backend
│   │   ├── app/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/Api/V1/  # 17 API controllers
│   │   │   │   ├── Middleware/          # TenantScope, TraceRequest, PrometheusMetrics
│   │   │   │   └── Requests/           # Form request validation
│   │   │   ├── Models/                 # 27 Eloquent models
│   │   │   ├── Policies/              # 6 authorization policies
│   │   │   ├── Services/              # BookingService, PaymentService, etc.
│   │   │   ├── Jobs/                  # ReconcilePaymentsJob
│   │   │   ├── Scopes/               # TenantScope
│   │   │   └── Traits/               # BelongsToLeague
│   │   ├── config/                    # App + OpenTelemetry + Prometheus config
│   │   ├── database/
│   │   │   ├── factories/             # 9 model factories
│   │   │   ├── migrations/            # 32 migrations
│   │   │   └── seeders/               # Roles & permissions seeder
│   │   ├── routes/api.php             # All API routes
│   │   ├── tests/Feature/             # 10 feature test files
│   │   └── docs/                      # SLO definitions
│   │
│   ├── sports-yeti/                   # React Native mobile app (Expo)
│   │   ├── src/
│   │   │   ├── screens/               # 14 screens across 10 domains
│   │   │   │   ├── auth/              # Login, Register
│   │   │   │   ├── home/              # Dashboard
│   │   │   │   ├── games/             # Games list, Game detail
│   │   │   │   ├── facilities/        # Facilities list, Facility detail
│   │   │   │   ├── bookings/          # Bookings list, Booking detail
│   │   │   │   ├── camps/             # Camps list, Camp detail
│   │   │   │   ├── teams/             # Teams list, Team detail
│   │   │   │   ├── chat/              # Real-time chat (SSE)
│   │   │   │   ├── scanner/           # QR code scanner
│   │   │   │   └── profile/           # User profile
│   │   │   ├── navigation/            # Auth + Main + Root navigators
│   │   │   ├── services/              # API client, SSE client, storage
│   │   │   ├── hooks/                 # useChatSSE
│   │   │   ├── stores/                # Zustand auth store
│   │   │   ├── components/            # ErrorBoundary
│   │   │   ├── utils/                 # Distributed tracing
│   │   │   └── types/                 # TypeScript interfaces
│   │   └── assets/
│   │
│   ├── sports-yeti-admin/             # React Native Web admin dashboard
│   │   ├── src/
│   │   │   ├── screens/               # 15+ screens across 8 domains
│   │   │   │   ├── auth/              # Admin login
│   │   │   │   ├── dashboard/         # Overview dashboard
│   │   │   │   ├── leagues/           # List, Detail, Form
│   │   │   │   ├── teams/             # List, Detail
│   │   │   │   ├── players/           # List, Detail
│   │   │   │   ├── facilities/        # List, Detail, Form
│   │   │   │   ├── bookings/          # Booking calendar
│   │   │   │   ├── payments/          # List, Detail
│   │   │   │   └── audit/             # Audit log viewer
│   │   │   ├── components/            # Sidebar, Modals (Booking, Refund, Audit)
│   │   │   ├── navigation/            # Auth, Main, Root navigators
│   │   │   ├── services/              # API client, storage
│   │   │   ├── stores/                # Zustand auth store
│   │   │   └── types/                 # TypeScript interfaces
│   │   └── assets/
│   │
│   └── sports-yeti-e2e/              # E2E tests (Playwright)
│
├── project/prompts/                   # Design docs, scope, task plans
├── docs/                             # CI/CD setup docs
├── ui/                               # Shared UI components
├── .github/workflows/                # CI + staging deploy
├── nx.json                           # Nx configuration
├── package.json                      # Root dependencies
└── tasks.md                          # Development task tracking
```

---

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Sports-Yeti/sports-yeti.git
cd sports-yeti

# Install Node.js dependencies
npm install --legacy-peer-deps
```

---

### API Backend (Laravel)

#### 1. Navigate to API directory

```bash
cd apps/sports-yeti-api
```

#### 2. Install PHP dependencies

```bash
composer install
```

#### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Generate JWT secret
php artisan jwt:secret
```

#### 4. Configure Environment Variables

Edit `.env` with your database and service credentials:

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sports_yeti
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_TTL=60

# Stripe (get from https://dashboard.stripe.com)
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Observability (optional for local dev)
OTEL_ENABLED=false
PROMETHEUS_ENABLED=true
PROMETHEUS_STORAGE=memory
```

#### 5. Database Setup

```bash
# Create the database (PostgreSQL)
createdb sports_yeti

# Run migrations
php artisan migrate

# Seed with roles, permissions, and test data
php artisan db:seed
```

#### 6. Start the Development Server

```bash
# Start Laravel development server
php artisan serve
# API available at http://localhost:8000
```

#### 7. (Optional) Start Queue Worker

```bash
# In a separate terminal — processes reconciliation jobs, notifications, etc.
php artisan queue:work
```

#### 8. (Optional) Start Stripe Webhook Forwarding

```bash
# Install Stripe CLI: brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
# Copy the whsec_xxx secret to your .env STRIPE_WEBHOOK_SECRET
```

#### API Health Check

```bash
curl http://localhost:8000/api/v1/health
```

```json
{
  "status": "healthy",
  "timestamp": "2026-01-29T12:00:00+00:00",
  "version": "v1"
}
```

---

### Mobile App (React Native)

#### 1. Configure API URL

```bash
cd apps/sports-yeti
cp .env.example .env
```

Edit `.env` — for a physical device, use your machine's local IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.xxx:8000/api/v1
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
EXPO_PUBLIC_APP_VERSION=1.0.0
```

#### 2. Start the Development Server

```bash
# From workspace root
npx nx serve sports-yeti

# Or directly
cd apps/sports-yeti && npx expo start
```

#### 3. Run on Device/Simulator

- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`
- **Physical Device:** Scan the QR code with Expo Go

---

### Admin Dashboard (React Native Web)

The admin app is web-only and is best run **directly on your host** for the fastest HMR and best debugging experience. A Dockerised dev variant is available as a fallback for contributors who don't have Node installed locally.

#### 1. Configure API URL

The admin app connects to the same Laravel API. Update the API base URL in `src/constants/index.ts` or via environment variables.

#### 2. Start the Development Server (recommended: local)

```bash
npx nx start sports-yeti-admin
```

Open `http://localhost:19006` — Metro hot-reloads on save. Source maps point to your real files, so the Cursor/VS Code Node debugger and browser devtools work out of the box.

#### 2a. (Alternative) Run inside Docker

For a one-command setup with no host Node requirement:

```bash
docker compose --profile docker-admin up -d admin
docker logs -f sports-yeti-admin
```

Tradeoff: rebuilds the image whenever `package-lock.json` changes (~4 min `npm ci`) and file watching goes through Docker's macOS file-sharing layer.

#### 3. Production Bundle Smoke Test

To exercise the static export that ships to staging/prod:

```bash
docker compose --profile prod up -d --build admin-prod
# Open http://localhost:19007
```

#### Admin Features

- **Dashboard** — League statistics, recent activity, quick actions
- **Leagues** — Create, edit, view league details and stats
- **Teams** — Team listing with search/filter, team details and roster
- **Players** — Player listing with search/filter, player details
- **Facilities** — Facility management with space configuration
- **Bookings** — Calendar view with day/week/month modes, create and manage bookings
- **Payments** — Payment history with filters, initiate refunds, view details
- **Audit Logs** — Filterable audit log viewer with trace ID support

---

## Environment Variables

### API (`apps/sports-yeti-api/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_KEY` | Laravel application key | Yes |
| `DB_CONNECTION` | Database driver (`pgsql`) | Yes |
| `DB_HOST` | Database host | Yes |
| `DB_DATABASE` | Database name | Yes |
| `DB_USERNAME` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_TTL` | JWT token lifetime in minutes | Yes |
| `STRIPE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For webhooks |
| `REDIS_HOST` | Redis host | Optional |
| `REDIS_PORT` | Redis port | Optional |
| `MAIL_MAILER` | Mail driver (`log`, `smtp`, etc.) | For emails |
| `OTEL_ENABLED` | Enable OpenTelemetry tracing | Optional |
| `OTEL_SERVICE_NAME` | Service name for traces | Optional |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP collector endpoint | Optional |
| `PROMETHEUS_ENABLED` | Enable Prometheus metrics | Optional |
| `PROMETHEUS_STORAGE` | Prometheus storage (`memory` or `redis`) | Optional |

### Mobile App (`apps/sports-yeti/.env`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | API base URL (e.g., `http://localhost:8000/api/v1`) |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN for crash reporting |
| `EXPO_PUBLIC_APP_VERSION` | App version for Sentry release tracking |

---

## Running Tests

### API Tests (PHPUnit)

```bash
cd apps/sports-yeti-api

# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/AuthControllerTest.php

# Run specific test method
php artisan test --filter=test_user_can_register
```

**Current test coverage:**
- `AuthControllerTest` — Registration, login, token refresh, logout
- `BookingControllerTest` — CRUD, conflict detection, check-in
- `PaymentControllerTest` — Intent creation, confirmation, refunds
- `GameControllerTest` — CRUD, attendance, scheduling
- `AuditControllerTest` — Log retrieval, filtering, stats
- `TenantScopeTest` — Multi-tenancy isolation
- `PostControllerTest` — Social feed CRUD, likes
- `CommentControllerTest` — Comment threading, moderation
- `LeagueNewsControllerTest` — News CRUD, publish/unpublish

### Mobile App Tests (Jest)

```bash
# From workspace root
npx nx test sports-yeti

# Or directly
cd apps/sports-yeti && npm test
```

### Admin Dashboard Tests (Jest)

```bash
# From workspace root
npx nx test sports-yeti-admin

# Or directly
cd apps/sports-yeti-admin && npm test
```

### Load Tests (k6)

```bash
# Install k6: brew install k6 (macOS) or see tests/load/README.md

# Auth endpoints (100 RPS target, p95 < 300ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-auth.js

# Booking endpoints (50 RPS, p95 < 500ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-bookings.js

# Payment endpoints (25 RPS, p95 < 1s)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-payments.js

# Game/listing endpoints (75 RPS, p95 < 300ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-games.js

# Chat endpoints (50 RPS, p95 < 500ms)
k6 run --env API_URL=http://localhost:8000/api/v1 tests/load/k6-chat.js
```

See `tests/load/README.md` for full setup instructions and SLO thresholds.

### E2E Tests (Playwright)

```bash
npx nx e2e sports-yeti-e2e
```

### Linting

```bash
# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint sports-yeti
npx nx lint sports-yeti-admin
```

---

## API Documentation

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

The API uses JWT Bearer tokens:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login and get JWT token | No |
| GET | `/auth/me` | Get current user profile | Yes |
| POST | `/auth/refresh` | Refresh JWT token | Yes |
| POST | `/auth/logout` | Invalidate token | Yes |

#### Leagues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leagues` | List leagues |
| POST | `/leagues` | Create league |
| GET | `/leagues/{id}` | Get league details |
| PUT | `/leagues/{id}` | Update league |
| DELETE | `/leagues/{id}` | Delete league |
| GET | `/leagues/{id}/stats` | Get league statistics |

#### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teams` | List teams |
| POST | `/teams` | Create team |
| GET | `/teams/{id}` | Get team details |
| PUT | `/teams/{id}` | Update team |
| DELETE | `/teams/{id}` | Delete team |
| POST | `/teams/{id}/members` | Add team member |
| DELETE | `/teams/{id}/members/{playerId}` | Remove team member |

#### Players
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/players` | List players (with search/filter) |
| GET | `/players/me` | Get current player profile |
| GET | `/players/{id}` | Get player details |
| PUT | `/players/{id}` | Update player profile |

#### Facilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/facilities` | List facilities |
| POST | `/facilities` | Create facility |
| GET | `/facilities/{id}` | Get facility details |
| PUT | `/facilities/{id}` | Update facility |
| DELETE | `/facilities/{id}` | Delete facility |

#### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | List bookings |
| POST | `/bookings` | Create booking (with conflict detection) |
| GET | `/bookings/{id}` | Get booking details |
| POST | `/bookings/{id}/cancel` | Cancel booking |
| POST | `/bookings/check-in` | QR code check-in |

#### Camps
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/camps` | List camps |
| POST | `/camps` | Create camp |
| GET | `/camps/{id}` | Get camp details |
| PUT | `/camps/{id}` | Update camp |
| DELETE | `/camps/{id}` | Delete camp |
| POST | `/camps/{id}/register` | Register for camp |
| DELETE | `/camps/{id}/register` | Unregister from camp |

#### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/games` | List games |
| POST | `/games` | Create game |
| GET | `/games/{id}` | Get game details |
| PUT | `/games/{id}` | Update game |
| DELETE | `/games/{id}` | Delete game |
| POST | `/games/{id}/attendance` | Respond to attendance |

#### Chat (Real-time SSE)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats/{id}` | Get chat details |
| GET | `/chats/{id}/messages` | List chat messages |
| POST | `/chats/{id}/messages` | Send message |
| DELETE | `/chats/{id}/messages/{msgId}` | Delete message |
| GET | `/chats/{id}/polls` | List polls |
| POST | `/chats/{id}/polls` | Create attendance poll |
| POST | `/chats/{id}/polls/{pollId}/vote` | Vote on poll |
| POST | `/chats/{id}/polls/{pollId}/close` | Close poll |
| GET | `/chats/{id}/stream` | SSE real-time stream |

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| POST | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/mark-all-read` | Mark all as read |
| DELETE | `/notifications/{id}` | Delete notification |
| DELETE | `/notifications/clear` | Clear all |
| PUT | `/notifications/push-token` | Update push token |
| PUT | `/notifications/preferences` | Update preferences |

#### Payments (Stripe)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments |
| GET | `/payments/{id}` | Get payment details |
| POST | `/payments/intent` | Create payment intent |
| POST | `/payments/{id}/confirm` | Confirm payment |
| POST | `/payments/{id}/refund` | Refund payment (admin) |

#### Social Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List posts |
| POST | `/posts` | Create post |
| GET | `/posts/{id}` | Get post details |
| PUT | `/posts/{id}` | Update post |
| DELETE | `/posts/{id}` | Delete post |
| POST | `/posts/{id}/like` | Like post |
| DELETE | `/posts/{id}/like` | Unlike post |
| GET | `/posts/{id}/comments` | Get post comments |

#### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/comments` | List comments |
| POST | `/comments` | Create comment |
| GET | `/comments/{id}` | Get comment details |
| PUT | `/comments/{id}` | Update comment |
| DELETE | `/comments/{id}` | Delete comment |
| GET | `/comments/{id}/replies` | Get replies |

#### League News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leagues/{id}/news` | List league news |
| POST | `/leagues/{id}/news` | Create news article |
| GET | `/leagues/{id}/news/{newsId}` | Get news article |
| PUT | `/leagues/{id}/news/{newsId}` | Update news article |
| DELETE | `/leagues/{id}/news/{newsId}` | Delete news article |
| POST | `/leagues/{id}/news/{newsId}/publish` | Publish article |
| POST | `/leagues/{id}/news/{newsId}/unpublish` | Unpublish article |

#### Audit Logs (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit` | List audit entries (tenant-scoped) |
| GET | `/audit/stats` | Get audit statistics |
| GET | `/audit/subject-types` | List audited entity types |
| GET | `/audit/{id}` | Get audit entry details |

#### Webhooks (External)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/webhooks/stripe` | Stripe webhook handler | HMAC |

#### Metrics (Public)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/metrics` | Prometheus metrics | No |

### Error Responses (RFC 7807)

All errors follow the Problem+JSON format:

```json
{
  "type": "https://httpstatuses.com/422",
  "title": "Validation Error",
  "status": 422,
  "detail": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## Observability

The platform includes a full observability stack:

### Distributed Tracing (OpenTelemetry)

- **Backend:** `TraceRequest` middleware adds trace context to all API requests
- **Mobile:** `traceparent` header propagated from mobile app to backend
- **Configuration:** `config/opentelemetry.php` — supports Jaeger, Grafana Tempo, Honeycomb, New Relic

```env
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Metrics (Prometheus)

- **Middleware:** `PrometheusMetrics` tracks RED metrics (Rate, Errors, Duration) per endpoint
- **Endpoint:** `GET /metrics` exposes Prometheus-format metrics
- **Configuration:** `config/prometheus.php`

### Crash Reporting (Mobile)

- **Sentry** integration in the mobile app for crash reporting and session tracking
- Error boundary wraps the entire app for React error capture
- Distributed tracing links mobile errors to backend spans

### SLOs

Service Level Objectives are documented in `apps/sports-yeti-api/docs/slo-definitions.md`.

### Security & Hardening

- **Security audit checklist:** `apps/sports-yeti-api/docs/security-audit-checklist.md` — OWASP ASVS L2 aligned
- **Chaos test scenarios:** `tests/chaos/scenarios.md` — 7 fault injection scenarios with expected behaviors
- **Operational runbooks:** `apps/sports-yeti-api/docs/runbooks/` — Incident response procedures

---

## CI/CD

### GitHub Actions Workflows

#### `ci.yml` — Continuous Integration

Runs on every push to `main` and all pull requests:

1. **API Tests** — PHP 8.2 + MySQL + Redis, runs PHPUnit with code style checks (Laravel Pint)
2. **Mobile Build Verification** — TypeScript type check, lint, unit tests, Expo web export
3. **Nx Workspace** — Runs lint, test, build, and e2e across all projects

#### `deploy-staging.yml` — Staging Deployment

Runs on push to `main` or `staging/**` branches, with manual trigger support:

- Detects changed applications (API, mobile, admin)
- Deploys API to staging environment
- Builds mobile preview via EAS
- Deploys admin dashboard

---

## Common Commands

### Nx

```bash
npx nx show projects                  # List all projects
npx nx run-many -t build              # Build all
npx nx run-many -t lint               # Lint all
npx nx run-many -t test               # Test all
npx nx graph                          # Visualize project graph
```

### Laravel

```bash
php artisan serve                              # Start dev server
php artisan test                               # Run tests
php artisan migrate                            # Run migrations
php artisan db:seed                            # Seed database
php artisan db:seed --class=RolesAndPermissionsSeeder  # Seed roles only
php artisan queue:work                         # Start queue worker
php artisan route:list --path=api              # List API routes
php artisan cache:clear && php artisan config:clear    # Clear caches
```

### Expo / Mobile

```bash
npx expo start                        # Start dev server
npx expo start --clear                # Start with cache clear
npx expo start --web                  # Start for web
eas build --platform ios              # EAS build for iOS
eas build --platform android          # EAS build for Android
```

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

### Commit Message Format

```
type(scope): description

feat(api): Add payment reconciliation job
fix(mobile): Fix login screen validation
docs: Update README with setup instructions
test(api): Add booking controller tests
chore(devops): Update CI workflow
```

---

## Troubleshooting

### API Issues

**Database connection failed:**
- Ensure PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check if database exists: `psql -l`

**JWT token errors:**
- Regenerate JWT secret: `php artisan jwt:secret`
- Clear config cache: `php artisan config:clear`

**Permission errors:**
- Run seeder: `php artisan db:seed --class=RolesAndPermissionsSeeder`
- Clear permission cache: `php artisan permission:cache-reset`

**Stripe webhook failures:**
- Verify `STRIPE_WEBHOOK_SECRET` matches the Stripe CLI output
- Check webhook signature: invalid signatures are rejected with 403

### Mobile App Issues

**Metro bundler errors:**
- Clear cache: `npx expo start --clear`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`

**API connection failed:**
- Verify API is running at the configured URL
- For physical device, use machine IP (not `localhost`)
- Check `EXPO_PUBLIC_API_URL` in `.env`

**Sentry not reporting:**
- Verify `EXPO_PUBLIC_SENTRY_DSN` is set in `.env`
- Check Sentry project settings for the correct DSN

### Admin Dashboard Issues

**Web build errors:**
- Ensure React Native Web is properly installed
- Clear Metro cache: `npx expo start --web --clear`
- Check for missing peer dependencies

**Auth not working:**
- Verify the API base URL points to the running Laravel server
- Check browser console for CORS errors
- Ensure JWT token is being stored correctly in AsyncStorage/localStorage

### Observability Issues

**Traces not appearing:**
- Verify `OTEL_ENABLED=true` in API `.env`
- Check that the OTLP endpoint is reachable
- Ensure the collector (Jaeger/Tempo) is running

**Prometheus metrics empty:**
- Verify `PROMETHEUS_ENABLED=true`
- Check `GET /metrics` endpoint directly
- For Redis storage, ensure Redis is running

---

## License

MIT License — see LICENSE file for details.
