# Production Monitoring Setup Guide

This guide explains the complete monitoring and observability stack for the Hotel Booking System, demonstrating production-grade DevOps practices.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   .NET API   │─────▶│  Prometheus  │─────┐               │
│  │  (Metrics)   │      │  (Scraper)   │     │               │
│  └──────────────┘      └──────────────┘     │               │
│         │                                    ▼               │
│         │                            ┌──────────────┐        │
│         │                            │   Grafana    │        │
│         │                            │ (Dashboards) │        │
│         │                            └──────────────┘        │
│         │                                                     │
│         │ (Structured Logs)                                  │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │Elasticsearch │◀─────│    Kibana    │                     │
│  │   (Storage)  │      │ (Visualization)                    │
│  └──────────────┘      └──────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Prometheus (Metrics Collection)
- **Purpose**: Time-series metrics database
- **Port**: 9090
- **Scrapes**: .NET API `/metrics` endpoint every 10 seconds
- **Retention**: Default 15 days

**Metrics Collected**:
- HTTP request rates and durations
- Business metrics (bookings, payments, searches)
- System metrics (CPU, memory, GC)
- Custom application metrics

### 2. Grafana (Metrics Visualization)
- **Purpose**: Metrics dashboards and alerting
- **Port**: 3000
- **Default Credentials**: admin/admin
- **Pre-configured**: Prometheus datasource + Hotel Booking dashboard

**Dashboard Panels**:
- HTTP Request Rate (by method and status code)
- Request Duration (p50, p95, p99)
- Business KPIs (bookings, active users, revenue)
- System Resources (CPU, memory)
- Service Health Status

### 3. Elasticsearch (Log Storage)
- **Purpose**: Centralized log storage and search
- **Port**: 9200
- **Index Pattern**: `hotel-logs-YYYY.MM.DD`
- **Retention**: Configure based on disk space

### 4. Kibana (Log Visualization)
- **Purpose**: Log exploration and analysis
- **Port**: 5601
- **Features**: Full-text search, filtering, aggregations

## Quick Start

### 1. Start the Full Stack

```bash
# Windows
docker-compose -f docker-compose.prod.yml up -d

# Verify all services are running
docker-compose -f docker-compose.prod.yml ps
```

### 2. Access Monitoring Tools

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Kibana | http://localhost:5601 | - |
| API Metrics | http://localhost:5000/metrics | - |
| API Health | http://localhost:5000/health | - |

### 3. View Metrics in Grafana

1. Open http://localhost:3000
2. Login with admin/admin
3. Navigate to Dashboards → "Hotel Booking System - Production Metrics"
4. Explore real-time metrics

### 4. View Logs in Kibana

1. Open http://localhost:5601
2. Go to Management → Stack Management → Index Patterns
3. Create index pattern: `hotel-logs-*`
4. Go to Discover to explore logs
5. Use filters: `level:Error` or `SourceContext:*Controller`

## Metrics Reference

### HTTP Metrics (Automatic)
```
http_requests_received_total          # Total HTTP requests
http_request_duration_seconds         # Request duration histogram
http_requests_in_progress             # Current in-flight requests
```

### Business Metrics (Custom)
```
hotel_bookings_created_total          # Total bookings created
hotel_bookings_cancelled_total        # Total bookings cancelled
hotel_payments_success_total          # Successful payments
hotel_payments_failed_total           # Failed payments
hotel_payment_amount_total            # Total revenue in INR
hotel_active_users                    # Active users (24h window)
hotel_searches_total                  # Hotel search count
hotel_booking_processing_seconds      # Booking processing time
hotel_user_registrations_total        # New user registrations
```

### System Metrics (Automatic)
```
process_cpu_seconds_total             # CPU usage
process_working_set_bytes             # Memory usage
dotnet_collection_count_total         # GC collections
dotnet_total_memory_bytes             # .NET memory
```

## Querying Metrics (PromQL Examples)

### Request Rate
```promql
rate(http_requests_received_total[5m])
```

### Error Rate
```promql
rate(http_requests_received_total{code=~"5.."}[5m])
```

