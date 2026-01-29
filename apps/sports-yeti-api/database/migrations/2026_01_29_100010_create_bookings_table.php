<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('space_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('status')->default('pending'); // pending, confirmed, cancelled, completed
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('qr_code')->nullable();
            $table->string('qr_code_url')->nullable();
            $table->uuid('payment_id')->nullable();
            $table->string('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->string('idempotency_key')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('space_id')->references('id')->on('spaces')->onDelete('cascade');
            $table->unique('idempotency_key');
            $table->index('space_id');
            $table->index('user_id');
            $table->index('status');
            $table->index(['start_time', 'end_time']);
            $table->index('qr_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
