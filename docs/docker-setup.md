# Docker Setup Guide

Run the Sports Yeti monorepo entirely in Docker containers — no Laravel Herd, local PHP, or local PostgreSQL required.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v4.x+) with Docker Compose v2
- ~4 GB of free disk space for images and volumes
- Node.js 20+ (only needed if you also run the Expo mobile app locally)

## Architecture

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| **api** | `sports-yeti-api` | `8000` | Laravel API (PHP-FPM + Nginx) |
| **queue-worker** | `sports-yeti-queue` | — | Background job processing |
| **scheduler** | `sports-yeti-scheduler` | — | Laravel task scheduler |
| **postgres** | `sports-yeti-postgres` | `5432` | PostgreSQL 16 database |
| **redis** | `sports-yeti-redis` | `6379` | Redis 7 (cache, queue, sessions) |
| **mailpit** | `sports-yeti-mailpit` | `8025` / `1025` | Email testing UI / SMTP |
| **admin** | `sports-yeti-admin` | `19006` | Admin dashboard (Expo web) |

## Quick Start

### 1. Build and start all services

```bash
docker compose up -d --build
```

The first build takes a few minutes to pull images and compile PHP extensions. Subsequent starts are fast.

### 2. First-time setup

After the containers are running for the first time, generate a JWT secret and seed the database:

```bash
# Generate JWT secret for authentication
docker compose exec api php artisan jwt:secret --force

# Seed the database with initial data
docker compose exec api php artisan db:seed
```

The entrypoint script automatically handles:
- Copying `.env.example` to `.env` if no `.env` exists
- Generating `APP_KEY` if it is empty
- Running `php artisan migrate --force`
- Caching config, routes, and views

### 3. Verify everything is running

```bash
docker compose ps
```

All services should show as "running" or "healthy".

## Accessing Services

| Service | URL |
|---------|-----|
| **API** | http://localhost:8000 |
| **API Health Check** | http://localhost:8000/api/v1/health |
| **Admin Dashboard** | http://localhost:19006 |
| **Mailpit UI** | http://localhost:8025 |
| **PostgreSQL** | `localhost:5432` (user: `sports_yeti`, pass: `secret`, db: `sports_yeti`) |
| **Redis** | `localhost:6379` |

## Connecting the Expo Mobile App

The Expo mobile app runs natively on your device or simulator — it is **not** containerized. To connect it to the Dockerized API:

### On iOS Simulator (same machine)

```bash
cd apps/sports-yeti
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1 npx expo start
```

### On a Physical Device

Find your machine's local IP address:

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

Then start the Expo app pointing at that IP:

```bash
cd apps/sports-yeti
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1 npx expo start
```

Or update `apps/sports-yeti/.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1
```

## Common Commands

### Artisan Commands

```bash
# Run any artisan command
docker compose exec api php artisan <command>

# Open a Tinker REPL
docker compose exec api php artisan tinker

# Run migrations
docker compose exec api php artisan migrate

# Rollback migrations
docker compose exec api php artisan migrate:rollback

# Fresh migration + seed
docker compose exec api php artisan migrate:fresh --seed

# Clear all caches
docker compose exec api php artisan optimize:clear
```

### Composer

```bash
# Install a package
docker compose exec api composer require some/package

# Update dependencies
docker compose exec api composer update

# Dump autoload
docker compose exec api composer dump-autoload
```

### Logs

```bash
# Follow all service logs
docker compose logs -f

# Follow only API logs
docker compose logs -f api

# Follow queue worker logs
docker compose logs -f queue-worker

# View Laravel log file
docker compose exec api tail -f storage/logs/laravel.log
```

### Running Tests

```bash
# Run the full PHP test suite
docker compose exec api php artisan test

# Run a specific test file
docker compose exec api php artisan test --filter=AuthTest
```

### Database Access

```bash
# Open a psql shell
docker compose exec postgres psql -U sports_yeti -d sports_yeti
```

### Redis CLI

```bash
docker compose exec redis redis-cli
```

## Rebuilding

After changing the Dockerfile or adding new PHP extensions:

```bash
docker compose up -d --build api
```

The `queue-worker` and `scheduler` share the same image, so rebuild them too:

```bash
docker compose up -d --build api queue-worker scheduler
```

To rebuild the admin dashboard:

```bash
docker compose up -d --build admin
```

## Customizing Ports

Override any port by setting environment variables before running `docker compose`:

```bash
API_PORT=9000 DB_PORT=5433 docker compose up -d
```

Or create a `.env` file at the project root (Docker Compose reads it automatically):

```
API_PORT=9000
DB_PORT=5433
REDIS_PORT=6380
MAILPIT_UI_PORT=8026
ADMIN_PORT=3000
```

## Stopping and Cleanup

```bash
# Stop all containers (data volumes preserved)
docker compose down

# Stop and remove volumes (database data will be lost)
docker compose down -v

# Remove built images too
docker compose down --rmi local
```

## Troubleshooting

### Port conflicts

If a port is already in use (e.g., a local PostgreSQL on 5432):

```bash
DB_PORT=5433 docker compose up -d
```

Or stop the conflicting local service first.

### Permission issues on storage/

If you see "permission denied" errors for Laravel storage:

```bash
docker compose exec api chmod -R 775 storage bootstrap/cache
docker compose exec api chown -R www-data:www-data storage bootstrap/cache
```

### Container won't start — "migration failed"

The API container runs migrations on startup. If the database isn't ready yet, the health check should prevent this. If it still fails:

```bash
# Check postgres health
docker compose ps postgres

# Restart just the API
docker compose restart api
```

### Stale config cache

After changing `.env.docker`, clear the config cache:

```bash
docker compose exec api php artisan config:clear
docker compose restart api
```

### Full reset

To start completely fresh:

```bash
docker compose down -v
docker compose up -d --build
docker compose exec api php artisan jwt:secret --force
docker compose exec api php artisan db:seed
```