### 95th Percentile Latency
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Booking Success Rate
```promql
rate(hotel_bookings_created_total[5m]) / 
(rate(hotel_bookings_created_total[5m]) + rate(hotel_bookings_cancelled_total[5m]))
```

### Payment Success Rate
```promql
rate(hotel_payments_success_total[5m]) / 
(rate(hotel_payments_success_total[5m]) + rate(hotel_payments_failed_total[5m]))
```

## Log Queries (Kibana)

### Find Errors
```
level:Error
```

### Payment Failures
```
SourceContext:*PaymentService* AND level:Warning
```

### Slow Requests (if logged)
```
message:"took" AND message:>1000ms
```

### User Activity
```
SourceContext:*AuthController* AND message:"logged in"
```

## Production Best Practices

### 1. Alerting Rules
Create alerts in Grafana for:
- High error rate (>5% of requests)
- High latency (p95 > 2s)
- Low booking success rate (<90%)
- Service down (up == 0)
- High memory usage (>80%)

### 2. Log Retention
Configure Elasticsearch ILM (Index Lifecycle Management):
```json
{
  "policy": {
    "phases": {
      "hot": { "min_age": "0ms", "actions": {} },
      "delete": { "min_age": "30d", "actions": { "delete": {} } }
    }
  }
}
```

### 3. Metrics Retention
Update Prometheus retention in docker-compose:
```yaml
command:
  - "--storage.tsdb.retention.time=30d"
  - "--storage.tsdb.retention.size=10GB"
```

### 4. Security Hardening
- Change default Grafana password
- Enable authentication on Prometheus
- Use HTTPS in production
- Restrict network access to monitoring ports
- Use secrets management for credentials

### 5. Resource Limits
Add resource constraints in docker-compose:
```yaml
services:
  prometheus:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
```

## Troubleshooting

### Prometheus Not Scraping
1. Check target status: http://localhost:9090/targets
2. Verify API is exposing metrics: http://localhost:5000/metrics
3. Check network connectivity between containers

### No Logs in Elasticsearch
1. Check Elasticsearch health: http://localhost:9200/_cluster/health
2. Verify API environment variable: `ElasticsearchUrl=http://hotel-elasticsearch:9200`
3. Check API logs for Serilog errors

### Grafana Dashboard Empty
1. Verify Prometheus datasource is configured
2. Check time range (default: last 1 hour)
3. Generate some traffic to the API
4. Refresh dashboard

### High Memory Usage
1. Reduce Elasticsearch heap: `ES_JAVA_OPTS=-Xms256m -Xmx256m`
2. Reduce Prometheus retention period
3. Limit log verbosity in production

## Performance Tuning

### Optimize Scrape Intervals
```yaml
# prometheus.yml
global:
  scrape_interval: 30s  # Increase for less load
```

### Reduce Log Volume
```csharp
// Program.cs - Production logging
.MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
.MinimumLevel.Override("System", LogEventLevel.Warning)
```

### Index Optimization
```bash
# Reduce Elasticsearch replicas for single-node
curl -X PUT "localhost:9200/hotel-logs-*/_settings" -H 'Content-Type: application/json' -d'
{
  "index": {
    "number_of_replicas": 0
  }
}'
```

## Monitoring Checklist

- [ ] All services start successfully
- [ ] Prometheus scraping API metrics
- [ ] Grafana dashboard showing data
- [ ] Logs appearing in Kibana
- [ ] Health endpoint responding
- [ ] Alerts configured
- [ ] Retention policies set
- [ ] Security hardened
- [ ] Resource limits configured
- [ ] Documentation updated

## Next Steps

1. **Custom Dashboards**: Create role-specific dashboards (Dev, Ops, Business)
2. **Alerting**: Set up Grafana alerts with email/Slack notifications
3. **Distributed Tracing**: Add OpenTelemetry for request tracing
4. **APM**: Consider adding Application Performance Monitoring
5. **Log Aggregation**: Add structured logging for better analysis
6. **Metrics Export**: Export metrics to cloud monitoring (CloudWatch, Azure Monitor)

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Serilog Best Practices](https://github.com/serilog/serilog/wiki/Best-Practices)
- [prometheus-net Library](https://github.com/prometheus-net/prometheus-net)
