<?php

declare(strict_types=1);

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentIntentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('payments.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.50', 'max:999999.99'],
            'type' => ['required', 'string', 'in:booking,camp,league,membership,other'],
            'payable_type' => ['required_with:payable_id', 'string'],
            'payable_id' => ['required_with:payable_type', 'uuid'],
            'description' => ['nullable', 'string', 'max:500'],
            'idempotency_key' => ['required', 'string', 'max:255', 'unique:payments,idempotency_key'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'Payment amount is required',
            'amount.min' => 'Minimum payment amount is $0.50',
            'amount.max' => 'Maximum payment amount is $999,999.99',
            'type.required' => 'Payment type is required',
            'type.in' => 'Invalid payment type',
            'idempotency_key.required' => 'Idempotency key is required for payment requests',
            'idempotency_key.unique' => 'This payment has already been processed',
        ];
    }
}
