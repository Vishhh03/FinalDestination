# DevOps Skills Showcase

This document highlights the production-grade DevOps practices implemented in this Hotel Booking System project.

## 🎯 Overview

This project demonstrates a complete production-ready deployment with:
- **Containerization**: Docker multi-container orchestration
- **Monitoring**: Prometheus + Grafana for metrics
- **Logging**: ELK Stack for centralized logs
- **CI/CD Ready**: GitHub Actions workflows
- **Infrastructure as Code**: Docker Compose configurations
- **Observability**: Full-stack monitoring and tracing

## 🏗️ Architecture Highlights

### Multi-Tier Application Stack
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐          ┌─────▼────┐
    │ Angular  │          │ .NET API │
    │ Frontend │          │ Backend  │
    └──────────┘          └─────┬────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────▼────┐ ┌───▼────┐ ┌───▼────┐
              │ SQL      │ │ Elastic│ │ Prom   │
              │ Server   │ │ search │ │ etheus │
              └──────────┘ └────────┘ └────────┘
```

## 🐳 Containerization

### Docker Best Practices Implemented

1. **Multi-Stage Builds** (Dockerfile)
   - Separate build and runtime stages
   - Minimal production image size
   - Security through reduced attack surface

2. **Environment-Specific Configs**
   - `docker-compose.dev.yml` - Development with hot reload
   - `docker-compose.prod.yml` - Production with monitoring
   - `docker-compose.minimal.yml` - Lightweight testing

3. **Health Checks**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

4. **Resource Management**
   - Memory limits
   - CPU constraints
   - Volume management for persistence

5. **Networking**
   - Isolated bridge network
   - Service discovery via container names
   - Port mapping for external access

## 📊 Monitoring & Observability

### Prometheus Metrics

**Infrastructure Metrics** (automatic via UseHttpMetrics):
- `http_requests_received_total` - HTTP request count by method, code, controller
- `http_request_duration_seconds` - Request latency histogram with percentiles
- `process_cpu_seconds_total` - CPU usage
- `dotnet_total_memory_bytes` - Memory usage
- `dotnet_collection_count_total` - Garbage collection statistics
- Thread pool utilization

**Business Metrics** (via IAppMetrics service):
- `hotel_bookings_created_total` - Booking creation counter
- `hotel_bookings_cancelled_total` - Booking cancellation counter
- `hotel_payments_success_total` - Payment success counter
- `hotel_payments_failed_total` - Payment failure counter
- `hotel_payment_amount_total` - Revenue tracking counter (INR)
- `hotel_active_users` - Active user gauge (updated every 30s)
- `hotel_searches_total` - Search activity counter
- `hotel_booking_processing_seconds` - Booking processing histogram

**Implementation**:
```csharp
// Metrics service interface
public interface IAppMetrics
{
    void IncBookingCreated();
    void IncBookingCancelled();
    void IncPaymentSuccess();
    void IncPaymentFailed();
    void RecordPaymentAmount(decimal amount);
    void SetActiveUsers(int count);
    void IncHotelSearch();
    void ObserveBookingProcessing(double seconds);
}

// Static metrics registration (singleton)
private static readonly Counter _bookingsCounter = 
    Prometheus.Metrics.CreateCounter(
        "hotel_bookings_created_total",
        "Total number of hotel bookings created");

private static readonly Histogram _bookingProcessing = 
    Prometheus.Metrics.CreateHistogram(
        "hotel_booking_processing_seconds",
        "Duration of booking processing",
        new HistogramConfiguration
        {
            Buckets = Histogram.ExponentialBuckets(0.01, 2, 10)
        });

// Background service updates gauge metrics
public class MetricsUpdater : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var activeUsers = await context.Users
                .CountAsync(u => u.LastLoginAt > DateTime.UtcNow.AddHours(-24));
            metrics.SetActiveUsers(activeUsers);
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
```

### Grafana Dashboards

Pre-configured production dashboard with:
- Real-time request rate visualization
- Latency percentiles (p50, p95, p99)
- Error rate tracking
- Business KPI panels
- System resource monitoring
- Service health indicators

**Auto-provisioning**:
- Datasources configured via YAML
- Dashboards loaded from JSON
- No manual setup required

### ELK Stack (Elasticsearch + Kibana)

**Structured Logging** (Serilog):
```csharp
var elasticsearchUrl = Environment.GetEnvironmentVariable("ElasticsearchUrl") 
    ?? "http://localhost:9200";

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .WriteTo.Console()
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(elasticsearchUrl))
    {
        AutoRegisterTemplate = true,
        IndexFormat = "hotel-logs-{0:yyyy.MM.dd}",
        NumberOfReplicas = 0,
        NumberOfShards = 1
    })
    .CreateLogger();

