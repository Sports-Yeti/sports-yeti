<?php

declare(strict_types=1);

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CreateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('bookings.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'space_id' => ['required', 'uuid', 'exists:spaces,id'],
            'start_time' => ['required', 'date', 'after:now'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'purpose' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'idempotency_key' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'space_id.required' => 'Please select a space to book',
            'space_id.exists' => 'The selected space does not exist',
            'start_time.required' => 'Start time is required',
            'start_time.after' => 'Start time must be in the future',
            'end_time.required' => 'End time is required',
            'end_time.after' => 'End time must be after start time',
        ];
    }
}
