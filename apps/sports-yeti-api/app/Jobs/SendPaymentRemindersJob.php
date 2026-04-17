<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\CampRegistration;
use App\Models\League;
use App\Models\TeamMember;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPaymentRemindersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NotificationService $notificationService): void
    {
        $pendingMembers = TeamMember::where('payment_status', 'pending')
            ->where('created_at', '<', now()->subDays(3))
            ->with(['player.user', 'team'])
            ->get();

        Log::info("SendPaymentRemindersJob: Found {$pendingMembers->count()} pending team payments.");

        foreach ($pendingMembers as $member) {
            $user = $member->player?->user;
            $team = $member->team;
            if (! $user || ! $team) {
                continue;
            }

            $league = League::find($team->league_id);
            $rosterSize = TeamMember::where('team_id', $team->id)->count();
            $amount = $rosterSize > 0 ? round((float) ($league->registration_fee ?? 0) / $rosterSize, 2) : 0;

            $notificationService->sendPaymentReminder(
                $user,
                "league registration for {$team->name}",
                $amount,
                ['team_id' => $team->id, 'league_id' => $team->league_id]
            );
        }

        $pendingCampRegs = CampRegistration::where('payment_status', 'pending')
            ->where('created_at', '<', now()->subDays(3))
            ->with(['player.user', 'camp'])
            ->get();

        Log::info("SendPaymentRemindersJob: Found {$pendingCampRegs->count()} pending camp payments.");

        foreach ($pendingCampRegs as $reg) {
            $user = $reg->player?->user;
            $camp = $reg->camp;
            if (! $user || ! $camp) {
                continue;
            }

            $notificationService->sendPaymentReminder(
                $user,
                "registration for {$camp->name}",
                (float) $camp->registration_fee,
                ['camp_id' => $camp->id]
            );
        }
    }
}
