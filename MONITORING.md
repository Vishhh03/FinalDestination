# 📊 Monitoring & Logging Stack

## Overview

Complete monitoring and logging solution using Prometheus, Grafana, Elasticsearch, and Kibana.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Monitoring Stack                         │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │  Prometheus  │───▶│   Grafana    │    │   Kibana     │ │
│  │   :9090      │    │    :3000     │    │   :5601      │ │
│  │              │    │              │    │              │ │
│  │  Metrics     │    │  Dashboards  │    │  Log Search  │ │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘ │
│         │                                         │         │
│         │ Scrape /metrics                        │ Logs    │
│         ↓                                         ↓         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Backend API (:5000)                      │  │
│  │  - /metrics endpoint                                  │  │
│  │  - Application logs                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Services

### 1. Prometheus (Metrics Collection)
- **Port**: 9090
- **Purpose**: Scrapes and stores metrics
- **Scrape Interval**: 15 seconds
- **Data Retention**: 15 days (default)

### 2. Grafana (Visualization)
- **Port**: 3000
- **Purpose**: Metrics dashboards
- **Default Login**: admin/admin
- **Datasource**: Prometheus (auto-configured)

### 3. Elasticsearch (Log Storage)
- **Port**: 9200
- **Purpose**: Stores application logs
- **Mode**: Single-node
- **Memory**: 512MB heap

### 4. Kibana (Log Analysis)
- **Port**: 5601
- **Purpose**: Log search and visualization
- **Connected to**: Elasticsearch

## Quick Start

### Start All Services
```bash
cd deployment/docker
docker-compose up -d
```

### Access Dashboards
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200

## Prometheus Metrics

### Available Metrics
```
/metrics endpoint returns:
- total_hotels
- total_bookings
- total_users
- total_reviews
- active_bookings
- timestamp
```

### Query Examples

