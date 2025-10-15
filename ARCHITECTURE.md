# System Architecture: Smart Hotel Booking System

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Layered Architecture](#layered-architecture)
- [Design Patterns](#design-patterns)
- [Component Diagram](#component-diagram)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Caching Strategy](#caching-strategy)
- [Error Handling](#error-handling)
- [Scalability Design](#scalability-design)

## Architecture Overview

The Smart Hotel Booking System follows a **Layered Architecture** pattern with clear separation of concerns, promoting maintainability, testability, and scalability.

### Architectural Principles

1. **Separation of Concerns**: Each layer has distinct responsibilities
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Single Responsibility**: Each component has one reason to change
4. **Open/Closed Principle**: Open for extension, closed for modification
5. **Interface Segregation**: Clients depend only on interfaces they use

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  • Vanilla JavaScript SPA                                   │
│  • HTML5 + CSS3                                             │
│  • Fetch API for HTTP requests                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTPS/JSON
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│  • ASP.NET Core 8.0 Web API                                 │
│  • Swagger/OpenAPI Documentation                            │
│  • JWT Bearer Authentication                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
│  • Service Classes (C#)                                     │
│  • Business Rules & Validation                              │
│  • AutoMapper for DTOs                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
│  • Entity Framework Core 8.0                                │
│  • LINQ Queries                                             │
│  • Code-First Approach                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  • SQL Server LocalDB (Development)                         │
│  • In-Memory Database (Testing)                             │
│  • SQL Server (Production)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer

**Responsibilities:**
- Handle HTTP requests and responses
- Route requests to appropriate controllers
- Validate input data
- Format output data
- Manage authentication tokens

**Components:**
- **Controllers**: API endpoints (AuthController, HotelsController, etc.)
- **DTOs**: Data transfer objects for API contracts
- **Filters**: Action filters for cross-cutting concerns
- **Middleware**: Request/response pipeline components

**Example Flow:**
```
HTTP Request → Middleware → Controller → Action Method → Response
```

### 2. Business Logic Layer

**Responsibilities:**
- Implement business rules
- Perform calculations and transformations
- Coordinate between data and presentation layers
- Handle complex workflows
- Manage caching and external services

**Components:**
- **Services**: Business logic implementation
  - `JwtService`: Token generation and validation
  - `PaymentService`: Payment processing logic
  - `LoyaltyService`: Points calculation
  - `ReviewService`: Rating calculations
  - `CacheService`: Caching operations
  - `ValidationService`: Business rule validation

**Service Pattern Example:**
```csharp
public interface ILoyaltyService
{
    Task<LoyaltyAccount> GetAccountAsync(int userId);
    Task AddPointsAsync(int userId, decimal amount, int bookingId);
    Task<List<PointsTransaction>> GetTransactionsAsync(int userId);
}

public class LoyaltyService : ILoyaltyService
{
    private readonly HotelContext _context;
    private readonly LoyaltySettings _settings;
    
    // Implementation...
}
```

### 3. Data Access Layer

**Responsibilities:**
- Manage database connections
- Execute queries and commands
- Map entities to database tables
- Handle transactions
- Seed sample data

**Components:**
- **HotelContext**: Entity Framework DbContext
- **Entities**: Domain models (User, Hotel, Booking, etc.)
- **Configurations**: Fluent API configurations
- **DataSeeder**: Sample data generation

**Entity Framework Pattern:**
```csharp
public class HotelContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Hotel> Hotels { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure relationships and constraints
    }
}
```

### 4. Cross-Cutting Concerns

**Components that span multiple layers:**

- **Logging**: Structured logging with ILogger
- **Error Handling**: Global exception middleware
- **Validation**: Input validation and business rules
- **Configuration**: appsettings.json management
- **Caching**: Memory cache for performance

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access logic

**Implementation**: Entity Framework DbContext acts as a repository

```csharp
// DbContext as Repository
public class HotelContext : DbContext
{
    // DbSets act as repositories for each entity
    public DbSet<Hotel> Hotels { get; set; }
    
    // Methods provide data access
    public async Task<Hotel> GetHotelByIdAsync(int id)
    {
        return await Hotels.FindAsync(id);
    }
}
```

**Benefits:**
- Centralized data access logic
- Easy to mock for testing
- Consistent query patterns

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic

**Implementation**: Dedicated service classes with interfaces

```csharp
// Interface defines contract
public interface IJwtService
{
    string GenerateToken(User user);
    ClaimsPrincipal ValidateToken(string token);
}

// Implementation contains business logic
public class JwtService : IJwtService
{
    private readonly JwtSettings _settings;
    
    public string GenerateToken(User user)
    {
        // Token generation logic
    }
}
```

**Benefits:**
- Reusable business logic
- Testable in isolation
- Clear separation from controllers

### 3. Dependency Injection Pattern

**Purpose**: Loose coupling and testability

**Implementation**: ASP.NET Core built-in DI container

```csharp
// Registration in Program.cs
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPaymentService, MockPaymentService>();

// Injection in controller
public class AuthController : ControllerBase
{
    private readonly IJwtService _jwtService;
    
    public AuthController(IJwtService jwtService)
    {
        _jwtService = jwtService;
    }
}
```

**Benefits:**
- Easy to swap implementations
- Simplified testing with mocks
- Automatic lifetime management

### 4. DTO Pattern

**Purpose**: Separate internal models from API contracts

**Implementation**: Dedicated DTO classes for requests/responses

```csharp
// Internal Entity
public class User
{
    public int Id { get; set; }
    public string PasswordHash { get; set; } // Never exposed
    // ... other properties
}

// API DTO
public class AuthResponse
{
    public string Token { get; set; }
    public UserDto User { get; set; } // No password
    public DateTime ExpiresAt { get; set; }
}
```

**Benefits:**
- API versioning support
- Security (hide sensitive data)
- Flexible API contracts

### 5. Middleware Pattern

**Purpose**: Request/response pipeline customization

**Implementation**: Custom middleware classes

```csharp
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
}
```

**Benefits:**
- Cross-cutting concerns
- Reusable pipeline components
- Clean separation of concerns

### 6. Factory Pattern

**Purpose**: Object creation abstraction

**Implementation**: Used in data seeding

```csharp
public static class DataSeeder
{
    public static async Task SeedAsync(HotelContext context)
    {
        // Factory methods for creating test data
        var users = CreateUsers();
        var hotels = CreateHotels(users);
        var bookings = CreateBookings(users, hotels);
    }
    
    private static List<User> CreateUsers()
    {
        // User creation logic
    }
}
```

## Component Diagram

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │    Mobile    │  │  Third-Party │     │
│  │     SPA      │  │     App      │  │     API      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Future)                     │
│  • Rate Limiting                                            │
│  • Load Balancing                                           │
│  • API Versioning                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ASP.NET Core API                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Pipeline                     │  │
│  │  • CORS                                              │  │
│  │  • Authentication                                    │  │
│  │  • Error Handling                                    │  │
│  │  • Logging                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers                             │  │
│  │  • Auth  • Hotels  • Bookings  • Reviews            │  │
│  │  • Payments  • Loyalty                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services                                │  │
│  │  • JWT  • Payment  • Loyalty  • Review              │  │
│  │  • Cache  • Validation                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Data Access (EF Core)                   │  │
│  │  • HotelContext  • Entities  • Migrations            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Database   │  │    Cache     │  │   Payment    │     │
│  │  SQL Server  │  │   (Memory)   │  │   Gateway    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Module Interaction

```
┌──────────────┐
│     Auth     │──────┐
│   Module     │      │
└──────────────┘      │
                      ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Hotel     │  │   Booking    │  │   Payment    │
│   Module     │─▶│   Module     │─▶│   Module     │
└──────────────┘  └──────────────┘  └──────────────┘
                      │                   │
                      ▼                   ▼
                  ┌──────────────┐  ┌──────────────┐
                  │   Review     │  │   Loyalty    │
                  │   Module     │  │   Module     │
                  └──────────────┘  └──────────────┘
```

## Data Flow

### Request Flow Example: Create Booking

```
1. Client Request
   POST /api/bookings
   Headers: Authorization: Bearer <token>
   Body: { hotelId, checkIn, checkOut, guests }
   
2. Middleware Pipeline
   ├─ CORS Middleware (allow origin)
   ├─ Authentication Middleware (validate JWT)
   ├─ Authorization Middleware (check role)
   └─ Error Handling Middleware (wrap in try-catch)
   
3. Controller Layer
   BookingsController.CreateBooking()
   ├─ Validate model state
   ├─ Extract user from claims
   └─ Call business logic
   
4. Business Logic Layer
   ValidationService.ValidateBooking()
   ├─ Check hotel exists
   ├─ Verify room availability
   ├─ Validate dates
   └─ Calculate total amount
   
5. Data Access Layer
   HotelContext.Bookings.Add()
   ├─ Create booking entity
   ├─ Update hotel availability
   ├─ Save changes to database
   └─ Return booking entity
   
6. Response Transformation
   ├─ Map entity to DTO
   ├─ Add location header
   └─ Return 201 Created
   
7. Client Response
   Status: 201 Created
   Body: { id, hotelName, total, status }
```

### Authentication Flow

```
1. Login Request
   POST /api/auth/login
   Body: { email, password }
   
2. AuthController
   ├─ Validate credentials
   ├─ Find user by email
   └─ Verify password hash
   
3. JwtService
   ├─ Create claims (id, email, role)
   ├─ Generate JWT token
   └─ Set expiration
   
4. Response
   ├─ Return token
   ├─ Return user info
   └─ Return expiration
   
5. Subsequent Requests
   ├─ Include token in header
   ├─ Middleware validates token
   └─ Extract user claims
```

## Security Architecture

### Authentication Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                       │
│  • Stores JWT token (localStorage/sessionStorage)           │
│  • Includes token in Authorization header                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ Bearer Token
┌─────────────────────────────────────────────────────────────┐
│                    API Server                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         JWT Authentication Middleware                │  │
│  │  1. Extract token from header                        │  │
│  │  2. Validate signature                               │  │
│  │  3. Check expiration                                 │  │
│  │  4. Verify issuer/audience                           │  │
│  │  5. Extract claims                                   │  │
│  │  6. Set HttpContext.User                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Authorization Middleware                     │  │
│  │  1. Check [Authorize] attribute                      │  │
│  │  2. Verify required roles                            │  │
│  │  3. Check resource ownership                         │  │
│  │  4. Allow/deny access                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Security Layers

1. **Transport Security**: HTTPS encryption
2. **Authentication**: JWT token validation
3. **Authorization**: Role-based access control
4. **Input Validation**: Model validation and sanitization
5. **Output Encoding**: Prevent XSS attacks
6. **SQL Injection Prevention**: Parameterized queries
7. **Password Security**: BCrypt hashing

## Caching Strategy

### Cache Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Flow                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Check Cache  │
                    └───────────────┘
                      │           │
                  Hit │           │ Miss
                      ▼           ▼
              ┌──────────┐  ┌──────────┐
              │  Return  │  │  Query   │
              │  Cached  │  │ Database │
              │   Data   │  │          │
              └──────────┘  └──────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │  Store in    │
                          │    Cache     │
                          └──────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │    Return    │
                          │     Data     │
                          └──────────────┘
```

### Cache Configuration

```csharp
// Cache Settings
{
  "Cache": {
    "DefaultExpirationMinutes": 30,
    "HotelCacheExpirationMinutes": 10
  }
}

// Cache Service Implementation
public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private readonly CacheSettings _settings;
    
    public async Task<T> GetOrCreateAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? expiration = null)
    {
        if (_cache.TryGetValue(key, out T value))
            return value;
            
        value = await factory();
        
        _cache.Set(key, value, expiration ?? 
            TimeSpan.FromMinutes(_settings.DefaultExpirationMinutes));
            
        return value;
    }
}
```

### Cached Resources

| Resource | Cache Key | Expiration | Invalidation |
|----------|-----------|------------|--------------|
| Hotel List | `hotels_all` | 10 minutes | On hotel update/delete |
| Hotel Details | `hotel_{id}` | 10 minutes | On hotel update |
| User Profile | `user_{id}` | 30 minutes | On profile update |

## Error Handling

### Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Processing                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Error Handling       │
                │  Middleware (Global)  │
                └───────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
                Success         Exception
                    │               │
                    ▼               ▼
            ┌──────────┐    ┌──────────────┐
            │  Return  │    │  Log Error   │
            │ Response │    │              │
            └──────────┘    └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │  Format      │
                            │  Error       │
                            │  Response    │
                            └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │  Return      │
                            │  Error       │
                            │  Response    │
                            └──────────────┘
```

### Error Response Format

```json
{
  "message": "Brief error description",
  "details": "Detailed error information",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### HTTP Status Code Strategy

| Status Code | Usage | Example |
|-------------|-------|---------|
| 200 OK | Successful GET | Get hotels |
| 201 Created | Successful POST | Create booking |
| 204 No Content | Successful DELETE | Delete review |
| 400 Bad Request | Validation error | Invalid email format |
| 401 Unauthorized | Authentication required | Missing token |
| 403 Forbidden | Insufficient permissions | Non-admin accessing admin endpoint |
| 404 Not Found | Resource not found | Hotel ID doesn't exist |
| 409 Conflict | Business rule violation | Room not available |
| 500 Internal Server Error | Unexpected error | Database connection failure |

## Scalability Design

### Current Architecture Scalability

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Future)                   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  API Server  │    │  API Server  │    │  API Server  │
│  Instance 1  │    │  Instance 2  │    │  Instance 3  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Distributed Cache   │
                │      (Redis)          │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Database Server     │
                │   (SQL Server)        │
                └───────────────────────┘
```

### Scalability Features

1. **Stateless API**: No server-side session state
2. **Horizontal Scaling**: Multiple API instances
3. **Database Separation**: Dedicated database server
4. **Caching Layer**: Reduce database load
5. **Async Operations**: Non-blocking I/O

### Future Enhancements

1. **Microservices Architecture**: Split into separate services
2. **Message Queue**: Async processing (RabbitMQ, Azure Service Bus)
3. **CDN Integration**: Static content delivery
4. **Database Replication**: Read replicas for queries
5. **API Gateway**: Centralized routing and rate limiting

## Conclusion

The Smart Hotel Booking System architecture is designed with:

- **Maintainability**: Clear separation of concerns
- **Testability**: Dependency injection and interfaces
- **Scalability**: Stateless design and caching
- **Security**: Multiple security layers
- **Performance**: Async operations and caching
- **Extensibility**: Open for enhancement

This architecture provides a solid foundation for a production-ready hotel booking system while remaining flexible for future enhancements and scaling requirements.

---

**Last Updated**: October 2025
