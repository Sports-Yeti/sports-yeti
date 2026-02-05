# Service Level Objectives (SLOs)

This document defines the Service Level Objectives for the Sports Yeti API. These SLOs represent the target reliability and performance metrics we aim to maintain.

## Overview

| Service | SLI | SLO Target | Measurement Window |
|---------|-----|------------|-------------------|
| API Availability | Success Rate | 99.9% | 30 days |
| API Latency | P95 Response Time | < 500ms | 30 days |
| API Latency | P99 Response Time | < 1000ms | 30 days |
| Authentication | Success Rate | 99.95% | 30 days |
| Payments | Success Rate | 99.99% | 30 days |
| Real-time Chat (SSE) | Connection Success | 99.5% | 30 days |

---

## Detailed SLO Definitions

### 1. API Availability

**Service Level Indicator (SLI):**
- Ratio of successful HTTP responses (2xx, 3xx, 4xx) to total requests
- Excludes 5xx errors which indicate service failures

**SLO Target:** 99.9% availability (43.8 minutes downtime/month)

**Error Budget:** 0.1% (approximately 44 minutes per 30-day window)

**Prometheus Query:**
```promql
sum(rate(sports_yeti_api_http_requests_total{status_class!="5xx"}[5m]))
/
sum(rate(sports_yeti_api_http_requests_total[5m]))
```

**Alert Thresholds:**
- Warning: < 99.95% over 5 minutes
- Critical: < 99.9% over 5 minutes

---

### 2. API Latency - P95

**Service Level Indicator (SLI):**
- 95th percentile of HTTP request duration

**SLO Target:** P95 < 500ms

**Prometheus Query:**
```promql
histogram_quantile(0.95, 
  sum(rate(sports_yeti_api_http_request_duration_seconds_bucket[5m])) by (le)
)
```

**Alert Thresholds:**
- Warning: P95 > 400ms for 5 minutes
- Critical: P95 > 500ms for 5 minutes

---

### 3. API Latency - P99

**Service Level Indicator (SLI):**
- 99th percentile of HTTP request duration

**SLO Target:** P99 < 1000ms

**Prometheus Query:**
```promql
histogram_quantile(0.99, 
  sum(rate(sports_yeti_api_http_request_duration_seconds_bucket[5m])) by (le)
)
```

**Alert Thresholds:**
- Warning: P99 > 800ms for 5 minutes
- Critical: P99 > 1000ms for 5 minutes

---

### 4. Authentication Success Rate

**Service Level Indicator (SLI):**
- Ratio of successful authentication requests to total authentication requests
- Includes login, register, token refresh endpoints

**SLO Target:** 99.95% success rate

**Prometheus Query:**
```promql
sum(rate(sports_yeti_api_http_requests_total{route=~"v1/auth/.*", status_class!="5xx"}[5m]))
/
sum(rate(sports_yeti_api_http_requests_total{route=~"v1/auth/.*"}[5m]))
```

**Alert Thresholds:**
- Warning: < 99.97% over 5 minutes
- Critical: < 99.95% over 5 minutes

---

### 5. Payment Processing Success Rate

**Service Level Indicator (SLI):**
- Ratio of successful payment operations to total payment operations
- Critical business metric - higher reliability requirement

**SLO Target:** 99.99% success rate (< 1 failure per 10,000 transactions)

**Prometheus Query:**
```promql
sum(rate(sports_yeti_api_http_requests_total{route=~"v1/payments/.*", status_class!="5xx"}[5m]))
/
sum(rate(sports_yeti_api_http_requests_total{route=~"v1/payments/.*"}[5m]))
```

**Alert Thresholds:**
- Warning: < 99.995% over 5 minutes
- Critical: < 99.99% over 5 minutes

---

### 6. Real-time Chat (SSE) Connection Success

**Service Level Indicator (SLI):**
- Ratio of successful SSE connection establishments to total connection attempts

**SLO Target:** 99.5% connection success rate

**Prometheus Query:**
```promql
sum(rate(sports_yeti_api_http_requests_total{route=~"v1/chats/.*/stream", status="200"}[5m]))
/
sum(rate(sports_yeti_api_http_requests_total{route=~"v1/chats/.*/stream"}[5m]))
```

**Alert Thresholds:**
- Warning: < 99.7% over 5 minutes
- Critical: < 99.5% over 5 minutes

---

## Endpoint-Specific Latency Targets

