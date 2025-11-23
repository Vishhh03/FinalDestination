# Deployment & Monitoring Guide

## 🎯 Overview

Complete production-ready deployment with **full observability stack** including metrics, logging, and visualization.

## 📁 Directory Structure

```
deployment/
├── monitoring/                          # Monitoring configurations
│   ├── prometheus.yml                   # Metrics scraping config
│   └── grafana/
│       ├── provisioning/                # Auto-provisioning
│       │   ├── datasources/             # Prometheus datasource
│       │   └── dashboards/              # Dashboard config
│       └── dashboards/                  # Pre-built dashboards
│           └── hotel-booking-dashboard.json
│
├── MONITORING_SETUP.md                  # Complete monitoring guide
├── DEVOPS_SHOWCASE.md                   # DevOps practices explained
├── METRICS_INTEGRATION_GUIDE.md         # How to add metrics
├── ARCHITECTURE_DIAGRAM.md              # Visual system design
├── QUICK_REFERENCE.md                   # Commands cheat sheet
└── README.md                            # This file
```

## 📚 Documentation Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Commands, URLs, troubleshooting | Everyone |
| **[MONITORING_SETUP.md](MONITORING_SETUP.md)** | Complete monitoring walkthrough | Ops/DevOps |
| **[DEVOPS_SHOWCASE.md](DEVOPS_SHOWCASE.md)** | Production practices | Interviews |
| **[METRICS_INTEGRATION_GUIDE.md](METRICS_INTEGRATION_GUIDE.md)** | Add custom metrics | Developers |
| **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** | System architecture | Technical |

## Prerequisites

- Docker Desktop installed
- Docker Compose v2.0+
- 8GB RAM minimum
- Ports available: 8080, 5000, 1433, 9200, 5601, 9090, 3000

## Quick Start

```bash
# From project root
start-monitoring.bat

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| hotel-api | 5000 | ASP.NET Core API |
| sqlserver | 1433 | SQL Server 2022 |
| elasticsearch | 9200 | Log storage |
| kibana | 5601 | Log visualization |
| prometheus | 9090 | Metrics collection |
| grafana | 3000 | Dashboards (admin/admin) |

## Post-Deployment Setup

### 1. Verify Services
```bash
docker-compose ps
```

### 2. Check API Health
```
http://localhost:5000/health
```

### 3. Configure Kibana Index Pattern
1. Open http://localhost:5601
2. Navigate to: Stack Management → Index Patterns
3. Create pattern: `hotel-logs-*`
4. Select time field: `@timestamp`

### 4. Access Grafana Dashboard
1. Open http://localhost:3000
2. Login: admin/admin
3. Dashboard auto-loaded: "Hotel Booking API Metrics"

## Monitoring

- **Application Logs**: Kibana → Discover → hotel-logs-*
- **Metrics**: Grafana → Hotel Booking API Metrics dashboard
- **Raw Metrics**: http://localhost:5000/metrics
- **Prometheus**: http://localhost:9090

## Management Commands

```bash
# View logs (all services)
docker-compose -f docker-compose.prod.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose.prod.yml logs -f backend

# Restart service
docker-compose -f docker-compose.prod.yml restart backend

# Stop all
docker-compose -f docker-compose.prod.yml down

# Clean slate (removes data)
docker-compose -f docker-compose.prod.yml down -v

# Rebuild after code changes
docker-compose -f docker-compose.prod.yml up -d --build backend
```

## Troubleshooting

### Service won't start
```bash
docker-compose -f docker-compose.prod.yml logs <service-name>
```

### Port conflicts
Edit `docker-compose.prod.yml` to change port mappings

### Database connection issues
Check SQL Server is healthy:
```bash
docker-compose -f docker-compose.prod.yml ps sqlserver
```

**See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for more troubleshooting tips**

## Production Considerations

- Change default passwords in docker-compose.yml
- Configure proper resource limits
- Set up persistent volume backups
- Enable HTTPS with proper certificates
- Configure firewall rules
- Set up log rotation
