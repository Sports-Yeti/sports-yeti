# 🏀 Sports Yeti MVP - Multi-Sport Community Platform

A comprehensive sports community platform with league management, facility booking, real-time chat, and gamification features.

## 🎯 MVP Features Implemented

### ✅ Backend API (Laravel 11)
- **Authentication**: JWT-based auth with refresh tokens
- **Multi-tenancy**: League-scoped data isolation
- **API Standards**: RFC7807 errors, cursor pagination, idempotency
- **Real-time Chat**: SSE-based chat with heartbeats and reconnect
- **Observability**: Structured JSON logging, trace correlation
- **Security**: RBAC/ABAC, audit logging, rate limiting

### ✅ Mobile App (React Native + Expo)
- **Navigation**: Bottom tabs with stack navigation
- **Authentication**: JWT token management with auto-refresh
- **Theming**: Sports Yeti blue/white theme with Material Design 3
- **State Management**: Zustand with persistence
- **API Integration**: Axios client with trace propagation
- **Observability**: Trace correlation and error reporting

### ✅ Core Domain Models
- **Users & Players**: Profile management with privacy controls
- **Leagues**: Multi-sport league administration
- **Teams**: Team formation and roster management
- **Games**: Game scheduling with conflict detection
- **Facilities**: Space booking and equipment rental
- **Chat**: Real-time game communication with polls
- **Payments**: Stripe integration scaffold (keys pending)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Admin     │    │   Admin Panel   │
│  (React Native) │    │(React Native Web)│   │(React Native Web)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Laravel API   │
                    │   (v11.45.2)    │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     SQLite      │    │   Redis Cache   │    │   File Storage  │
│   (Dev/Test)    │    │   (Sessions)    │    │     (Local)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- PHP 8.4+
- Node.js 20+
- Composer
- SQLite (dev) / PostgreSQL (prod)
- Redis

### Backend Setup

```bash
cd backend/sports-yeti-api

# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Update .env with your settings

# Generate keys
php artisan key:generate
php artisan jwt:secret

# Set up database
touch database/database.sqlite
php artisan migrate
php artisan db:seed

# Start server
php artisan serve --host=0.0.0.0 --port=8000
```

### Mobile App Setup

```bash
cd apps/sports-yeti

# Install dependencies  
npm install

# Start development server
npx expo start

# For web testing
npx expo start --web
```

## 📊 API Documentation

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "player": {
        "id": 1,
        "experience_level": "beginner",
        "point_balance": 1000
      }
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "base64_encoded_refresh_token",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "message": "User registered successfully"
}
```

#### POST `/api/v1/auth/login`
Authenticate and receive access tokens.

#### GET `/api/v1/auth/profile`
Get authenticated user profile.

### League Endpoints

#### GET `/api/v1/leagues`
List leagues with cursor pagination.

**Query Parameters:**
- `limit`: Number of results (max 100)
- `cursor`: Pagination cursor
- `sport_type`: Filter by sport
- `location`: Filter by location

#### POST `/api/v1/leagues`
Create a new league (requires admin permissions).

#### GET `/api/v1/leagues/{id}`
Get league details with statistics.

### API Standards

#### Error Responses (RFC7807)
All errors follow RFC7807 Problem+JSON format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The request contains invalid or missing data.",
  "instance": "/api/v1/auth/register", 
  "trace_id": "abc123...",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

#### Pagination
Cursor-based pagination with `next_cursor` for efficient large dataset handling.

#### Idempotency
Payments and bookings support `Idempotency-Key` header for safe retries.

#### Rate Limiting
- Auth endpoints: 10 requests/minute per IP
- API endpoints: 100 requests/minute per IP  
- Chat endpoints: 200 requests/minute per IP

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Short-lived access tokens (1 hour)
- **Refresh Tokens**: Long-lived refresh tokens (7 days)
- **RBAC**: Role-based access control with permissions
- **Multi-tenancy**: League-scoped data isolation

### Security Headers
- **Trace ID**: Request correlation for debugging
- **Content-Type**: Proper MIME type enforcement
- **CORS**: Cross-origin request handling

### Audit Logging
All admin actions and sensitive operations are logged with:
- User ID (hashed for privacy)
- Action performed
- Resource affected
- IP address and user agent
- Trace ID for correlation
- League context

## 📈 Observability & Monitoring

### Logging
- **Structured JSON**: All logs in structured format
- **Trace Correlation**: Request tracing across services
- **Privacy**: PII hashing and redaction
- **Context**: User, league, and request metadata

### Metrics (Ready for Datadog)
- **RED Metrics**: Rate, Errors, Duration per endpoint
- **Business Metrics**: Custom metrics for payments, bookings, chat
- **SLO Tracking**: Service level objective monitoring

### Tracing
- **W3C Trace Context**: Standards-compliant distributed tracing
- **Span Correlation**: Frontend to backend trace linking
- **Performance**: Latency and performance monitoring

## 🧪 Testing

### Backend Tests
```bash
cd backend/sports-yeti-api

# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Specific test suites
php artisan test --filter=AuthApiTest
```

### Frontend Tests
```bash
# Run mobile app tests
npx nx test sports-yeti

# Run all tests
npx nx run-many -t test
```

## 🚀 Deployment

### CI/CD Pipeline
- **Automated Testing**: PHPUnit, Jest, E2E tests
- **Code Quality**: Laravel Pint, ESLint, Prettier
- **Security Scanning**: Vulnerability assessment
- **Multi-environment**: Staging and production deployments

### Environment Configuration

#### Production Environment Variables
```bash
# Database
DB_CONNECTION=pgsql
DB_HOST=your-postgres-host
DB_DATABASE=sports_yeti_prod
DB_USERNAME=sports_yeti
DB_PASSWORD=secure-password

# Redis
REDIS_HOST=your-redis-host
REDIS_PASSWORD=redis-password

# Stripe (when keys available)
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Datadog (when configured)
DD_API_KEY=your-datadog-key
DD_SERVICE=sports-yeti-api
DD_ENV=production
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] Redis cache configured
- [ ] File storage configured (S3)
- [ ] Monitoring and alerts configured
- [ ] Backup and recovery tested

## 📋 MVP Task Completion Status

### ✅ Completed (Phase 0-6)
- **P0-1**: MVP scope confirmed and validated
- **F1-5**: API scaffolding with v1 namespace and RFC7807 errors
- **D2-1**: JWT authentication with refresh tokens
- **D2-2**: RBAC/ABAC with policies and middleware
- **D2-3**: Multi-tenancy with league_id scoping
- **F1-3**: Observability baseline with structured logging
- **L3-1**: League CRUD with stats and pagination
- **L3-3**: Player profiles with privacy controls
- **G6-2**: SSE-based chat with heartbeats (framework ready)
- **M7-1**: Mobile app scaffolding with navigation and theming

### 🔄 In Progress
- **F1-1**: CI/CD pipeline configured, needs deployment targets
- **F1-2**: Secrets management (env variables configured, KMS pending)
- **F1-4**: SLOs and alerting (framework ready, Datadog pending)
- **P5-1**: Stripe integration scaffolded (keys pending)
- **W8-1**: Admin web interface (React Native Web conflicts)

### ⏳ Pending (Phase 7-9)
- **B4-1-5**: Facility and booking system
- **P5-2-5**: Payment webhooks and reconciliation
- **G6-1,3,4**: Game scheduling and notifications
- **M7-2-5**: Complete mobile app features
- **W8-2-4**: Complete admin interface
- **H9-1-6**: Hardening, testing, and launch preparation

## 🎮 Demo Credentials

### Admin Account
- **Email**: admin@sportsyeti.com
- **Password**: password
- **Role**: League Admin
- **League**: Downtown Basketball League

### Test Players
- **Email**: player1@example.com to player10@example.com
- **Password**: password (all accounts)
- **Points**: 500-3000 (randomized)

## 🧭 Next Steps

### Immediate (Week 1)
1. **Resolve React version conflicts** for admin interface
2. **Configure Datadog integration** with API keys
3. **Add Stripe test keys** and implement payment flows
4. **Complete facility booking** endpoints and UI
5. **Implement SSE chat** in mobile app

### Short-term (Weeks 2-4)
1. **Complete mobile app screens** (facilities, games, chat)
2. **Admin dashboard** with league management
3. **Payment processing** with webhooks
4. **QR code system** for check-ins
5. **Push notifications** via Expo

### Launch Preparation (Weeks 5-8)
1. **Performance testing** and optimization
2. **Security audit** and penetration testing
3. **Backup and recovery** procedures
4. **Monitoring and alerting** setup
5. **Pilot league** onboarding

## 📞 Support

For technical issues or questions:
- **API Documentation**: Available at `/health` endpoint
- **Trace IDs**: Included in all error responses for debugging
- **Logs**: Structured JSON logs with correlation
- **Monitoring**: Ready for Datadog APM integration

---

**Sports Yeti MVP** - Built with ❤️ for the sports community