| Endpoint Category | P95 Target | P99 Target |
|------------------|------------|------------|
| Health Check | 10ms | 50ms |
| Authentication | 200ms | 500ms |
| List Endpoints (GET /games, /teams, etc.) | 300ms | 800ms |
| Detail Endpoints (GET /games/{id}) | 200ms | 500ms |
| Create/Update (POST, PUT) | 400ms | 1000ms |
| Payment Operations | 1000ms | 2000ms |
| SSE Stream Establishment | 500ms | 1000ms |

---

## Error Budget Policy

### Error Budget Calculation

```
Error Budget = 1 - SLO Target
Monthly Budget (minutes) = Error Budget × 30 days × 24 hours × 60 minutes
```

For 99.9% SLO:
- Error Budget: 0.1%
- Monthly Budget: ~43.8 minutes

### Error Budget Actions

| Remaining Budget | Action |
|-----------------|--------|
| > 50% | Normal development velocity |
| 25-50% | Prioritize reliability work |
| 10-25% | Freeze non-critical deployments |
| < 10% | Incident response mode, all hands on reliability |
| 0% (Exhausted) | Full feature freeze, focus on recovery |

---

## Alerting Strategy

### Multi-Window, Multi-Burn-Rate Alerts

We use burn rate alerts to balance between alert fatigue and quick detection:

| Severity | Burn Rate | Short Window | Long Window |
|----------|-----------|--------------|-------------|
| Critical | 14.4x | 1 hour | 5 minutes |
| Warning | 6x | 6 hours | 30 minutes |
| Ticket | 1x | 3 days | 6 hours |

**Example Alert (Critical):**
```yaml
- alert: HighErrorBurnRate
  expr: |
    (
      sum(rate(sports_yeti_api_http_requests_total{status_class="5xx"}[1h]))
      / sum(rate(sports_yeti_api_http_requests_total[1h]))
    ) > (14.4 * 0.001)
    and
    (
      sum(rate(sports_yeti_api_http_requests_total{status_class="5xx"}[5m]))
      / sum(rate(sports_yeti_api_http_requests_total[5m]))
    ) > (14.4 * 0.001)
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: High error burn rate detected
    description: Error rate is consuming error budget 14.4x faster than allowed
```

---

## Dashboards

### Recommended Grafana Dashboards

1. **SLO Overview Dashboard**
   - Current SLO compliance percentage
   - Error budget remaining
   - Burn rate trends

2. **API Performance Dashboard**
   - Request rate by endpoint
   - Latency histograms (P50, P95, P99)
   - Error rate by status code

3. **Business Metrics Dashboard**
   - Payment success rate
   - Active users
   - Booking completion rate

---

## Monitoring Infrastructure

### Metrics Collection

- **Prometheus**: Primary metrics storage
  - Endpoint: `/metrics` (exposed by API)
  - Scrape interval: 15 seconds
  
### Distributed Tracing

- **OpenTelemetry**: Trace collection
  - Exporter: OTLP to Jaeger/Tempo
  - Sampling: 100% in development, 10% in production
  
### Logging

- **Structured JSON Logs**: Correlation with traces
  - Format: JSON with trace_id, span_id
  - Aggregation: Loki/Elasticsearch

---

## Review Cadence

- **Weekly**: Review SLO compliance, error budget consumption
- **Monthly**: Adjust SLO targets if needed, review trends
- **Quarterly**: Full SLO review, add/remove SLOs as needed

---

## Appendix: Prometheus Recording Rules

```yaml
groups:
  - name: slo_recording_rules
    rules:
      # Request success rate
      - record: sports_yeti:http_requests:success_rate_5m
        expr: |
          sum(rate(sports_yeti_api_http_requests_total{status_class!="5xx"}[5m]))
          / sum(rate(sports_yeti_api_http_requests_total[5m]))

      # P95 latency
      - record: sports_yeti:http_requests:latency_p95_5m
        expr: |
          histogram_quantile(0.95, 
            sum(rate(sports_yeti_api_http_request_duration_seconds_bucket[5m])) by (le)
          )

      # P99 latency
      - record: sports_yeti:http_requests:latency_p99_5m
        expr: |
          histogram_quantile(0.99, 
            sum(rate(sports_yeti_api_http_request_duration_seconds_bucket[5m])) by (le)
          )

      # Error budget remaining (30-day window)
      - record: sports_yeti:error_budget:remaining
        expr: |
          1 - (
            (1 - sports_yeti:http_requests:success_rate_5m) / 0.001
          )
```
