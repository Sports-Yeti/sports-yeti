#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
    echo "No .env file found — copying .env.example"
    cp .env.example .env
fi

if grep -q "^APP_KEY=$" .env 2>/dev/null; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

if ! grep -q "^JWT_SECRET=" .env 2>/dev/null; then
    echo "Generating JWT secret..."
    php artisan jwt:secret --force
fi

echo "Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Running migrations..."
php artisan migrate --force

mkdir -p /var/log/supervisor

exec "$@"
