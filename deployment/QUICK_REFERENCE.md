# Quick Reference Card

## 🚀 One-Command Start

```bash
start-monitoring.bat
```

## 🌐 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:8080 | - |
| Backend API | http://localhost:5000 | - |
| Swagger Docs | http://localhost:5000/swagger | - |
| Grafana | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Kibana | http://localhost:5601 | - |
| Health Check | http://localhost:5000/health | - |
| Metrics | http://localhost:5000/metrics | - |

## 👤 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hotel.com | Admin123! |
| Manager | manager@hotel.com | Manager123! |
| Customer | john@example.com | Customer123! |

## 🐳 Docker Commands

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# View logs (all services)
docker-compose -f docker-compose.prod.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.prod.yml logs -f backend

# Restart a service
docker-compose -f docker-compose.prod.yml restart backend

# Check service status
docker-compose -f docker-compose.prod.yml ps

# Remove everything (including volumes)
docker-compose -f docker-compose.prod.yml down -v
```

## 📊 Key Metrics

### Business Metrics
```promql
# Booking rate (per second)
rate(hotel_bookings_created_total[5m])

# Payment success rate
rate(hotel_payments_success_total[5m]) / 
(rate(hotel_payments_success_total[5m]) + rate(hotel_payments_failed_total[5m]))

# Revenue per minute
rate(hotel_payment_amount_total[1m]) * 60

# Active users
hotel_active_users
```

### Technical Metrics
```promql
# Request rate
rate(http_requests_received_total[5m])

# Error rate
rate(http_requests_received_total{code=~"5.."}[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
process_working_set_bytes / 1024 / 1024
```

## 🔍 Log Queries (Kibana)

```
# All errors
level:Error

# Payment failures
SourceContext:*PaymentService* AND level:Warning

# Booking operations
SourceContext:*BookingsController*

# Slow operations (if logged)
message:"took" AND message:>1000ms

# User authentication
SourceContext:*AuthController* AND message:"logged in"

# Specific user activity
UserId:123
```

## 🛠️ Troubleshooting

### Service Won't Start
```bash
# Check if ports are in use
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Check Docker status
docker ps -a

# View service logs
docker-compose -f docker-compose.prod.yml logs backend
```

### No Metrics in Grafana
1. Check Prometheus targets: http://localhost:9090/targets
2. Verify API metrics: http://localhost:5000/metrics
3. Check Grafana datasource: Settings → Data Sources
4. Verify time range in dashboard (default: last 1 hour)

### No Logs in Kibana
1. Check Elasticsearch: http://localhost:9200/_cluster/health
2. Verify index exists: http://localhost:9200/_cat/indices
3. Create index pattern in Kibana: `hotel-logs-*`
4. Check API logs for Serilog errors

### Database Connection Issues
```bash
# Check SQL Server container
docker-compose -f docker-compose.prod.yml logs sqlserver

# Verify connection string in backend logs
docker-compose -f docker-compose.prod.yml logs backend | findstr "Connection"
```

## 📈 Grafana Dashboard Panels

| Panel | Metric | Description |
|-------|--------|-------------|
| HTTP Request Rate | `rate(http_requests_received_total[5m])` | Requests per second |
| Request Duration | `histogram_quantile(0.95, ...)` | 95th percentile latency |
| Business Metrics | `hotel_bookings_total`, `hotel_active_users` | KPIs |
| CPU Usage | `rate(process_cpu_seconds_total[5m]) * 100` | CPU percentage |
| Memory Usage | `process_working_set_bytes` | Memory in bytes |
| Service Health | `up{job="hotel-backend"}` | 1=up, 0=down |

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production stack definition |
| `deployment/monitoring/prometheus.yml` | Metrics scraping config |
| `deployment/monitoring/grafana/provisioning/` | Auto-provisioning |
| `finaldestination/appsettings.json` | App configuration |
| `finaldestination/Dockerfile` | Container build |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [MONITORING_SETUP.md](MONITORING_SETUP.md) | Complete monitoring guide |
| [DEVOPS_SHOWCASE.md](DEVOPS_SHOWCASE.md) | DevOps practices |
| [METRICS_INTEGRATION_GUIDE.md](METRICS_INTEGRATION_GUIDE.md) | Add custom metrics |
| [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) | System architecture |
| [../SKILLS_DEMONSTRATION.md](../SKILLS_DEMONSTRATION.md) | Skills showcase |

## 🎯 Common Tasks

### Generate Test Traffic
```bash
# Using curl (Windows)
for /L %i in (1,1,100) do curl http://localhost:5000/api/hotels

# Using PowerShell
1..100 | ForEach-Object { Invoke-WebRequest http://localhost:5000/api/hotels }
```

### Create Test Booking
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"Customer123!\"}"

# 2. Create booking (use token from step 1)
curl -X POST http://localhost:5000/api/bookings ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"hotelId\":1,\"checkInDate\":\"2025-12-01\",\"checkOutDate\":\"2025-12-05\",\"numberOfGuests\":2,\"guestName\":\"John Doe\",\"guestEmail\":\"john@example.com\"}"
```

### Export Grafana Dashboard
```bash
# Get dashboard JSON
curl http://localhost:3000/api/dashboards/uid/hotel-booking-prod ^
  -u admin:admin > dashboard-backup.json
```

### Backup Elasticsearch Indices
```bash
# Create snapshot repository
curl -X PUT "localhost:9200/_snapshot/backup" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"fs\",\"settings\":{\"location\":\"/backup\"}}"

# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup/snapshot_1"
```

## 🔐 Security Checklist

- [ ] Change default Grafana password
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Restrict monitoring ports (9090, 9200)
- [ ] Set up authentication on Prometheus
- [ ] Configure Elasticsearch security
- [ ] Use strong database passwords
- [ ] Enable CORS only for trusted origins
- [ ] Implement rate limiting
- [ ] Set up firewall rules

## 🚨 Alerts to Configure

### Critical
- Service down (up == 0)
- Error rate > 5%
- Payment failure rate > 10%
- Database connection failures

### Warning
- High latency (p95 > 2s)
- High memory usage (>80%)
- High CPU usage (>80%)
- Disk space low (<20%)

### Info
- Booking rate spike
- New user registrations
- Revenue milestones

## 📞 Support

- **Documentation**: See `deployment/` folder
- **Issues**: Check Docker logs first
- **Metrics**: Verify Prometheus targets
- **Logs**: Search in Kibana
- **Health**: Check `/health` endpoint

---

**Keep this card handy for quick reference during development and operations!**
