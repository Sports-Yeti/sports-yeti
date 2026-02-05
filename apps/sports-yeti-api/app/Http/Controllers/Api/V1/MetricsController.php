<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;

class MetricsController extends Controller
{
    protected CollectorRegistry $registry;

    public function __construct(CollectorRegistry $registry)
    {
        $this->registry = $registry;
    }

    /**
     * Expose Prometheus metrics endpoint.
     *
     * @return Response
     */
    public function __invoke(): Response
    {
        if (!config('prometheus.enabled')) {
            return response('Metrics disabled', 503);
        }

        $renderer = new RenderTextFormat();
        $result = $renderer->render($this->registry->getMetricFamilySamples());

        return response($result, 200, [
            'Content-Type' => RenderTextFormat::MIME_TYPE,
        ]);
    }
}
