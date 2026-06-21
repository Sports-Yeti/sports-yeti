<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Ai\Agents\HighlightAnalyzer;
use App\Models\Highlight;
use App\Models\HighlightClip;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\X264;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Files\Document;

class GenerateHighlightsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 2;

    public int $backoff = 60;

    public int $timeout = 600;

    public function __construct(
        public Highlight $highlight
    ) {}

    public function handle(): void
    {
        $this->highlight->update(['status' => 'processing']);

        try {
            $disk = config('highlights.storage_disk', 'public');
            $videoPath = Storage::disk($disk)->path($this->highlight->source_video_path);

            $ffmpeg = FFMpeg::create();
            $video = $ffmpeg->open($videoPath);
            $duration = $video->getStreams()->videos()->first()->get('duration');

            $this->highlight->update(['source_video_duration' => (float) $duration]);

            $storedFile = Document::fromPath($videoPath)->put(provider: Lab::Gemini);

            $agent = new HighlightAnalyzer(
                videoDuration: (float) $duration,
                sportContext: 'general sports',
                maxClips: config('highlights.max_clips_per_highlight', 15),
            );

            $response = $agent->prompt(
                'Analyze this sports video and identify the highlight moments.',
                attachments: [
                    Document::fromId($storedFile->id),
                ],
            );

            $analysis = [
                'highlights' => $response['highlights'],
                'summary' => $response['summary'],
            ];

            $this->highlight->update(['analysis' => $analysis]);

            $clipsDir = "highlights/{$this->highlight->id}/clips";
            $thumbsDir = "highlights/{$this->highlight->id}/thumbs";
            Storage::disk($disk)->makeDirectory($clipsDir);
            Storage::disk($disk)->makeDirectory($thumbsDir);

            $highlights = collect($analysis['highlights'])
                ->sortByDesc('excitement_score')
                ->values();

            foreach ($highlights as $index => $clip) {
                $startTime = max(0, (float) $clip['start_time']);
                $endTime = min((float) $duration, (float) $clip['end_time']);
                $clipDuration = $endTime - $startTime;

                if ($clipDuration < 1) {
                    continue;
                }

                $clipFilename = sprintf('clip_%02d.mp4', $index + 1);
                $clipPath = "{$clipsDir}/{$clipFilename}";
                $clipFullPath = Storage::disk($disk)->path($clipPath);

                $clipVideo = $ffmpeg->open($videoPath);
                $clipVideo->filters()->clip(
                    TimeCode::fromSeconds($startTime),
                    TimeCode::fromSeconds($clipDuration),
                );
                $clipVideo->save(new X264('aac', 'libx264'), $clipFullPath);

                $thumbFilename = sprintf('thumb_%02d.jpg', $index + 1);
                $thumbPath = "{$thumbsDir}/{$thumbFilename}";
                $thumbFullPath = Storage::disk($disk)->path($thumbPath);

                $midpoint = $startTime + ($clipDuration / 2);
                $thumbVideo = $ffmpeg->open($videoPath);
                $frame = $thumbVideo->frame(TimeCode::fromSeconds($midpoint));
                $frame->save($thumbFullPath);

                HighlightClip::create([
                    'highlight_id' => $this->highlight->id,
                    'clip_path' => $clipPath,
                    'thumbnail_path' => $thumbPath,
                    'title' => $clip['title'],
                    'description' => $clip['description'],
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'excitement_score' => $clip['excitement_score'],
                    'sort_order' => $index,
                ]);
            }

            try {
                Document::fromId($storedFile->id)->delete(provider: Lab::Gemini);
            } catch (\Throwable $e) {
                Log::warning('Failed to clean up Gemini file', ['error' => $e->getMessage()]);
            }

            $this->highlight->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Highlight generation failed', [
                'highlight_id' => $this->highlight->id,
                'error' => $e->getMessage(),
            ]);

            $this->highlight->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
