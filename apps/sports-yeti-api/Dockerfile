# =============================================================================
# Stage 1: Composer dependencies
# =============================================================================
FROM composer:2 AS composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-dev

# =============================================================================
# Stage 2: Frontend assets
# =============================================================================
FROM node:20-alpine AS node

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY vite.config.js postcss.config.js tailwind.config.js ./
COPY resources/ resources/

RUN npm run build

# =============================================================================
# Stage 3: Runtime (PHP 8.4-FPM + Nginx)
# =============================================================================
FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    linux-headers \
    $PHPIZE_DEPS

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        pgsql \
        bcmath \
        gd \
        mbstring \
        zip \
        exif \
        intl \
        opcache \
        pcntl

RUN pecl install redis && docker-php-ext-enable redis

RUN apk del $PHPIZE_DEPS linux-headers

RUN mkdir -p /run/nginx

WORKDIR /var/www/html

COPY --from=composer /app/vendor ./vendor
COPY --from=node /app/public/build ./public/build
COPY . .

RUN mkdir -p storage/framework/{cache,sessions,testing,views} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache

RUN chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini

EXPOSE 8000

ENTRYPOINT ["entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
