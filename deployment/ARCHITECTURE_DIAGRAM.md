# System Architecture Diagram

## Complete Production Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL ACCESS                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │   Grafana    │  │    Kibana    │  │    Nginx     │
            │   :3000      │  │    :5601     │  │    :8080     │
            │ (Monitoring) │  │   (Logs)     │  │  (Frontend)  │
            └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                   │                 │                 │
                   │                 │                 │
┌──────────────────┼─────────────────┼─────────────────┼──────────────────────┐
│                  │                 │                 │                       │
│  MONITORING      │                 │                 │   APPLICATION         │
│  LAYER           │                 │                 │   LAYER               │
│                  │                 │                 │                       │
│         ┌────────▼────────┐  ┌────▼──────────┐     │                       │
│         │   Prometheus    │  │ Elasticsearch │     │                       │
│         │     :9090       │  │     :9200     │     │                       │
│         │  (Metrics DB)   │  │  (Log Store)  │     │                       │
│         └────────▲────────┘  └───────▲───────┘     │                       │
│                  │                    │             │                       │
│                  │ scrapes /metrics   │ logs        │                       │
│                  │                    │             │                       │
│         ┌────────┴────────────────────┴─────────────▼──────────┐            │
│         │                                                       │            │
│         │              .NET 8 Backend API                      │            │
│         │                   :5000                              │            │
│         │                                                       │            │
│         │  ┌─────────────────────────────────────────────┐    │            │
│         │  │  Controllers (REST Endpoints)               │    │            │
│         │  │  - Auth, Hotels, Bookings, Payments         │    │            │
│         │  └──────────────────┬──────────────────────────┘    │            │
│         │                     │                                │            │
│         │  ┌──────────────────▼──────────────────────────┐    │            │
│         │  │  Middleware Pipeline                        │    │            │
│         │  │  - Error Handling                           │    │            │
│         │  │  - Authentication (JWT)                     │    │            │
│         │  │  - HTTP Metrics Collection                  │    │            │
│         │  └──────────────────┬──────────────────────────┘    │            │
│         │                     │                                │            │
│         │  ┌──────────────────▼──────────────────────────┐    │            │
│         │  │  Services (Business Logic)                  │    │            │
│         │  │  - ValidationService                        │    │            │
│         │  │  - PaymentService                           │    │            │
│         │  │  - LoyaltyService                           │    │            │
│         │  │  - AppMetrics (Custom Metrics)              │    │            │
│         │  └──────────────────┬──────────────────────────┘    │            │
│         │                     │                                │            │
│         │  ┌──────────────────▼──────────────────────────┐    │            │
│         │  │  Data Access Layer (EF Core)                │    │            │
│         │  │  - HotelContext                             │    │            │
│         │  │  - Repositories                             │    │            │
│         │  └──────────────────┬──────────────────────────┘    │            │
│         │                     │                                │            │
│         └─────────────────────┼────────────────────────────────┘            │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    SQL Server         │
                    │      :1433            │
                    │  (Data Persistence)   │
                    └───────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOCKER NETWORK                                     │
│                         (hotel-network)                                      │
│                                                                              │
│  All containers communicate via service names (e.g., backend, prometheus)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Request Flow
```
User Browser
    │
    ▼
Nginx (:8080) ──────────────────────────────┐
    │                                        │
    ├─ Static Files (Angular SPA)           │
    │                                        │
    └─ API Proxy (/api/*) ──────────────────┼──▶ Backend API (:5000)
                                             │        │
                                             │        ├─ JWT Validation
                                             │        ├─ Business Logic
                                             │        └─ Database Query
                                             │              │
                                             │              ▼
                                             │        SQL Server (:1433)
                                             │              │
                                             │              ▼
                                             └────────── Response
```

### 2. Metrics Flow
```
Backend API
    │
    ├─ HTTP Requests ──────▶ prometheus-net ──────▶ /metrics endpoint
    │                        (Automatic)
    │
    └─ Business Events ─────▶ AppMetrics ──────────▶ /metrics endpoint
         (Manual)              (Custom)
                                   │
                                   ▼
                            Prometheus (:9090)
                            - Scrapes every 10s
                            - Stores time-series
                                   │
                                   ▼
                            Grafana (:3000)
                            - Queries Prometheus
                            - Renders dashboards
```

### 3. Logging Flow
```
Backend API
    │
    ├─ Application Logs ────▶ Serilog
    │                           │
    │                           ├─ Console Sink ──────▶ Docker Logs
    │                           │
    │                           └─ Elasticsearch Sink ─▶ Elasticsearch (:9200)
    │                                                         │
    │                                                         ├─ Index: hotel-logs-*
    │                                                         │
    │                                                         ▼
    │                                                    Kibana (:5601)
    │                                                    - Search logs
    │                                                    - Create visualizations
    │                                                    - Set up alerts
```

## Component Responsibilities

