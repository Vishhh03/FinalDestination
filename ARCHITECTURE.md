# 🏗️ System Architecture

## Overview

Smart Hotel Booking System - A production-ready hotel booking API with JWT authentication, payment processing, reviews, and loyalty rewards.

## Technology Stack

### Application
- **Backend**: ASP.NET Core 8.0
- **Database**: SQL Server 2022 / SQLite
- **Frontend**: Angular SPA
- **Authentication**: JWT Bearer
- **ORM**: Entity Framework Core 8.0
- **API Documentation**: Swagger/OpenAPI
- **Caching**: IMemoryCache
- **Testing**: NUnit (50 tests)

### DevOps & Monitoring
- **Containerization**: Docker (multi-container setup)
- **Orchestration**: Docker Compose
- **Metrics**: Prometheus + prometheus-net
- **Visualization**: Grafana with pre-built dashboards
- **Logging**: Serilog + Elasticsearch
- **Log Analysis**: Kibana
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Nginx:8080)                       │
│  - Serves static files (Angular SPA)                        │
│  - Reverse proxy to backend                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ /api/* requests
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend API (ASP.NET Core:5000)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers Layer                        │  │
│  │  - AuthController (JWT authentication)               │  │
│  │  - HotelsController (CRUD, search)                   │  │
│  │  - BookingsController (reservations)                 │  │
│  │  - PaymentsController (transactions)                 │  │
│  │  - ReviewsController (ratings)                       │  │
│  │  - LoyaltyController (points)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer                           │  │
│  │  - JwtService (token generation)                     │  │
│  │  - PaymentService (mock processing)                  │  │
│  │  - LoyaltyService (points management)                │  │
│  │  - ReviewService (ratings)                           │  │
│  │  - ValidationService (business rules)                │  │
│  │  - CacheService (performance)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Layer (EF Core)                     │  │
│  │  - HotelContext (DbContext)                          │  │
│  │  - Repositories                                       │  │
│  │  - Migrations                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL queries
                         ↓
┌─────────────────────────────────────────────────────────────┐
│            Database (SQL Server:1433)                        │
│  - Hotels, Users, Bookings                                  │
│  - Payments, Reviews, LoyaltyAccounts                       │
│  - Persistent volume storage                                │
└─────────────────────────────────────────────────────────────┘
```

## Docker Architecture

### 3-Container Setup

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    Frontend      │────▶│     Backend      │────▶│    Database      │
│  Nginx:8080      │     │  ASP.NET:5000    │     │  SQL Server:1433 │
│                  │     │                  │     │                  │
│  - Static files  │     │  - REST API      │     │  - Data storage  │
│  - Reverse proxy │     │  - Business logic│     │  - Persistence   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

**Network**: `hotel-network` (bridge)  
**Volumes**: `sqlserver-data` (persistent)

## Domain Model

```
User (1) ──────────── (*) Booking (*) ──────────── (1) Hotel
  │                         │                           │
  │                         │                           │
  │                         │                           │
(1)                       (1)                         (*)
  │                         │                           │
LoyaltyAccount          Payment                     Review
  │
  │
(*)
  │
PointsTransaction
```

### Core Entities

**User**
- Id, Email, PasswordHash, Name, Role
- Roles: Guest, HotelManager, Admin

**Hotel**
- Id, Name, City, Address, Description
- PricePerNight, AvailableRooms, Rating

**Booking**
- Id, UserId, HotelId, GuestName, GuestEmail
- CheckInDate, CheckOutDate, NumberOfGuests
- TotalAmount, Status, LoyaltyPointsRedeemed

**Payment**
- Id, BookingId, Amount, Currency
- PaymentMethod, Status, TransactionId

**Review**
- Id, UserId, HotelId, Rating, Comment

**LoyaltyAccount**
- Id, UserId, PointsBalance, TotalPointsEarned

## API Architecture

### Authentication Flow

```
1. User registers/logs in
   ↓
2. Backend validates credentials
   ↓
3. JWT token generated (60 min expiry)
   ↓
4. Token sent to client
   ↓
5. Client includes token in Authorization header
   ↓
6. Backend validates token on each request
```

### Booking Flow

```
1. User searches hotels (filters: city, price, rating)
   ↓
2. User selects hotel and dates
   ↓
3. System validates availability
   ↓
4. Booking created (status: Confirmed)
   ↓
5. User processes payment
   ↓
6. Payment validated (mock service)
   ↓
7. Loyalty points awarded (10% of amount)
   ↓
8. Booking confirmed
```

### Loyalty Points Flow

```
Earn Points:
  Booking Amount × 0.1 = Points Earned
  Example: ₹1000 booking = 100 points

Redeem Points:
  Points × 1.0 = Discount Amount
  Example: 100 points = ₹100 discount
  Minimum: 100 points
```

## Security Architecture

### Authentication
- JWT Bearer tokens
- BCrypt password hashing
- Token expiry: 60 minutes
- Role-based authorization

### Authorization Levels
- **Guest**: View hotels, make bookings, reviews
- **HotelManager**: Manage own hotels
- **Admin**: Full system access

### API Security
- HTTPS enabled
- CORS configured
- Input validation
- SQL injection prevention (EF Core)
- XSS protection

## Data Flow

### Request Pipeline

```
HTTP Request
    ↓
Middleware (Error Handling)
    ↓
Authentication Middleware
    ↓
Authorization Middleware
    ↓
Controller (Validation Filter)
    ↓
Service Layer (Business Logic)
    ↓
Data Layer (EF Core)
    ↓
Database
    ↓
Response (DTO mapping)
```

## Caching Strategy

- **Hotel List**: Cached for 5 minutes
- **Hotel Details**: Cached for 10 minutes
- **Cache Key**: Based on query parameters
- **Invalidation**: On hotel update/delete

## Error Handling

### Global Error Middleware

```
Exception Type → HTTP Status → Response
─────────────────────────────────────────
ArgumentException → 400 → Bad Request
KeyNotFoundException → 404 → Not Found
UnauthorizedAccessException → 401 → Unauthorized
InvalidOperationException → 400 → Bad Request
Exception → 500 → Internal Server Error
```

## Performance Optimizations

1. **Caching**: IMemoryCache for frequently accessed data
2. **Async/Await**: All I/O operations asynchronous
3. **Eager Loading**: Include() for related entities
4. **Indexing**: Database indexes on foreign keys
5. **DTO Mapping**: AutoMapper for efficient transformations
6. **Connection Pooling**: EF Core default pooling

## Scalability Considerations

### Horizontal Scaling
- Stateless API (JWT tokens)
- Database connection pooling
- Shared cache (Redis for production)

### Vertical Scaling
- Async operations
- Efficient queries
- Minimal memory footprint

## Deployment Architecture

### Development
```
Local Machine
  ↓
SQLite Database
  ↓
dotnet run
```

### Docker (Local/Staging)
```
docker-compose up
  ↓
3 Containers (Frontend, Backend, SQL Server)
  ↓
Bridge Network
```

### Production (Cloud)
```
Load Balancer
  ↓
Multiple Backend Instances
  ↓
Managed SQL Server
  ↓
CDN for Static Files
```

## Monitoring & Logging

### Metrics (Prometheus)
- **HTTP Metrics**: Request rates, durations, status codes
- **Business Metrics**: Bookings, payments, revenue, active users
- **System Metrics**: CPU, memory, GC, thread pool
- **Custom Metrics**: Via IAppMetrics service
- **Endpoint**: `/metrics` (Prometheus format)

### Logging (Serilog + ELK)
- **Structured Logging**: JSON format with context enrichment
- **Sinks**: Console + Elasticsearch
- **Index Pattern**: `hotel-logs-{yyyy.MM.dd}`
- **Enrichers**: Machine name, environment, log context
- **Visualization**: Kibana dashboards

### Observability
- **Health Checks**: `/health` endpoint with timestamp
- **Metrics Updater**: Background service (30s interval)
- **Error Tracking**: Global exception middleware
- **Performance**: Histogram metrics for booking processing

## Database Schema

### Tables
- Users
- Hotels
- Bookings
- Payments
- Reviews
- LoyaltyAccounts
- PointsTransactions

### Relationships
- One-to-Many: User → Bookings
- One-to-Many: Hotel → Bookings
- One-to-One: Booking → Payment
- One-to-Many: Hotel → Reviews
- One-to-One: User → LoyaltyAccount
- One-to-Many: LoyaltyAccount → PointsTransactions

## API Endpoints Summary

| Module | Endpoints | Authentication |
|--------|-----------|----------------|
| Auth | 7 | Public/Admin |
| Hotels | 6 | Public/Manager/Admin |
| Bookings | 7 | User/Admin |
| Payments | 2 | User/Admin |
| Reviews | 4 | User |
| Loyalty | 2 | User |
| Admin | 3 | Admin |
| Users | 2 | User/Admin |
| Upload | 1 | Manager/Admin |

**Total**: 34+ endpoints

### Monitoring Endpoints
- `/health` - Health check with status and timestamp
- `/metrics` - Prometheus metrics in text format

## Testing Architecture

### Unit Tests (50 tests)
- Models (10 tests)
- DTOs (5 tests)
- Database (7 tests)
- Controllers (5 tests)
- Helpers (6 tests)
- Auth/Admin (17 tests)

### Test Coverage
- Domain models
- Business logic
- Database operations
- API endpoints
- Utility functions

## Configuration Management

### appsettings.json
- Connection strings
- JWT settings
- Loyalty settings
- Logging configuration

### Environment Variables
- Database credentials
- JWT secret
- API keys
- Feature flags

---

**Architecture Status**: Production Ready 🚀
