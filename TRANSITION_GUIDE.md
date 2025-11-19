# Transition Guide - Moving to Docker Machine

## Current Status ✅

### What's Complete (No Docker Required)
1. ✅ **Application Code** - Fully functional ASP.NET Core 8 API
2. ✅ **Database Setup** - SQL Server LocalDB configured
3. ✅ **Authentication** - JWT implementation complete
4. ✅ **All Features** - Hotels, Bookings, Payments, Reviews, Loyalty
5. ✅ **Documentation** - Comprehensive docs in `/docs`
6. ✅ **Tests** - Unit and integration tests in `/finaldestination.tests`
7. ✅ **Monitoring Config** - Prometheus, Grafana, Elasticsearch configs ready

### What's Ready for Docker Machine
1. ✅ **Docker Compose** - Located in `/deployment/docker/docker-compose.yml`
2. ✅ **Dockerfile** - Located in `/finaldestination/Dockerfile`
3. ✅ **Monitoring Setup** - Configs in `/deployment/monitoring/`
4. ✅ **Documentation** - `/deployment/README.md` has full instructions

## Stop Here (Current Machine)

### What You Can Test Now
```bash
cd finaldestination
dotnet run
```

Access:
- API: https://localhost:5001
- Swagger: https://localhost:5001/swagger
- Frontend: https://localhost:5001

### What to Commit to Git
```bash
git add .
git commit -m "Complete hotel booking system with Docker deployment ready"
git push
```

## Resume Here (Docker Machine)

### Prerequisites on Docker Machine
- Docker Desktop installed
- Git installed
- 8GB RAM minimum

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd FinalDestination
```

### Step 2: Start Docker Stack
```bash
cd deployment/docker
docker-compose up -d
```

### Step 3: Verify Services
```bash
docker-compose ps
```

All services should show "healthy" status:
- hotel-api
- sqlserver
- elasticsearch
- kibana
- prometheus
- grafana

### Step 4: Access Services
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger
- **Grafana**: http://localhost:3000 (admin/admin)
- **Kibana**: http://localhost:5601
- **Prometheus**: http://localhost:9090

### Step 5: Configure Kibana (One-time)
1. Open http://localhost:5601
2. Wait for Elasticsearch connection (~30 seconds)
3. Go to: Stack Management → Index Patterns
4. Create pattern: `hotel-logs-*`
5. Select time field: `@timestamp`
6. Click "Create index pattern"

### Step 6: Verify Monitoring
1. **Grafana**: Dashboard "Hotel Booking API Metrics" should be visible
2. **Prometheus**: Check http://localhost:9090/targets (should show hotel-api UP)
3. **Kibana**: Go to Discover, select hotel-logs-* to see logs

## Project Structure

```
FinalDestination/
├── deployment/              # Docker & monitoring configs
│   ├── docker/
│   │   └── docker-compose.yml
│   ├── monitoring/
│   │   ├── prometheus.yml
│   │   └── grafana/
│   └── README.md
├── finaldestination/        # Main API project
│   ├── Controllers/
│   ├── Services/
│   ├── Models/
│   ├── Dockerfile
│   └── Program.cs
├── finaldestination.tests/  # Test project
├── docs/                    # Feature documentation
├── MONITORING.md            # Monitoring guide
├── ARCHITECTURE.md          # System architecture
└── README.md                # Main documentation
```

## Key Files for Docker Deployment

| File | Purpose | Location |
|------|---------|----------|
| docker-compose.yml | Orchestrates all services | deployment/docker/ |
| Dockerfile | Builds API container | finaldestination/ |
| prometheus.yml | Metrics scraping config | deployment/monitoring/ |
| grafana/ | Dashboard provisioning | deployment/monitoring/ |

## Troubleshooting on Docker Machine

### Services won't start
```bash
docker-compose logs <service-name>
```

### Port conflicts
Edit `deployment/docker/docker-compose.yml` and change port mappings

### Out of memory
Increase Docker Desktop memory allocation to 8GB+

### API can't connect to SQL Server
Check SQL Server container:
```bash
docker-compose logs sqlserver
docker-compose ps sqlserver
```

## What NOT to Do

❌ Don't run `dotnet run` on Docker machine (use containers instead)  
❌ Don't install SQL Server LocalDB (use containerized SQL Server)  
❌ Don't manually install Elasticsearch/Kibana (all in Docker)  
❌ Don't edit files in deployment/ on current machine (do it on Docker machine)

## Development Workflow

### On Current Machine (No Docker)
1. Write code
2. Test with `dotnet run`
3. Commit changes
4. Push to Git

### On Docker Machine
1. Pull latest code
2. Rebuild containers: `docker-compose up -d --build hotel-api`
3. Test in containerized environment
4. Monitor with Grafana/Kibana

## Quick Reference

### Current Machine Commands
```bash
# Run locally
cd finaldestination
dotnet run

# Run tests
cd finaldestination.tests
dotnet test

# Build
dotnet build
```

### Docker Machine Commands
```bash
# Start everything
cd deployment/docker
docker-compose up -d

# View logs
docker-compose logs -f hotel-api

# Restart service
docker-compose restart hotel-api

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up -d --build hotel-api
```

## Next Steps After Transition

1. ✅ Verify all services are running
2. ✅ Test API endpoints via Swagger
3. ✅ Check logs in Kibana
4. ✅ View metrics in Grafana
5. ✅ Run integration tests
6. ✅ Load test the system
7. ✅ Document any issues

## Support Documentation

- **Deployment**: `/deployment/README.md`
- **Monitoring**: `/MONITORING.md`
- **Architecture**: `/ARCHITECTURE.md`
- **API Reference**: `/docs/`
- **Main README**: `/README.md`

---

**Current Machine**: Development complete, ready to commit  
**Docker Machine**: Ready for containerized deployment and monitoring