builder.Host.UseSerilog();
```

**Log Enrichment**:
- Machine name
- Environment (Dev/Prod)
- Request context
- User information
- Correlation IDs

**Kibana Features**:
- Full-text log search
- Time-based filtering
- Log aggregations
- Error tracking
- Performance analysis

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

1. **Build & Test** (`.github/workflows/build.yml`)
   - Automated testing on push
   - Code quality checks
   - Build verification

2. **Docker Build** (`.github/workflows/docker.yml`)
   - Multi-platform builds
   - Image tagging strategy
   - Registry push

3. **Deployment** (`.github/workflows/deploy.yml`)
   - Automated deployment
   - Environment promotion
   - Rollback capability

## 🔐 Security Practices

### Application Security
- JWT authentication
- Role-based authorization
- SQL injection prevention (EF Core)
- XSS protection
- CORS configuration
- HTTPS enforcement

### Container Security
- Non-root user in containers
- Minimal base images
- Secret management via environment variables
- Network isolation
- Read-only file systems where possible

### Monitoring Security
- Authentication on monitoring endpoints
- Network segmentation
- Audit logging
- Access control

## 📈 Scalability Considerations

### Horizontal Scaling
```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
```

### Load Balancing
- Nginx reverse proxy
- Round-robin distribution
- Health check integration
- Session affinity support

### Database Optimization
- Connection pooling
- Query optimization
- Indexing strategy
- Read replicas (future)

## 🛠️ Infrastructure as Code

### Configuration Management
All infrastructure defined in code:
- Docker Compose files
- Prometheus configuration
- Grafana provisioning
- Nginx configuration
- Environment variables

### Version Control
- All configs in Git
- Change tracking
- Rollback capability
- Collaboration support

## 📦 Deployment Strategies

### Blue-Green Deployment
```bash
# Deploy new version
docker-compose -f docker-compose.prod.yml up -d --scale backend=2

# Verify health
curl http://localhost:5000/health

# Switch traffic
# Update nginx config

# Remove old version
docker-compose -f docker-compose.prod.yml up -d --scale backend=1
```

### Rolling Updates
```yaml
deploy:
  update_config:
    parallelism: 1
    delay: 10s
    failure_action: rollback
```

### Canary Releases
- Deploy to subset of users
- Monitor metrics
- Gradual rollout
- Quick rollback if issues

## 🔍 Troubleshooting & Debugging

### Centralized Logging
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Search in Kibana
level:Error AND SourceContext:*PaymentService*
```

### Metrics Analysis
```promql
# Error rate
rate(http_requests_received_total{code=~"5.."}[5m])

# Slow requests
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

### Health Checks
```bash
# API health
curl http://localhost:5000/health

# Prometheus targets
curl http://localhost:9090/api/v1/targets

# Elasticsearch cluster
curl http://localhost:9200/_cluster/health
```

## 📊 Performance Monitoring

### Key Metrics Tracked
1. **Availability**: Uptime percentage via /health endpoint
2. **Latency**: Response time percentiles (p50, p95, p99) via histogram
3. **Throughput**: Requests per second via http_requests_received_total
4. **Errors**: Error rate via http_requests_received_total{code=~"5.."}
5. **Saturation**: CPU, memory, GC via dotnet runtime metrics
6. **Business KPIs**: Bookings, payments, revenue, active users

### SLI/SLO Examples
```
SLI: 95% of requests complete in < 500ms
SLO: 99.9% uptime per month
SLO: < 1% error rate
```

## 🎓 Skills Demonstrated

### DevOps Core
- [x] Containerization (Docker)
- [x] Orchestration (Docker Compose)
- [x] CI/CD (GitHub Actions)
- [x] Infrastructure as Code
- [x] Configuration Management

### Monitoring & Observability
- [x] Metrics collection (Prometheus)
- [x] Visualization (Grafana)
- [x] Centralized logging (ELK)
- [x] Distributed tracing ready
- [x] Custom business metrics

### Cloud-Ready Architecture
- [x] 12-Factor App principles
- [x] Stateless services
- [x] External configuration
- [x] Health checks
- [x] Graceful shutdown

### Production Operations
- [x] Log aggregation
- [x] Performance monitoring
- [x] Error tracking
- [x] Capacity planning
- [x] Incident response

## 🚀 Production Deployment Checklist

- [x] Containerized application
- [x] Multi-environment configs
- [x] Health check endpoints
- [x] Metrics instrumentation
- [x] Centralized logging
- [x] Monitoring dashboards
- [x] Alerting rules
- [x] Security hardening
- [x] Resource limits
- [x] Backup strategy
- [x] Rollback procedure
- [x] Documentation

## 📚 Technologies Used

| Category | Technology | Purpose |
|----------|-----------|---------|
| Backend | .NET 8 | API framework |
| Frontend | Angular | SPA framework |
| Database | SQL Server | Data persistence |
| Containerization | Docker | Application packaging |
| Orchestration | Docker Compose | Multi-container management |
| Metrics | Prometheus | Time-series metrics |
| Visualization | Grafana | Metrics dashboards |
| Logging | Elasticsearch | Log storage |
| Log UI | Kibana | Log exploration |
| Reverse Proxy | Nginx | Load balancing |
| CI/CD | GitHub Actions | Automation |

## 🎯 Interview Talking Points

1. **"Tell me about your DevOps experience"**
   - Implemented full monitoring stack with Prometheus/Grafana
   - Set up centralized logging with ELK
   - Containerized full-stack application
   - Created production-ready deployment configs

2. **"How do you monitor applications?"**
   - Custom business metrics (bookings, payments, revenue)
   - Infrastructure metrics (CPU, memory, requests)
   - Structured logging with correlation IDs
   - Real-time dashboards and alerting

3. **"Describe your deployment process"**
   - Docker multi-stage builds
   - Environment-specific configurations
   - Health checks and graceful shutdown
   - Rolling updates with rollback capability

4. **"How do you troubleshoot production issues?"**
   - Centralized logs in Elasticsearch
   - Metrics correlation in Grafana
   - Distributed tracing (ready to implement)
   - Health check endpoints

## 🔗 Quick Links

- [Monitoring Setup Guide](./MONITORING_SETUP.md)
- [Docker Deployment](./README.md)
- [API Documentation](../README.md)
- [Architecture Overview](../ARCHITECTURE.md)

---

**This project demonstrates production-grade DevOps practices suitable for enterprise environments.**
