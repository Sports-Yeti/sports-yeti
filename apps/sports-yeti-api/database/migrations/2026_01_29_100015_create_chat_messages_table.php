<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('chat_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->string('message_type')->default('text'); // text, image, poll, system
            $table->string('media_url')->nullable();
            $table->uuid('reply_to_id')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('chat_id')->references('id')->on('chats')->onDelete('cascade');
            $table->index('chat_id');
            $table->index('user_id');
            $table->index('created_at');
        });

        // Self-referencing foreign key must be added after table creation
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->foreign('reply_to_id')->references('id')->on('chat_messages')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