### Frontend Layer
- **Nginx**: Serves Angular SPA, reverse proxy to API
- **Angular**: User interface, client-side routing, state management

### Application Layer
- **Controllers**: HTTP endpoints, request/response handling
- **Middleware**: Cross-cutting concerns (auth, errors, metrics)
- **Services**: Business logic, validation, external integrations
- **Data Access**: EF Core, database operations

### Data Layer
- **SQL Server**: Relational data storage
- **Entity Framework Core**: ORM, migrations, queries

### Monitoring Layer
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and alerting
- **Elasticsearch**: Log storage and indexing
- **Kibana**: Log exploration and analysis

## Metrics Collected

### Automatic (prometheus-net)
```
http_requests_received_total          # Total HTTP requests
http_request_duration_seconds         # Request latency histogram
http_requests_in_progress             # Current active requests
process_cpu_seconds_total             # CPU usage
process_working_set_bytes             # Memory usage
dotnet_collection_count_total         # GC collections
```

### Custom (AppMetrics)
```
hotel_bookings_created_total          # Business: Bookings created
hotel_bookings_cancelled_total        # Business: Bookings cancelled
hotel_payments_success_total          # Business: Successful payments
hotel_payments_failed_total           # Business: Failed payments
hotel_payment_amount_total            # Business: Total revenue
hotel_active_users                    # Business: Active users (24h)
hotel_searches_total                  # Business: Search activity
hotel_booking_processing_seconds      # Performance: Booking duration
hotel_user_registrations_total        # Business: New users
```

## Network Architecture

### Docker Network: hotel-network
```
┌─────────────────────────────────────────────────────────────┐
│                      hotel-network (bridge)                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ backend  │  │sqlserver │  │prometheus│  │ grafana  │   │
│  │   :80    │  │  :1433   │  │  :9090   │  │  :3000   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │elasticsearch│ │ kibana  │  │  nginx   │                 │
│  │  :9200   │  │  :5601   │  │   :80    │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  Services communicate via container names                   │
│  Example: http://backend:80/metrics                         │
└─────────────────────────────────────────────────────────────┘
```

### Port Mapping (Host:Container)
```
8080:80    - Nginx (Frontend)
5000:80    - Backend API
1433:1433  - SQL Server
9090:9090  - Prometheus
3000:3000  - Grafana
9200:9200  - Elasticsearch
5601:5601  - Kibana
```

## Deployment Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Build Phase                                              │
│     docker-compose build                                     │
│     - Multi-stage Dockerfile                                 │
│     - .NET SDK for build                                     │
│     - ASP.NET Runtime for production                         │
│     - Angular build integrated                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Start Services                                           │
│     docker-compose up -d                                     │
│     - SQL Server (database)                                  │
│     - Elasticsearch (logs)                                   │
│     - Backend API (application)                              │
│     - Prometheus (metrics)                                   │
│     - Grafana (dashboards)                                   │
│     - Kibana (log UI)                                        │
│     - Nginx (frontend)                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Health Checks                                            │
│     - Wait for services to be ready                          │
│     - Check /health endpoint                                 │
│     - Verify Prometheus targets                              │
│     - Confirm Elasticsearch cluster                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Monitoring Active                                        │
│     - Prometheus scraping metrics                            │
│     - Grafana displaying dashboards                          │
│     - Logs flowing to Elasticsearch                          │
│     - Application serving requests                           │
└─────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Network Security                                            │
│  - Isolated Docker network                                   │
│  - Only necessary ports exposed                              │
│  - Internal service communication                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Application Security                                        │
│  - JWT authentication                                        │
│  - Role-based authorization                                  │
│  - Password hashing (BCrypt)                                 │
│  - CORS configuration                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Data Security                                               │
│  - SQL injection prevention (EF Core)                        │
│  - Input validation                                          │
│  - Secure connection strings                                 │
│  - Environment variable secrets                              │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
```
                    ┌──────────────┐
                    │ Load Balancer│
                    │    (Nginx)   │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │Backend 1│    │Backend 2│    │Backend 3│
      └────┬────┘    └────┬────┘    └────┬────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  SQL Server   │
                  │  (Read Replica)│
                  └───────────────┘
```

### Monitoring at Scale
- Prometheus federation for multi-cluster
- Elasticsearch cluster for log distribution
- Grafana for centralized visualization
- Alert manager for notification routing

## Technology Choices Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| Backend | .NET 8 | Modern, performant, cross-platform |
| Frontend | Angular | Enterprise-ready SPA framework |
| Database | SQL Server | Relational data, ACID compliance |
| Metrics | Prometheus | Industry standard, powerful queries |
| Dashboards | Grafana | Best-in-class visualization |
| Logs | Elasticsearch | Scalable, full-text search |
| Container | Docker | Portability, consistency |
| Orchestration | Docker Compose | Simple, declarative, version-controlled |

---

**This architecture demonstrates production-ready practices suitable for enterprise deployment.**
