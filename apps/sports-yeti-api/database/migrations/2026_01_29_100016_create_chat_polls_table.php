<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_polls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('chat_id');
            $table->uuid('message_id')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('question');
            $table->json('options'); // array of option strings
            $table->string('poll_type')->default('attendance'); // attendance, general, decision
            $table->boolean('is_anonymous')->default(false);
            $table->boolean('allows_multiple')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            $table->foreign('chat_id')->references('id')->on('chats')->onDelete('cascade');
            $table->foreign('message_id')->references('id')->on('chat_messages')->onDelete('set null');
            $table->index('chat_id');
            $table->index('is_closed');
        });

        Schema::create('chat_poll_votes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('poll_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('option_index');
            $table->timestamps();

            $table->foreign('poll_id')->references('id')->on('chat_polls')->onDelete('cascade');
            $table->unique(['poll_id', 'user_id', 'option_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_poll_votes');
        Schema::dropIfExists('chat_polls');
    }
};
