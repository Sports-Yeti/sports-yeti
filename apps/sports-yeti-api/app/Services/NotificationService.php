<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function send(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $actionUrl = null,
        string $channel = 'in_app'
    ): Notification {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'action_url' => $actionUrl,
            'channel' => $channel,
            'sent_at' => now(),
        ]);

        // Send push notification if enabled
        if ($channel === 'push' || $channel === 'in_app') {
            $this->sendPushNotification($user, $title, $message, $data);
        }

        // Send email notification if enabled
        if ($channel === 'email') {
            $this->sendEmailNotification($user, $title, $message);
        }

        return $notification;
    }

    public function sendToMany(
        array $userIds,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $actionUrl = null
    ): int {
        $count = 0;

        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user) {
                $this->send($user, $type, $title, $message, $data, $actionUrl);
                $count++;
            }
        }

        return $count;
    }

    public function sendGameReminder(
        User $user,
        string $gameId,
        string $gameName,
        string $scheduledAt,
        string $venue
    ): Notification {
        return $this->send(
            $user,
            'game_reminder',
            'Game Reminder',
            "Don't forget! {$gameName} is scheduled for {$scheduledAt} at {$venue}.",
            [
                'game_id' => $gameId,
                'scheduled_at' => $scheduledAt,
                'venue' => $venue,
            ],
            "/games/{$gameId}"
        );
    }

    public function sendPaymentConfirmation(
        User $user,
        string $paymentId,
        float $amount,
        string $description
    ): Notification {
        return $this->send(
            $user,
            'payment_confirmation',
            'Payment Confirmed',
            "Your payment of \${$amount} for {$description} has been confirmed.",
            [
                'payment_id' => $paymentId,
                'amount' => $amount,
                'description' => $description,
            ],
            "/payments/{$paymentId}"
        );
    }

    public function sendChatMessage(
        User $user,
        string $chatId,
        string $senderName,
        string $messagePreview
    ): Notification {
        return $this->send(
            $user,
            'chat_message',
            "New message from {$senderName}",
            $messagePreview,
            [
                'chat_id' => $chatId,
                'sender_name' => $senderName,
            ],
            "/chats/{$chatId}"
        );
    }

    public function sendTeamInvitation(
        User $user,
        string $teamId,
        string $teamName,
        string $inviterName
    ): Notification {
        return $this->send(
            $user,
            'team_invitation',
            'Team Invitation',
            "{$inviterName} has invited you to join {$teamName}.",
            [
                'team_id' => $teamId,
                'team_name' => $teamName,
                'inviter_name' => $inviterName,
            ],
            "/teams/{$teamId}"
        );
    }

    public function sendBookingStatusUpdate(
        User $user,
        string $bookingId,
        string $newStatus,
        string $facilityName
    ): Notification {
        $statusLabel = ucfirst($newStatus);

        return $this->send(
            $user,
            'booking_status',
            "Booking {$statusLabel}",
            "Your booking at {$facilityName} has been {$newStatus}.",
            [
                'booking_id' => $bookingId,
                'status' => $newStatus,
            ],
            "/bookings/{$bookingId}"
        );
    }

    public function sendPaymentReminder(
        User $user,
        string $description,
        float $amount,
        ?array $data = null
    ): Notification {
        return $this->send(
            $user,
            'payment_reminder',
            'Payment Reminder',
            "You have an outstanding payment of \${$amount} for {$description}.",
            $data,
            '/payments'
        );
    }

    private function sendPushNotification(
        User $user,
        string $title,
        string $body,
        ?array $data = null
    ): void {
        if (! $user->expo_push_token) {
            return;
        }

        // Check user preferences
        $preferences = $user->notification_preferences ?? [];
        if (isset($preferences['push_notifications']) && ! $preferences['push_notifications']) {
            return;
        }

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', [
                'to' => $user->expo_push_token,
                'title' => $title,
                'body' => $body,
                'data' => $data ?? [],
                'sound' => 'default',
            ]);

            if (! $response->successful()) {
                Log::warning('Failed to send push notification', [
                    'user_id' => $user->id,
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Push notification error', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function sendEmailNotification(
        User $user,
        string $title,
        string $message
    ): void {
        // Check user preferences
        $preferences = $user->notification_preferences ?? [];
        if (isset($preferences['email_notifications']) && ! $preferences['email_notifications']) {
            return;
        }

        // TODO: Implement email sending with Laravel Mail
        // This would use Laravel's built-in mail system
        Log::info('Email notification queued', [
            'user_id' => $user->id,
            'title' => $title,
        ]);
    }
}
