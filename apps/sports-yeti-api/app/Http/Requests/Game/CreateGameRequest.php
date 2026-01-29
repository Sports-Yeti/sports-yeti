<?php

declare(strict_types=1);

namespace App\Http\Requests\Game;

use Illuminate\Foundation\Http\FormRequest;

class CreateGameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('games.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
            'home_team_id' => ['required', 'uuid', 'exists:teams,id'],
            'away_team_id' => ['required', 'uuid', 'exists:teams,id', 'different:home_team_id'],
            'facility_id' => ['required', 'uuid', 'exists:facilities,id'],
            'space_id' => ['nullable', 'uuid', 'exists:spaces,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:300'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'league_id.required' => 'League is required',
            'league_id.exists' => 'Selected league does not exist',
            'home_team_id.required' => 'Home team is required',
            'home_team_id.exists' => 'Selected home team does not exist',
            'away_team_id.required' => 'Away team is required',
            'away_team_id.exists' => 'Selected away team does not exist',
            'away_team_id.different' => 'Home and away teams must be different',
            'facility_id.required' => 'Facility is required',
            'facility_id.exists' => 'Selected facility does not exist',
            'scheduled_at.required' => 'Game date/time is required',
            'scheduled_at.after' => 'Game must be scheduled in the future',
            'duration_minutes.required' => 'Game duration is required',
            'duration_minutes.min' => 'Game must be at least 15 minutes',
            'duration_minutes.max' => 'Game cannot exceed 5 hours',
        ];
    }
}
