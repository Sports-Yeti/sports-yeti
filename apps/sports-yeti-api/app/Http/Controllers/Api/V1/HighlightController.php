<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateHighlightsJob;
use App\Models\Highlight;
use App\Models\HighlightClip;
use App\Models\Payment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class HighlightController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->get('per_page', 20), 100);

        $highlights = Highlight::where('user_id', auth()->id())
            ->with('clips')
            ->withCount('clips')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $highlights->items(),
            'meta' => [
                'current_page' => $highlights->currentPage(),
                'last_page' => $highlights->lastPage(),
                'per_page' => $highlights->perPage(),
                'total' => $highlights->total(),
            ],
        ]);
    }

    public function show(Highlight $highlight): JsonResponse
    {
        if ($highlight->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot view this highlight.',
            ], 403);
        }

        $highlight->load('clips');

        $disk = config('highlights.storage_disk', 'public');
        $clips = $highlight->clips->map(function (HighlightClip $clip) use ($disk) {
            return array_merge($clip->toArray(), [
                'clip_url' => Storage::disk($disk)->url($clip->clip_path),
                'thumbnail_url' => $clip->thumbnail_path
                    ? Storage::disk($disk)->url($clip->thumbnail_path)
                    : null,
            ]);
        });

        return response()->json([
            'data' => array_merge($highlight->toArray(), [
                'clips' => $clips,
            ]),
        ]);
    }

    public function uploadVideo(Request $request): JsonResponse
    {
        $maxSize = config('highlights.max_video_size_mb', 200) * 1024;

        $validator = Validator::make($request->all(), [
            'video' => ['required', 'file', 'mimetypes:video/mp4,video/quicktime,video/x-msvideo,video/webm', "max:{$maxSize}"],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $disk = config('highlights.storage_disk', 'public');
        $path = $request->file('video')->store(
            'highlights/uploads/'.auth()->id(),
            $disk
        );

        return response()->json([
            'data' => [
                'video_path' => $path,
                'price' => config('highlights.price', 1.99),
                'currency' => config('highlights.currency', 'usd'),
            ],
        ], 201);
    }

    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'video_path' => ['required', 'string'],
            'payment_intent_id' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $disk = config('highlights.storage_disk', 'public');
        if (! Storage::disk($disk)->exists($request->video_path)) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Video file not found.',
            ], 404);
        }

        $payment = Payment::where('stripe_payment_intent_id', $request->payment_intent_id)
            ->where('user_id', auth()->id())
            ->where('type', 'highlight_generation')
            ->first();

        if (! $payment || $payment->status !== 'completed') {
            return response()->json([
                'type' => 'https://httpstatuses.io/402',
                'title' => 'Payment Required',
                'status' => 402,
                'detail' => 'A completed payment is required to generate highlights.',
            ], 402);
        }

        $highlight = Highlight::create([
            'user_id' => auth()->id(),
            'status' => 'processing',
            'source_video_path' => $request->video_path,
            'stripe_payment_intent_id' => $request->payment_intent_id,
        ]);

        $payment->update([
            'payable_type' => Highlight::class,
            'payable_id' => $highlight->id,
        ]);

        GenerateHighlightsJob::dispatch($highlight);

        return response()->json([
            'data' => $highlight,
        ], 202);
    }

    public function downloadClip(Highlight $highlight, HighlightClip $clip): JsonResponse
    {
        if ($highlight->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot access this highlight.',
            ], 403);
        }

        if ($clip->highlight_id !== $highlight->id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Clip not found in this highlight.',
            ], 404);
        }

        $disk = config('highlights.storage_disk', 'public');
        $url = Storage::disk($disk)->temporaryUrl($clip->clip_path, now()->addMinutes(30));

        return response()->json([
            'data' => [
                'download_url' => $url,
                'expires_at' => now()->addMinutes(30)->toIso8601String(),
                'filename' => basename($clip->clip_path),
            ],
        ]);
    }

    public function shareToFeed(Request $request, Highlight $highlight): JsonResponse
    {
        if ($highlight->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot share this highlight.',
            ], 403);
        }

        if (! $highlight->isCompleted()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Only completed highlights can be shared.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'caption' => ['nullable', 'string', 'max:5000'],
            'clip_ids' => ['required', 'array', 'min:1'],
            'clip_ids.*' => ['uuid', 'exists:highlight_clips,id'],
            'visibility' => ['nullable', 'string', 'in:public,league,team'],
            'league_id' => ['nullable', 'uuid', 'exists:leagues,id'],
            'team_id' => ['nullable', 'uuid', 'exists:teams,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $disk = config('highlights.storage_disk', 'public');
        $clips = HighlightClip::whereIn('id', $request->clip_ids)
            ->where('highlight_id', $highlight->id)
            ->orderBy('sort_order')
            ->get();

        $mediaUrls = $clips->map(fn (HighlightClip $clip) => Storage::disk($disk)->url($clip->clip_path))->values()->toArray();

        $summary = $highlight->analysis['summary'] ?? '';
        $content = $request->caption ?: $summary;

        $post = Post::create([
            'user_id' => auth()->id(),
            'content' => $content,
            'media_urls' => $mediaUrls,
            'post_type' => 'post',
            'visibility' => $request->visibility ?? 'public',
            'league_id' => $request->league_id,
            'team_id' => $request->team_id,
        ]);

        $highlight->update(['post_id' => $post->id]);

        $post->load(['user', 'league', 'team']);

        return response()->json([
            'data' => $post,
        ], 201);
    }

    public function destroy(Highlight $highlight): JsonResponse
    {
        if ($highlight->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot delete this highlight.',
            ], 403);
        }

        $highlight->delete();

        return response()->json(null, 204);
    }
}
