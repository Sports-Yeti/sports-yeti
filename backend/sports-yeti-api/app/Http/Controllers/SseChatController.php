<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SseChatController extends Controller
{
    public function stream(Request $request, int $leagueId)
    {
        $lastEventId = $request->headers->get('Last-Event-ID');
        return new StreamedResponse(function () use ($lastEventId) {
            echo ": heartbeat\n\n";
            if ($lastEventId) {
                echo "id: {$lastEventId}\n";
            }
            echo "event: ready\n";
            echo "data: {\"ok\":true}\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    public function publish(Request $request, int $leagueId)
    {
        $payload = $request->validate([
            'message' => ['required', 'string'],
        ]);
        return response()->json(['ok' => true, 'echo' => $payload['message']]);
    }
}