**In Prometheus UI** (http://localhost:9090):

```promql
# Total bookings
total_bookings

# Active bookings
active_bookings

# Hotel count
total_hotels

# Rate of bookings (per minute)
rate(total_bookings[5m])
```

## Grafana Setup

### 1. First Login
```
URL: http://localhost:3000
Username: admin
Password: admin
(Change password on first login)
```

### 2. Verify Datasource
```
1. Go to Configuration → Data Sources
2. Prometheus should be pre-configured
3. Click "Test" to verify connection
```

### 3. Create Dashboard

**Simple Dashboard**:
```
1. Click "+" → Dashboard
2. Add Panel
3. Query: total_bookings
4. Visualization: Stat
5. Save Dashboard
```

**Sample Queries**:
- Total Hotels: `total_hotels`
- Active Bookings: `active_bookings`
- Total Users: `total_users`
- Total Reviews: `total_reviews`

### 4. Import Pre-built Dashboard
```
1. Go to Dashboards → Import
2. Upload JSON or use ID
3. Select Prometheus datasource
4. Import
```

## Kibana Setup

### 1. First Access
```
URL: http://localhost:5601
Wait for Elasticsearch connection (~30 seconds)
```

### 2. Create Index Pattern
```
1. Go to Management → Stack Management
2. Click "Index Patterns"
3. Create index pattern: hotel-logs-*
4. Select timestamp field: @timestamp
5. Create
```

### 3. View Logs
```
1. Go to Analytics → Discover
2. Select index pattern
3. View real-time logs
4. Add filters and search
```

## Application Logging

### Log Levels
```
- Information: General app flow
- Warning: Unexpected events
- Error: Exceptions and errors
- Debug: Detailed diagnostic info
```

### Log Format
```json
{
  "timestamp": "2024-12-20T10:30:00Z",
  "level": "Information",
  "message": "Booking created",
  "properties": {
    "bookingId": 123,
    "userId": 456
  }
}
```

## Monitoring Best Practices

### 1. Key Metrics to Monitor
- Request rate (requests/second)
- Error rate (errors/total requests)
- Response time (p50, p95, p99)
- Active bookings
- Database connections

### 2. Alerting Rules

**In Prometheus** (prometheus.yml):
```yaml
rule_files:
  - 'alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

**Sample Alert** (alerts.yml):
```yaml
groups:
  - name: hotel_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
```

### 3. Dashboard Organization
- **Overview**: System health, key metrics
- **API**: Request rates, response times
- **Database**: Query performance, connections
- **Business**: Bookings, revenue, users

## Troubleshooting

### Prometheus Not Scraping
```bash
# Check Prometheus logs
docker logs hotel-prometheus

# Verify backend /metrics endpoint
curl http://localhost:5000/metrics

# Check prometheus.yml configuration
docker exec hotel-prometheus cat /etc/prometheus/prometheus.yml
```

### Grafana Can't Connect to Prometheus
```bash
# Check Grafana logs
docker logs hotel-grafana

# Verify Prometheus is running
docker ps | grep prometheus

# Test connection from Grafana container
docker exec hotel-grafana wget -O- http://prometheus:9090
```

### Kibana Not Loading
```bash
# Check Elasticsearch is running
curl http://localhost:9200

# Check Kibana logs
docker logs hotel-kibana

# Wait for Elasticsearch to be ready (30-60 seconds)
```

### Elasticsearch Memory Issues
```bash
# Increase heap size in docker-compose.yml
environment:
  - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
```

## Data Retention

### Prometheus
```yaml
# In prometheus.yml
global:
  retention: 15d  # Keep 15 days of data
```

### Elasticsearch
```bash
# Delete old indices (manual)
curl -X DELETE http://localhost:9200/logs-2024-01-*
```

## Performance Impact

### Resource Usage
- Prometheus: ~100MB RAM
- Grafana: ~150MB RAM
- Elasticsearch: ~512MB RAM (configurable)
- Kibana: ~200MB RAM

### Network Overhead
- Prometheus scrapes: ~1KB per scrape (every 15s)
- Minimal impact on application performance

## Security

### Production Recommendations
1. **Change default passwords**
   ```yaml
   grafana:
     environment:
       - GF_SECURITY_ADMIN_PASSWORD=<strong-password>
   ```

2. **Enable authentication**
   ```yaml
   elasticsearch:
     environment:
       - xpack.security.enabled=true
   ```

3. **Use HTTPS**
4. **Restrict network access**
5. **Enable audit logging**

## Backup

### Grafana Dashboards
```bash
# Export dashboard JSON
# Grafana UI → Dashboard → Share → Export → Save to file
```

### Prometheus Data
```bash
# Backup volume
docker run --rm -v finaldestination_prometheus-data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz /data
```

## Monitoring Endpoints

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Backend | /health | Health check |
| Backend | /metrics | Prometheus metrics |
| Prometheus | :9090 | Metrics UI |
| Grafana | :3000 | Dashboards |
| Elasticsearch | :9200 | Log storage API |
| Kibana | :5601 | Log analysis UI |

## Sample Grafana Dashboard JSON

```json
{
  "dashboard": {
    "title": "Hotel Booking System",
    "panels": [
      {
        "title": "Total Bookings",
        "targets": [{"expr": "total_bookings"}],
        "type": "stat"
      },
      {
        "title": "Active Bookings",
        "targets": [{"expr": "active_bookings"}],
        "type": "gauge"
      }
    ]
  }
}
```

## Commands Reference

```bash
# Start monitoring stack
docker-compose up -d

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f elasticsearch
docker-compose logs -f kibana

# Restart service
docker-compose restart prometheus

# Stop monitoring stack
docker-compose down

# Remove all data
docker-compose down -v
```

---

**Monitoring Stack**: Complete ✅  
**Total Containers**: 7 (Frontend, Backend, Database, Prometheus, Grafana, Elasticsearch, Kibana)
