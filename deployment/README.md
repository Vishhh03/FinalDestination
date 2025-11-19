# Deployment Guide

## Directory Structure

```
deployment/
├── docker/              # Docker orchestration
│   └── docker-compose.yml
└── monitoring/          # Monitoring configurations
    ├── prometheus.yml
    └── grafana/
        └── provisioning/
```

## Prerequisites

- Docker Desktop installed
- Docker Compose v2.0+
- 8GB RAM minimum
- Ports available: 5000, 1433, 9200, 5601, 9090, 3000

## Quick Start

```bash
cd deployment/docker
docker-compose up -d
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
# View logs
docker-compose logs -f hotel-api

# Restart service
docker-compose restart hotel-api

# Stop all
docker-compose down

# Clean slate (removes data)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build hotel-api
```

## Troubleshooting

### Service won't start
```bash
docker-compose logs <service-name>
```

### Port conflicts
Edit `docker-compose.yml` to change port mappings

### Database connection issues
Check SQL Server is healthy:
```bash
docker-compose ps sqlserver
```

## Production Considerations

- Change default passwords in docker-compose.yml
- Configure proper resource limits
- Set up persistent volume backups
- Enable HTTPS with proper certificates
- Configure firewall rules
- Set up log rotation
