# Technical Architecture & Design Patterns

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Design Patterns](#design-patterns)
3. [Backend Technologies](#backend-technologies)
4. [Frontend Technologies](#frontend-technologies)
5. [Security Implementation](#security-implementation)
6. [Performance Optimization](#performance-optimization)
7. [Interview Preparation](#interview-preparation)

---

## System Architecture

### Overall Architecture Pattern
**Pattern**: **Three-Tier Architecture** (Presentation, Business Logic, Data Access)

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (Angular 18 SPA - Client-Side)     │
│  - Components                       │
│  - Services                         │
│  - Guards                           │
│  - Signals (Reactive State)         │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
               │ JSON
┌──────────────▼──────────────────────┐
│     Business Logic Layer            │
│  (ASP.NET Core Web API)             │
│  - Controllers                      │
│  - Services                         │
│  - DTOs                             │
│  - Middleware                       │
└──────────────┬──────────────────────┘
               │ Entity Framework Core
               │ LINQ
┌──────────────▼──────────────────────┐
│     Data Access Layer               │
│  (SQL Server LocalDB)               │
│  - DbContext                        │
│  - Models/Entities                  │
│  - Migrations                       │
└─────────────────────────────────────┘
```

**Why This Architecture?**
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Maintainability**: Changes in one layer don't affect others
- **Testability**: Each layer can be tested independently
- **Scalability**: Layers can be scaled independently
- **Reusability**: Business logic can be reused across different UIs

---

## Design Patterns

### 1. Repository Pattern
**Location**: Implicit through Entity Framework Core DbContext

**What**: Abstracts data access logic and provides a collection-like interface for accessing domain objects.

**Why Used**:
- Centralizes data access logic
- Makes code more testable (can mock repositories)
- Provides flexibility to change data source

**Example**:
```csharp
// DbContext acts as repository
public class HotelContext : DbContext
{
    public DbSet<Hotel> Hotels { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    // ...
}

// Usage in controller
var hotels = await _context.Hotels
    .Include(h => h.Manager)
    .ToListAsync();
```

### 2. Dependency Injection (DI)
**Location**: Throughout the application (Program.cs, Controllers, Services)

**What**: Inversion of Control (IoC) pattern where dependencies are injected rather than created.

**Why Used**:
- Loose coupling between components
- Easier testing (can inject mocks)
- Better code organization
- Lifecycle management

**Example**:
```csharp
// Registration in Program.cs
builder.Services.AddScoped<IPaymentService, MockPaymentService>();
builder.Services.AddScoped<ILoyaltyService, LoyaltyService>();

// Injection in controller
public class BookingsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    
    public BookingsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }
}
```

**Service Lifetimes**:
- **Scoped**: Created once per request (most services)
- **Singleton**: Created once for application lifetime (cache)
- **Transient**: Created each time requested

### 3. Data Transfer Object (DTO) Pattern
**Location**: `DTOs/` folder

**What**: Objects that carry data between processes to reduce method calls.

**Why Used**:
- Decouples internal models from API contracts
- Reduces data exposure (security)
- Enables data transformation
- Validates input data

**Example**:
```csharp
// DTO for creating hotel
public class CreateHotelRequest
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; }
    
    [Range(0.01, 10000.00)]
    public decimal PricePerNight { get; set; }
}

// Internal model
public class Hotel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal PricePerNight { get; set; }
    public DateTime CreatedAt { get; set; }
    // ... more internal fields
}
```

### 4. Service Layer Pattern
**Location**: `Services/` folder

**What**: Encapsulates business logic in dedicated service classes.

**Why Used**:
- Separates business logic from controllers
- Promotes code reuse
- Makes testing easier
- Single Responsibility Principle

**Example**:
```csharp
public interface ILoyaltyService
{
    Task AwardPointsAsync(int userId, int bookingId, decimal amount);
    Task<RedemptionResult> RedeemPointsAsync(int userId, int points);
}

public class LoyaltyService : ILoyaltyService
{
    // Business logic for loyalty points
}
```

### 5. Middleware Pattern
**Location**: `Middleware/ErrorHandlingMiddleware.cs`

**What**: Components that form a pipeline to process HTTP requests/responses.

**Why Used**:
- Cross-cutting concerns (logging, error handling)
- Request/response transformation
- Authentication/Authorization
- Centralized error handling

**Example**:
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

### 6. Guard Pattern (Frontend)
**Location**: `guards/auth.guard.ts`

**What**: Controls navigation based on conditions.

**Why Used**:
- Route protection
- Authorization checks
- Prevents unauthorized access
- Improves security

**Example**:
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
```

### 7. Observer Pattern (Signals)
**Location**: Throughout Angular components

**What**: Reactive state management using Angular Signals.

**Why Used**:
- Automatic UI updates
- Better performance than Zone.js
- Simpler than RxJS for simple state
- Fine-grained reactivity

**Example**:
```typescript
export class HotelsComponent {
  hotels = signal<Hotel[]>([]);
  loading = signal(false);
  
  async loadHotels() {
    this.loading.set(true);
    const data = await this.hotelService.getAll();
    this.hotels.set(data);
    this.loading.set(false);
  }
}
```

### 8. Strategy Pattern
**Location**: Payment processing

**What**: Defines a family of algorithms and makes them interchangeable.

**Why Used**:
- Multiple payment methods
- Easy to add new payment types
- Encapsulates payment logic

**Example**:
```csharp
public interface IPaymentService
{
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
}

// Can swap implementations
public class MockPaymentService : IPaymentService { }
public class StripePaymentService : IPaymentService { }
public class PayPalPaymentService : IPaymentService { }
```

### 9. Factory Pattern
**Location**: Data seeding

**What**: Creates objects without specifying exact class.

**Why Used**:
- Centralized object creation
- Consistent data generation
- Easy to modify seed data

**Example**:
```csharp
public static class DataSeeder
{
    public static async Task SeedAsync(HotelContext context)
    {
        await SeedUsersAsync(context);
        await SeedHotelsAsync(context);
        // ...
    }
}
```

### 10. Decorator Pattern
**Location**: Authorization attributes

**What**: Adds behavior to objects dynamically.

**Why Used**:
- Adds authorization without modifying methods
- Declarative security
- Reusable across controllers

**Example**:
```csharp
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult> GetAllUsers() { }
}
```

---

## Backend Technologies

### 1. ASP.NET Core 8.0
**What**: Cross-platform, high-performance framework for building modern web applications.

**Why Used**:
- High performance (Kestrel web server)
- Cross-platform (Windows, Linux, macOS)
- Built-in dependency injection
- Middleware pipeline
- Strong typing with C#
- Excellent tooling (Visual Studio, VS Code)

**Key Features Used**:
- Web API controllers
- Entity Framework Core
- JWT authentication
- Middleware
- Dependency injection
- Model validation

### 2. Entity Framework Core
**What**: Object-Relational Mapper (ORM) for .NET.

**Why Used**:
- Eliminates boilerplate data access code
- LINQ queries (type-safe)
- Automatic migrations
- Change tracking
- Lazy/eager loading
- Database provider abstraction

**Example**:
```csharp
// LINQ query instead of SQL
var hotels = await _context.Hotels
    .Where(h => h.City == "Mumbai")
    .Include(h => h.Manager)
    .OrderBy(h => h.PricePerNight)
    .ToListAsync();
```

### 3. SQL Server LocalDB
**What**: Lightweight version of SQL Server for development.

**Why Used**:
- Full SQL Server features
- No installation required
- Easy development setup
- Production-ready (can migrate to full SQL Server)

### 4. BCrypt.Net
**What**: Password hashing library.

**Why Used**:
- Industry-standard hashing algorithm
- Automatic salt generation
- Configurable work factor
- Resistant to rainbow table attacks
- One-way hashing (secure)

**Example**:
```csharp
// Hashing
string hash = BCrypt.Net.BCrypt.HashPassword(password);

// Verification
bool isValid = BCrypt.Net.BCrypt.Verify(password, hash);
```

### 5. JWT (JSON Web Tokens)
**What**: Compact, URL-safe means of representing claims.

**Why Used**:
- Stateless authentication
- No server-side session storage
- Works across domains
- Contains user claims
- Digitally signed (tamper-proof)

**Structure**:
```
Header.Payload.Signature
eyJhbGc...  .eyJ1c2Vy...  .SflKxwRJ...
```

**Claims**:
- User ID
- Email
- Name
- Role
- Expiration time

### 6. AutoMapper
**What**: Object-to-object mapping library.

**Why Used**:
- Reduces boilerplate mapping code
- Convention-based mapping
- Testable
- Maintainable

### 7. Swagger/OpenAPI
**What**: API documentation and testing tool.

**Why Used**:
- Interactive API documentation
- API testing interface
- Client code generation
- API contract definition

---

## Frontend Technologies

### 1. Angular 18
**What**: TypeScript-based web application framework.

**Why Used**:
- Component-based architecture
- Strong typing with TypeScript
- Dependency injection
- Reactive programming (RxJS)
- Signals for state management
- Excellent CLI tooling
- Large ecosystem

**Key Features**:
- Standalone components (no NgModules)
- Signals for reactive state
- Control flow syntax (@if, @for)
- Dependency injection
- Route guards
- HTTP client

### 2. TypeScript
**What**: Typed superset of JavaScript.

**Why Used**:
- Static type checking
- Better IDE support
- Catches errors at compile time
- Better refactoring
- Self-documenting code
- Modern JavaScript features

**Example**:
```typescript
interface Hotel {
  id: number;
  name: string;
  pricePerNight: number;
}

function getHotel(id: number): Promise<Hotel> {
  // Type-safe
}
```

### 3. Angular Signals
**What**: Reactive state management primitive.

**Why Used**:
- Fine-grained reactivity
- Better performance than Zone.js
- Simpler than RxJS for simple state
- Automatic change detection
- Composable

**Example**:
```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log('Count:', count());
});

count.set(5); // Automatically triggers effect
```

### 4. RxJS (Reactive Extensions)
**What**: Library for reactive programming using observables.

**Why Used**:
- Asynchronous data streams
- Powerful operators
- Event handling
- HTTP requests
- Cancellation support

**Example**:
```typescript
this.http.get<Hotel[]>('/api/hotels')
  .pipe(
    map(hotels => hotels.filter(h => h.rating > 4)),
    catchError(error => of([]))
  )
  .subscribe(hotels => this.hotels.set(hotels));
```

### 5. CSS3 & Modern Styling
**What**: Styling with modern CSS features.

**Features Used**:
- Flexbox & Grid layouts
- CSS Variables
- Gradients
- Transitions & Animations
- Media queries (responsive)
- Box shadows
- Border radius

**Example**:
```css
.card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}
```

---

## Security Implementation

### 1. Authentication
**Method**: JWT (JSON Web Tokens)

**Flow**:
1. User submits credentials
2. Server validates and generates JWT
3. Client stores JWT in localStorage
4. Client sends JWT in Authorization header
5. Server validates JWT on each request

**Security Features**:
- Token expiration (24 hours)
- Signed with secret key
- Contains user claims
- Stateless (no server session)

### 2. Authorization
**Method**: Role-Based Access Control (RBAC)

**Implementation**:
```csharp
[Authorize(Roles = "Admin")]
[Authorize(Roles = "HotelManager,Admin")]
```

**Roles**:
- Guest (default)
- HotelManager
- Admin

### 3. Password Security
**Method**: BCrypt hashing

**Features**:
- Automatic salt generation
- Work factor: 10
- One-way hashing
- Rainbow table resistant

**Validation**:
- Minimum 8 characters
- Uppercase letter
- Lowercase letter
- Digit
- Special character

### 4. Input Validation
**Backend**: Data Annotations
```csharp
[Required]
[StringLength(200, MinimumLength = 2)]
[EmailAddress]
[Range(0.01, 10000.00)]
```

**Frontend**: Form validation
```typescript
if (!email || !email.includes('@')) {
  this.error.set('Invalid email');
}
```

### 5. SQL Injection Prevention
**Method**: Entity Framework Core parameterized queries

**Why Safe**:
- All queries are parameterized
- No string concatenation
- LINQ to SQL translation

### 6. XSS Prevention
**Method**: Angular sanitization

**Features**:
- Automatic HTML escaping
- Safe property binding
- DomSanitizer for trusted content

### 7. CORS Configuration
**Implementation**:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

---

## Performance Optimization

### 1. Caching Strategy
**Implementation**: In-memory caching

**What's Cached**:
- Hotel listings (10 minutes)
- Individual hotels (10 minutes)
- Search results (10 minutes)

**Why**:
- Reduces database queries
- Faster response times
- Lower server load

**Example**:
```csharp
var cachedHotels = await _cache.GetAsync<List<Hotel>>(HOTELS_CACHE_KEY);
if (cachedHotels != null)
{
    return Ok(cachedHotels);
}

// Fetch from database and cache
var hotels = await _context.Hotels.ToListAsync();
await _cache.SetAsync(HOTELS_CACHE_KEY, hotels, TimeSpan.FromMinutes(10));
```

### 2. Lazy Loading
**Implementation**: Entity Framework Core

**What**: Load related data only when accessed.

**Why**:
- Reduces initial query size
- Loads data on demand
- Better performance for large datasets

### 3. Eager Loading
**Implementation**: Include() method

**What**: Load related data in single query.

**Why**:
- Prevents N+1 query problem
- Single database round-trip
- Better for frequently accessed relations

**Example**:
```csharp
var hotels = await _context.Hotels
    .Include(h => h.Manager)
    .Include(h => h.Reviews)
    .ToListAsync();
```

### 4. Pagination
**Implementation**: Skip/Take pattern

**Why**:
- Reduces data transfer
- Faster page loads
- Better user experience

**Example**:
```typescript
const pageSize = 9;
const skip = (currentPage - 1) * pageSize;
const paginatedHotels = allHotels.slice(skip, skip + pageSize);
```

### 5. Async/Await
**Implementation**: Throughout application

**Why**:
- Non-blocking I/O
- Better scalability
- Efficient resource usage

**Example**:
```csharp
public async Task<ActionResult<Hotel>> GetHotel(int id)
{
    var hotel = await _context.Hotels.FindAsync(id);
    return Ok(hotel);
}
```

### 6. Signal-Based Reactivity
**Implementation**: Angular Signals

**Why**:
- Fine-grained updates
- No Zone.js overhead
- Better performance
- Automatic change detection

### 7. Image Optimization
**Implementation**: File size limits, format restrictions

**Features**:
- Max 5MB file size
- Supported formats: JPG, PNG, WebP
- Server-side validation
- Unique filenames (GUID)

---

## Interview Preparation

### Common Questions & Answers

#### 1. "Explain the architecture of your application"
**Answer**: 
"The application follows a three-tier architecture with clear separation of concerns. The presentation layer is built with Angular 18, providing a reactive SPA experience. The business logic layer uses ASP.NET Core Web API with RESTful endpoints, implementing services for business rules. The data access layer uses Entity Framework Core with SQL Server, providing an ORM abstraction. This architecture ensures maintainability, testability, and scalability."

#### 2. "How do you handle authentication and authorization?"
**Answer**:
"We use JWT-based authentication for stateless, scalable auth. When users log in, the server validates credentials, hashes passwords with BCrypt, and generates a JWT containing user claims (ID, role, email). The client stores this token and sends it in the Authorization header for subsequent requests. Authorization is role-based using [Authorize] attributes with three roles: Guest, HotelManager, and Admin. This provides fine-grained access control."

#### 3. "What design patterns did you use and why?"
**Answer**:
"I implemented several patterns: Repository pattern through EF Core DbContext for data access abstraction; Dependency Injection for loose coupling and testability; DTO pattern to decouple API contracts from internal models; Service Layer pattern to encapsulate business logic; Middleware pattern for cross-cutting concerns like error handling; and Strategy pattern for payment processing. Each pattern solves specific problems and improves code quality."

#### 4. "How do you ensure security?"
**Answer**:
"Security is multi-layered: BCrypt password hashing with automatic salts; JWT tokens with expiration; role-based authorization; input validation using Data Annotations; parameterized queries via EF Core to prevent SQL injection; Angular's built-in XSS protection; HTTPS in production; and file upload validation. We also implement proper error handling without exposing sensitive information."

#### 5. "How did you optimize performance?"
**Answer**:
"Performance optimization includes: in-memory caching for frequently accessed data with 10-minute TTL; eager loading with Include() to prevent N+1 queries; pagination to reduce data transfer; async/await throughout for non-blocking I/O; Angular Signals for fine-grained reactivity; and image upload restrictions (5MB limit, specific formats). These strategies significantly improve response times and user experience."

#### 6. "Explain your state management approach"
**Answer**:
"I use Angular Signals for reactive state management. Signals provide fine-grained reactivity without Zone.js overhead, automatic change detection, and composability through computed signals and effects. For example, the hotels list is a signal that automatically updates the UI when changed. For complex async operations, I combine Signals with async/await for clean, readable code."

#### 7. "How do you handle errors?"
**Answer**:
"Error handling is centralized using middleware on the backend and try-catch blocks with user-friendly messages on the frontend. The ErrorHandlingMiddleware catches all exceptions, logs them, and returns consistent error responses. Frontend services catch errors and display appropriate messages to users. We also use validation filters to catch bad requests early and return detailed validation errors."

#### 8. "What's your database strategy?"
**Answer**:
"We use Entity Framework Core with SQL Server LocalDB for development. EF Core provides LINQ queries for type safety, automatic migrations for schema changes, and change tracking. We use both eager loading (Include) for related data and lazy loading when appropriate. The DbContext is registered as scoped in DI, ensuring one instance per request. For production, we'd migrate to full SQL Server."

#### 9. "How do you manage file uploads?"
**Answer**:
"File uploads are handled through a dedicated UploadController with security measures: file type validation (JPG, PNG, WebP only), size limits (5MB max), unique filenames using GUIDs to prevent conflicts, storage in wwwroot/uploads with proper permissions, and authorization requirements (HotelManager/Admin only). Files are served as static content through ASP.NET Core's static files middleware."

#### 10. "Explain your testing strategy"
**Answer**:
"While comprehensive tests aren't implemented yet, the architecture supports testing: services use interfaces for easy mocking, dependency injection allows test doubles, DTOs separate concerns for unit testing, and the service layer isolates business logic. I would implement unit tests for services, integration tests for controllers, and E2E tests for critical user flows using xUnit, Moq, and Angular testing utilities."

### Key Technical Terms to Know

**Backend**:
- ASP.NET Core, Web API, RESTful
- Entity Framework Core, LINQ, DbContext
- Dependency Injection, Scoped/Singleton/Transient
- Middleware, Filters, Attributes
- JWT, BCrypt, Authentication, Authorization
- DTO, Model, Entity
- Async/Await, Task, IActionResult
- SQL Server, LocalDB, Migrations

**Frontend**:
- Angular, TypeScript, SPA
- Signals, Computed, Effect
- Component, Service, Guard
- Dependency Injection, Injectable
- RxJS, Observable, Promise
- HTTP Client, Interceptor
- Routing, Navigation
- Template-driven forms, Reactive forms

**Patterns & Principles**:
- SOLID principles
- DRY (Don't Repeat Yourself)
- Separation of Concerns
- Repository Pattern
- Service Layer Pattern
- DTO Pattern
- Strategy Pattern
- Observer Pattern
- Dependency Injection
- Middleware Pattern

**Security**:
- JWT, Bearer token
- BCrypt, Hashing, Salt
- RBAC (Role-Based Access Control)
- XSS, SQL Injection, CORS
- HTTPS, TLS/SSL
- Input validation, Sanitization

**Performance**:
- Caching, In-memory cache
- Lazy loading, Eager loading
- Pagination, Skip/Take
- Async/Await, Non-blocking I/O
- N+1 query problem
- Database indexing

---

## Conclusion

This application demonstrates modern full-stack development practices with:
- Clean architecture and separation of concerns
- Industry-standard security practices
- Performance optimization techniques
- Scalable and maintainable code structure
- Modern frameworks and technologies
- Professional UI/UX design

The technical decisions were made to balance development speed, code quality, security, and performance while following industry best practices.
