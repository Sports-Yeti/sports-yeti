<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Game;
use App\Models\GameParticipant;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendGameRemindersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NotificationService $notificationService): void
    {
        $games = Game::withoutGlobalScopes()
            ->where('status', 'scheduled')
            ->whereBetween('scheduled_at', [now()->addHours(23), now()->addHours(25)])
            ->with(['team1:id,name', 'team2:id,name', 'facility:id,name'])
            ->get();

        Log::info("SendGameRemindersJob: Found {$games->count()} games needing reminders.");

        foreach ($games as $game) {
            $participants = GameParticipant::where('game_id', $game->id)
                ->with('player.user')
                ->get();

            $gameName = ($game->team1->name ?? 'Team 1').' vs '.($game->team2->name ?? 'Team 2');
            $venue = $game->facility->name ?? 'TBD';
            $scheduledAt = $game->scheduled_at->format('M j, Y g:i A');

            foreach ($participants as $participant) {
                $user = $participant->player?->user;
                if ($user) {
                    $notificationService->sendGameReminder(
                        $user,
                        $game->id,
                        $gameName,
                        $scheduledAt,
                        $venue
                    );
                }
            }
        }
    }
}
