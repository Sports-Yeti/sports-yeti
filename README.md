# 🏀 Sports Yeti

A comprehensive sports community platform for basketball league management, featuring team organization, facility booking, camp management, and real-time chat.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [API Backend](#api-backend-laravel)
  - [Mobile App](#mobile-app-react-native)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## Overview

Sports Yeti is a full-stack sports management platform consisting of:

- **Laravel 11 API** - RESTful backend with JWT authentication, Stripe payments, and real-time SSE
- **React Native Mobile App** - Cross-platform mobile app built with Expo
- **React Native Web Admin** - Admin dashboard (coming soon)

### Key Features

- 🏆 League & team management
- 👤 Player profiles and discovery
- 🏟️ Facility booking with QR check-in
- ⛺ Training camp management
- 💳 Stripe payment processing
- 💬 Real-time chat with attendance polls
- 🔔 Push notifications
- 📊 Admin dashboard

---

## Tech Stack

### Backend
- **Framework:** Laravel 11 (PHP 8.2+)
- **Database:** PostgreSQL
- **Cache/Queue:** Redis
- **Authentication:** JWT (tymon/jwt-auth)
- **Payments:** Stripe
- **Real-time:** Server-Sent Events (SSE)

### Mobile
- **Framework:** React Native with Expo
- **Navigation:** React Navigation
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **HTTP Client:** Axios

### DevOps
- **Monorepo:** Nx
- **CI/CD:** GitHub Actions
- **Testing:** PHPUnit (API), Jest (Mobile)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** >= 20.x
- **npm** >= 10.x
- **PHP** >= 8.2
- **Composer** >= 2.x
- **PostgreSQL** >= 14

### Optional (for mobile development)
- **iOS:** Xcode (macOS only)
- **Android:** Android Studio with SDK
- **Expo Go** app on your mobile device

### Recommended Tools
- **Redis** (for caching and queues)
- **Stripe CLI** (for webhook testing)

---

## Project Structure

```
sports-yeti/
├── apps/
│   ├── sports-yeti-api/          # Laravel API backend
│   │   ├── app/
│   │   │   ├── Http/Controllers/Api/V1/
│   │   │   ├── Models/
│   │   │   ├── Policies/
│   │   │   ├── Services/
│   │   │   └── Jobs/
│   │   ├── database/
│   │   │   ├── factories/
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   ├── routes/
│   │   └── tests/
│   │
│   ├── sports-yeti/              # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   └── assets/
│   │
│   └── sports-yeti-e2e/          # E2E tests
│
├── project/
│   └── prompts/                  # Project documentation
│
├── ui/                           # Shared UI components
│
├── nx.json                       # Nx configuration
├── package.json                  # Root dependencies
└── README.md
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

# Redis (optional)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### 5. Database Setup

```bash
# Create the database (PostgreSQL)
createdb sports_yeti

# Run migrations
php artisan migrate

# Seed with test data (includes roles and permissions)
php artisan db:seed
```

#### 6. Start the Development Server

```bash
# Start Laravel development server
php artisan serve

# The API will be available at http://localhost:8000
```

#### 7. (Optional) Start Queue Worker

```bash
# In a separate terminal
php artisan queue:work
```

#### API Health Check

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-29T12:00:00+00:00",
  "version": "v1"
}
```

---

### Mobile App (React Native)

#### 1. Navigate to Mobile App Directory

```bash
cd apps/sports-yeti
```

#### 2. Configure API URL

Create or edit the environment configuration:

```bash
# The API URL is configured in src/constants/index.ts
# Default: http://localhost:8000/api/v1
```

For local development with a physical device, update the API URL to your machine's IP:

```typescript
// src/constants/index.ts
export const API_BASE_URL = 'http://192.168.1.xxx:8000/api/v1';
```

#### 3. Start the Development Server

```bash
# From the workspace root
npx nx serve sports-yeti

# Or from the app directory
cd apps/sports-yeti
npx expo start
```

#### 4. Run on Device/Simulator

After starting Expo:

- **iOS Simulator:** Press `i` in the terminal
- **Android Emulator:** Press `a` in the terminal
- **Physical Device:** Scan the QR code with Expo Go app

#### 5. Alternative: Run with Nx

```bash
# From workspace root
npx nx run sports-yeti:start

# Run on iOS
npx nx run sports-yeti:run-ios

# Run on Android
npx nx run sports-yeti:run-android
```

---

## Environment Variables

### API (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_KEY` | Laravel application key | Yes |
| `DB_CONNECTION` | Database driver (pgsql) | Yes |
| `DB_HOST` | Database host | Yes |
| `DB_DATABASE` | Database name | Yes |
| `DB_USERNAME` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_TTL` | JWT token lifetime (minutes) | Yes |
| `STRIPE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For webhooks |
| `REDIS_HOST` | Redis host | Optional |
| `MAIL_MAILER` | Mail driver | For emails |

### Mobile App

Environment variables are managed through Expo constants or a `.env` file:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | API base URL |

---

## Running Tests

### API Tests

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

### Mobile Tests

```bash
# From workspace root
npx nx test sports-yeti

# Or from app directory
cd apps/sports-yeti
npm test
```

### E2E Tests

```bash
# Run Playwright E2E tests
npx nx e2e sports-yeti-e2e
```

### Linting

```bash
# Lint all projects
npx nx run-many -t lint

# Lint specific project
npx nx lint sports-yeti
npx nx lint sports-yeti-api
```

---

## API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication

The API uses JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get token |
| GET | `/auth/me` | Get current user |
| POST | `/auth/refresh` | Refresh JWT token |
| GET | `/leagues` | List leagues |
| GET | `/teams` | List teams |
| GET | `/players` | List players |
| GET | `/facilities` | List facilities |
| POST | `/bookings` | Create booking |
| GET | `/games` | List games |
| GET | `/chats/{id}/stream` | SSE chat stream |
| POST | `/payments/intent` | Create payment intent |

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

## Stripe Webhook Testing

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe

# Copy the webhook signing secret and add to .env
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Common Commands

### Nx Commands

```bash
# List all projects
npx nx show projects

# Run command on all projects
npx nx run-many -t build
npx nx run-many -t lint
npx nx run-many -t test

# Visualize project graph
npx nx graph
```

### Laravel Commands

```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# List routes
php artisan route:list --path=api

# Create new migration
php artisan make:migration create_example_table

# Run specific seeder
php artisan db:seed --class=RolesAndPermissionsSeeder
```

### Expo Commands

```bash
# Start development server
npx expo start

# Clear cache and start
npx expo start --clear

# Build for production
npx expo build:ios
npx expo build:android

# EAS Build
eas build --platform ios
eas build --platform android
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
```

---

## Troubleshooting

### API Issues

**Database connection failed:**
- Ensure PostgreSQL is running
- Verify credentials in `.env`
- Check if database exists: `psql -l`

**JWT token errors:**
- Regenerate JWT secret: `php artisan jwt:secret`
- Clear config cache: `php artisan config:clear`

**Permission errors:**
- Run seeder: `php artisan db:seed --class=RolesAndPermissionsSeeder`
- Clear permission cache: `php artisan permission:cache-reset`

### Mobile App Issues

**Metro bundler errors:**
- Clear cache: `npx expo start --clear`
- Delete `node_modules` and reinstall

**API connection failed:**
- Verify API is running
- Check API URL in constants
- For physical device, use machine IP (not localhost)

**Build errors:**
- Update Expo: `npx expo install --fix`
- Check for conflicting dependencies

---

## License

MIT License - see LICENSE file for details.

---

## Support

For questions or issues, please open a GitHub issue or contact the development team.
