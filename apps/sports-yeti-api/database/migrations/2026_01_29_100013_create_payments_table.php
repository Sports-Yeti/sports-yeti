<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('league_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->decimal('fee_amount', 10, 2)->default(0);
            $table->decimal('net_amount', 10, 2)->default(0);
            $table->string('currency')->default('USD');
            $table->string('type'); // league_registration, camp_registration, facility_booking, refund
            $table->string('status')->default('pending'); // pending, processing, completed, failed, refunded
            $table->string('payment_method')->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_charge_id')->nullable();
            $table->string('stripe_refund_id')->nullable();
            $table->string('idempotency_key')->nullable();
            $table->morphs('payable'); // polymorphic relation to booking, camp_registration, team_member
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('league_id')->references('id')->on('leagues')->onDelete('set null');
            $table->unique('idempotency_key');
            $table->index('user_id');
            $table->index('league_id');
            $table->index('status');
            $table->index('type');
            $table->index('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
