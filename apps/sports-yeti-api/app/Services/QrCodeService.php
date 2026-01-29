<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\Game;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{
    public function generateBookingQr(Booking $booking): array
    {
        $code = $this->generateUniqueCode('booking');

        // Generate QR code image
        $qrContent = json_encode([
            'type' => 'booking',
            'code' => $code,
            'booking_id' => $booking->id,
            'space_id' => $booking->space_id,
            'user_id' => $booking->user_id,
        ]);

        $qrImage = QrCode::format('png')
            ->size(300)
            ->errorCorrection('H')
            ->generate($qrContent);

        // Store QR code
        $filename = "qr-codes/bookings/{$booking->id}.png";
        Storage::disk('public')->put($filename, $qrImage);

        return [
            'code' => $code,
            'url' => Storage::disk('public')->url($filename),
        ];
    }

    public function generateGameCheckInQr(Game $game, string $playerId): array
    {
        $code = $this->generateUniqueCode('game');

        $qrContent = json_encode([
            'type' => 'game_checkin',
            'code' => $code,
            'game_id' => $game->id,
            'player_id' => $playerId,
        ]);

        $qrImage = QrCode::format('png')
            ->size(300)
            ->errorCorrection('H')
            ->generate($qrContent);

        $filename = "qr-codes/games/{$game->id}/{$playerId}.png";
        Storage::disk('public')->put($filename, $qrImage);

        return [
            'code' => $code,
            'url' => Storage::disk('public')->url($filename),
        ];
    }

    private function generateUniqueCode(string $prefix): string
    {
        return strtoupper($prefix . '_' . Str::random(12));
    }

    public function validateCode(string $code): ?array
    {
        // Validate QR code structure
        if (!preg_match('/^(BOOKING|GAME)_[A-Z0-9]{12}$/', $code)) {
            return null;
        }

        $type = str_starts_with($code, 'BOOKING_') ? 'booking' : 'game';

        return [
            'type' => $type,
            'code' => $code,
            'valid' => true,
        ];
    }
}
