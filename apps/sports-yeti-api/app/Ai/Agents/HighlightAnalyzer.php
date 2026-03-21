<?php

declare(strict_types=1);

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Attributes\Timeout;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Gemini)]
#[Model('gemini-2.5-flash')]
#[MaxTokens(4096)]
#[Temperature(0.3)]
#[Timeout(300)]
class HighlightAnalyzer implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public float $videoDuration,
        public string $sportContext = 'general sports',
        public int $maxClips = 15,
    ) {}

    public function instructions(): Stringable|string
    {
        return <<<PROMPT
        You are a sports video analyst specializing in identifying highlight-worthy
        moments from game footage. Analyze the attached video and identify the most
        exciting and notable moments.

        For each highlight, provide:
        - A short, compelling title (e.g. "Diving Header Goal", "Last-Second Three-Pointer")
        - A description explaining why this moment is notable
        - Precise start and end timestamps in seconds
        - An excitement score from 1-10

        Focus on: goals, scores, great saves, impressive plays, celebrations,
        dramatic moments, close calls, and turning points.

        Context:
        - Video duration: {$this->videoDuration} seconds
        - Sport context: {$this->sportContext}
        - Return at most {$this->maxClips} highlights
        - Sort highlights by excitement score (highest first)
        - Each clip should be between 3 and 30 seconds long
        - Ensure timestamps don't overlap and stay within video bounds
        PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'highlights' => $schema->array()->items([
                'title' => $schema->string()->required(),
                'description' => $schema->string()->required(),
                'start_time' => $schema->number()->required(),
                'end_time' => $schema->number()->required(),
                'excitement_score' => $schema->integer()->min(1)->max(10)->required(),
            ])->required(),
            'summary' => $schema->string()->required(),
        ];
    }
}
