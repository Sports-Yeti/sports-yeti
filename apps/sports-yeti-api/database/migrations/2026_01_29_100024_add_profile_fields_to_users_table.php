<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_url')->nullable()->after('phone');
            $table->string('timezone')->default('America/New_York')->after('avatar_url');
            $table->boolean('is_active')->default(true)->after('timezone');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->string('stripe_customer_id')->nullable()->after('last_login_at');
            $table->string('expo_push_token')->nullable()->after('stripe_customer_id');
            $table->json('notification_preferences')->nullable()->after('expo_push_token');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar_url',
                'timezone',
                'is_active',
                'last_login_at',
                'stripe_customer_id',
                'expo_push_token',
                'notification_preferences',
                'deleted_at',
            ]);
        });
    }
};
