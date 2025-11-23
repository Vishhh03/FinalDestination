# Smart Hotel Booking System

> A production-ready hotel booking API built with ASP.NET Core 8, featuring JWT authentication, payment processing, reviews, and loyalty rewards.

[![.NET Version](https://img.shields.io/badge/.NET-8.0-512BD4)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/license-Educational-blue)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Key Features](#key-features)
- [Documentation](#documentation)
- [Sample Credentials](#sample-credentials)
- [Contributing](#contributing)

## 🎯 Overview

A comprehensive hotel booking system demonstrating modern full-stack development and **production-grade DevOps practices**. Built for the **Genc Training Project**, this system showcases enterprise-grade architecture, security, monitoring, and observability suitable for production use.

**🎉 NEW: Complete monitoring stack with Prometheus, Grafana, and ELK!**

## ✨ Key Features

### Application Features
- **🔐 Authentication**: JWT-based auth with role-based authorization (Admin, Hotel Manager, Guest)
- **🏨 Hotel Management**: CRUD operations, search/filtering, caching, rating system
- **📅 Booking System**: Room availability, booking lifecycle, date validation
- **💳 Payment Processing**: Mock payment service, multiple methods, refunds
- **⭐ Reviews & Ratings**: 1-5 star system with automatic hotel rating calculation
- **🎁 Loyalty Program**: Points-based rewards (10% of booking amount) with redemption for booking discounts

### DevOps & Monitoring Features
- **📊 Prometheus Metrics**: Custom business metrics (bookings, payments, revenue) + system metrics
- **📈 Grafana Dashboards**: Real-time visualization of KPIs and performance
- **🔍 ELK Stack**: Centralized logging with Elasticsearch and Kibana
- **🐳 Docker**: Multi-container orchestration with production-ready configs
- **🏥 Health Checks**: Service health monitoring and readiness probes
- **🛡️ Infrastructure**: Global error handling, validation, structured logging

## 🛠️ Technology Stack

### Application
- **ASP.NET Core 8.0** - Web API framework
- **Angular** - Modern SPA framework
- **Entity Framework Core 8.0** - ORM with SQL Server
- **JWT Bearer Authentication** - Stateless auth with BCrypt password hashing
- **Swagger/OpenAPI** - Interactive API documentation
- **AutoMapper** - DTO mapping
- **Serilog** - Structured logging

### DevOps & Monitoring
- **Docker & Docker Compose** - Containerization and orchestration
- **Prometheus** - Metrics collection and time-series database
- **Grafana** - Metrics visualization and dashboards
- **Elasticsearch** - Log storage and search
- **Kibana** - Log visualization and analysis
- **Nginx** - Reverse proxy and load balancing

## 🚀 Quick Start

### Option 1: Production Stack with Monitoring (Recommended)

**Prerequisites**: [Docker Desktop](https://www.docker.com/products/docker-desktop)

```bash
# Start everything with one command
start-monitoring.bat

# Or manually:
docker-compose -f docker-compose.prod.yml up -d
```

**Access All Services**:
- 🌐 **Frontend**: http://localhost:8080
- 🔌 **Backend API**: http://localhost:5000
- 📚 **API Docs**: http://localhost:5000/swagger
- 📊 **Grafana**: http://localhost:3000 (admin/admin)
- 🔍 **Prometheus**: http://localhost:9090
- 📝 **Kibana**: http://localhost:5601
- 💓 **Health Check**: http://localhost:5000/health
- 📈 **Metrics**: http://localhost:5000/metrics

**See the monitoring in action**:
1. Open Grafana at http://localhost:3000 (login: admin/admin)
2. Go to Dashboards → "Hotel Booking System - Production Metrics"
3. Create some bookings in the app
4. Watch real-time metrics update!

📖 **Full Guide**: [deployment/MONITORING_SETUP.md](deployment/MONITORING_SETUP.md)

### Option 2: Local Development

**Prerequisites**: [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

```bash
# Clone and run
git clone <repository-url>
cd Smart-Hotel-Booking-System/finaldestination
dotnet restore
dotnet run
```

**Access**:
- **Frontend**: https://localhost:5001
- **Swagger UI**: https://localhost:5001/swagger
- **API Base**: https://localhost:5001/api

### First Steps

1. **Login** with: `admin@hotel.com` / `Admin123!`
2. **Explore** hotels, make bookings, submit reviews
3. **Check metrics** at http://localhost:5000/metrics (if using Docker)
4. **View logs** in Kibana at http://localhost:5601 (if using Docker)

**Or use Swagger UI** for API testing:
1. Expand **POST /api/auth/login**
2. Click **Try it out**, use credentials above
3. Copy token, click **Authorize**, enter: `Bearer <token>`
4. Test any endpoint!

**Tip**: Set `"UseLocalDb": false` in `appsettings.Development.json` to use in-memory database (no SQL Server needed)

## 📊 Monitoring & Observability

This project includes a **production-grade monitoring stack** demonstrating DevOps best practices:

### Metrics (Prometheus + Grafana)
- **Business Metrics**: Bookings, payments, revenue, active users
- **Technical Metrics**: Request rates, latencies, error rates
- **System Metrics**: CPU, memory, GC statistics
- **Custom Dashboard**: Pre-configured Grafana dashboard with real-time KPIs

### Logging (ELK Stack)
- **Structured Logs**: JSON-formatted logs with context enrichment
- **Centralized Storage**: Elasticsearch with time-series indexing
- **Log Analysis**: Kibana for searching, filtering, and visualization
- **Index Pattern**: `hotel-logs-YYYY.MM.DD`

### Health & Diagnostics
- **Health Endpoint**: `/health` for service status
- **Metrics Endpoint**: `/metrics` in Prometheus format
- **Distributed Tracing**: Ready for OpenTelemetry integration

📖 **Complete Guides**:
- [Monitoring Setup Guide](deployment/MONITORING_SETUP.md) - How to use Prometheus, Grafana, ELK
- [DevOps Showcase](deployment/DEVOPS_SHOWCASE.md) - Production practices demonstrated
- [Metrics Integration](deployment/METRICS_INTEGRATION_GUIDE.md) - How to add custom metrics
- [Skills Demonstration](SKILLS_DEMONSTRATION.md) - Full-stack + DevOps skills mapping

## 📁 Project Structure

```
FinalDestination/
├── finaldestination/            # Main API project
│   ├── Controllers/             # API endpoints
│   ├── Services/                # Business logic + metrics
│   ├── Models/                  # Domain entities
│   ├── DTOs/                    # Data transfer objects
│   ├── Data/                    # EF Core context
│   ├── Middleware/              # Custom middleware
│   ├── Dockerfile               # Multi-stage build
│   └── ClientApp/               # Angular SPA
│
├── deployment/                  # DevOps & Infrastructure
│   ├── monitoring/
│   │   ├── prometheus.yml       # Metrics scraping config
│   │   └── grafana/             # Dashboards & datasources
│   ├── MONITORING_SETUP.md      # Complete monitoring guide
│   ├── DEVOPS_SHOWCASE.md       # DevOps practices
│   └── METRICS_INTEGRATION_GUIDE.md
│
├── docker-compose.prod.yml      # Production stack
├── docker-compose.dev.yml       # Development stack
├── start-monitoring.bat         # One-command startup
│
├── docs/                        # Feature documentation
├── ARCHITECTURE.md              # System design
├── SKILLS_DEMONSTRATION.md      # Skills showcase
├── TRANSITION_GUIDE.md          # Machine transition
└── README.md                    # This file
```

## 📚 Documentation

### Core Documentation
| Document | Description |
|----------|-------------|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, patterns, and diagrams |
| **[docs/](docs/)** | Module-specific documentation |
| **[MONITORING.md](MONITORING.md)** | Prometheus, Grafana, Elasticsearch, Kibana setup |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Contribution guidelines |

### Deployment
| Document | Description |
|----------|-------------|
| **[deployment/README.md](deployment/README.md)** | Docker deployment guide |
| **[TRANSITION_GUIDE.md](TRANSITION_GUIDE.md)** | Moving between development and Docker machines |

## 🔑 Sample Credentials

| Role              | Email             | Password    |
| ----------------- | ----------------- | ----------- |
| **Admin**         | admin@hotel.com   | Admin123!   |
| **Hotel Manager** | manager@hotel.com | Manager123! |
| **Guest**         | guest@example.com | Guest123!   |

**Sample Data**: 8 users, 6 hotels, 8 bookings, 10 reviews, 5 loyalty accounts, 8 payments

## 🌐 API Endpoints Summary

**30+ endpoints** across 6 controllers:

- **Authentication** (7): Register, login, user management, hotel manager applications
- **Hotels** (6): CRUD operations, search, filtering
- **Bookings** (7): Create, view, cancel, payment processing
- **Reviews** (4): Submit, update, delete reviews
- **Loyalty** (2): View account, transaction history
- **Payments** (2): View details, process refunds

See **[API_REFERENCE.md](API_REFERENCE.md)** for complete documentation or use **Swagger UI** at https://localhost:5001/swagger

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code standards, workflow, and pull requests.

## 📄 License

Educational project developed for the Genc Training Program.

---

**Built with ASP.NET Core 8.0** | _Last Updated: October 2025_
