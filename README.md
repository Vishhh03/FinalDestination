# Smart Hotel Booking System (FinalDestination API)

> A comprehensive, production-ready hotel booking management system built with ASP.NET Core 8, demonstrating enterprise-grade architecture, security, and best practices.

[![.NET Version](https://img.shields.io/badge/.NET-8.0-512BD4)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/license-Educational-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-success)](https://github.com)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Sample Credentials](#sample-credentials)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The **Smart Hotel Booking System** (branded as FinalDestination API) is a full-featured hotel reservation platform designed for learning and demonstrating modern ASP.NET Core development practices. This project showcases:

- **Enterprise Architecture**: Clean separation of concerns with service layer pattern
- **Security First**: JWT authentication with role-based authorization
- **Production Ready**: Comprehensive error handling, logging, and validation
- **Developer Friendly**: Extensive documentation, sample data, and Swagger UI
- **Best Practices**: Following SOLID principles and industry standards

### Project Context

This system was developed as part of the **Genc Training Project** to demonstrate proficiency in:
- RESTful API design and implementation
- Database design and Entity Framework Core
- Authentication and authorization patterns
- Modern software architecture principles
- Professional documentation practices

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Role-based access control (Admin, Hotel Manager, Guest)
- Secure password hashing with BCrypt
- Token refresh mechanism
- Hotel manager application workflow

### 🏨 Hotel Management
- Complete CRUD operations for hotels
- Advanced search and filtering (city, price, rating)
- Memory caching for improved performance
- Hotel rating system with automatic calculation
- Manager-specific hotel ownership

### 📅 Booking System
- Room availability management
- Booking creation and cancellation
- Date validation and conflict prevention
- Booking status tracking (Confirmed, Cancelled, Completed)
- User-specific booking history

### 💳 Payment Processing
- Mock payment service with realistic simulation
- Multiple payment methods support
- Payment status tracking
- Refund processing (Admin only)
- Transaction history

### ⭐ Review & Rating System
- Hotel reviews with 1-5 star ratings
- Automatic hotel rating calculation
- Review management (create, update, delete)
- User-specific review ownership
- Review validation and moderation

### 🎁 Loyalty Program
- Points-based rewards system
- Automatic points calculation (10% of booking amount)
- Points transaction history
- Minimum booking threshold
- Points balance tracking

### 🛡️ Infrastructure
- Global error handling middleware
- Comprehensive input validation
- Structured logging
- Environment-specific configurations
- Health check endpoints
- CORS support for development

## 🛠️ Technology Stack

### Backend Framework
- **ASP.NET Core 8.0** - Modern web framework
- **Entity Framework Core 8.0** - ORM for database operations
- **SQL Server LocalDB** - Development database
- **In-Memory Database** - Testing alternative

### Security & Authentication
- **JWT Bearer Tokens** - Stateless authentication
- **BCrypt.Net-Next** - Password hashing
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT middleware

### API Documentation
- **Swashbuckle.AspNetCore** - Swagger/OpenAPI documentation
- **XML Documentation** - Enhanced API descriptions

### Data & Caching
- **IMemoryCache** - Built-in memory caching
- **AutoMapper** - Object-to-object mapping
- **LINQ** - Type-safe queries

### Development Tools
- **Visual Studio 2022** / **VS Code** - IDEs
- **Postman** - API testing
- **SQL Server Management Studio** - Database management

## 🚀 Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server LocalDB](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (or use in-memory database)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Smart-Hotel-Booking-System
   ```

2. **Restore dependencies**
   ```bash
   cd finaldestination
   dotnet restore
   ```

3. **Run the application**
   ```bash
   dotnet run
   ```

4. **Access the API**
   - Swagger UI: https://localhost:7000
   - API Base URL: https://localhost:7000/api

### Alternative: Use In-Memory Database

For quick testing without SQL Server:

```json
// In finaldestination/appsettings.Development.json
{
  "UseLocalDb": false
}
```

## 📁 Project Structure

```
Smart-Hotel-Booking-System/
├── 📄 README.md                          # This file - project overview
├── 📄 PROJECT_OVERVIEW.md                # Detailed project information
├── 📄 ARCHITECTURE.md                    # System architecture documentation
├── 📄 API_REFERENCE.md                   # Complete API endpoint reference
├── 📄 SETUP_GUIDE.md                     # Detailed setup instructions
├── 📄 DEPLOYMENT_GUIDE.md                # Production deployment guide
├── 📄 CONTRIBUTING.md                    # Contribution guidelines
├── 📄 CHANGELOG.md                       # Version history
├── 📄 LICENSE                            # License information
│
├── 📁 docs/                              # Detailed module documentation
│   ├── 📄 MODULE_INDEX.md                # Module documentation index
│   ├── 📄 AUTHENTICATION_MODULE.md       # Auth system documentation
│   ├── 📄 HOTEL_MODULE.md                # Hotel management documentation
│   ├── 📄 BOOKING_MODULE.md              # Booking system documentation
│   ├── 📄 PAYMENT_MODULE.md              # Payment processing documentation
│   ├── 📄 REVIEW_MODULE.md               # Review system documentation
│   ├── 📄 LOYALTY_MODULE.md              # Loyalty program documentation
│   ├── 📄 DATA_MODULE.md                 # Data layer documentation
│   ├── 📄 FRONTEND_MODULE.md             # Frontend documentation
│   └── 📄 INFRASTRUCTURE_MODULE.md       # Infrastructure documentation
│
├── 📁 finaldestination/                  # Main API project
│   ├── 📄 Program.cs                     # Application entry point
│   ├── 📄 appsettings.json               # Configuration settings
│   ├── 📄 appsettings.Development.json   # Development settings
│   │
│   ├── 📁 Controllers/                   # API endpoints
│   │   ├── AuthController.cs             # Authentication endpoints
│   │   ├── HotelsController.cs           # Hotel management
│   │   ├── BookingsController.cs         # Booking operations
│   │   ├── ReviewsController.cs          # Review system
│   │   ├── LoyaltyController.cs          # Loyalty program
│   │   └── PaymentsController.cs         # Payment processing
│   │
│   ├── 📁 Models/                        # Domain entities
│   │   ├── User.cs                       # User entity
│   │   ├── Hotel.cs                      # Hotel entity
│   │   ├── Booking.cs                    # Booking entity
│   │   ├── Review.cs                     # Review entity
│   │   ├── Payment.cs                    # Payment entity
│   │   ├── LoyaltyAccount.cs             # Loyalty account entity
│   │   └── HotelManagerApplication.cs    # Manager application entity
│   │
│   ├── 📁 DTOs/                          # Data transfer objects
│   │   ├── Auth/                         # Authentication DTOs
│   │   ├── Hotel/                        # Hotel DTOs
│   │   ├── Booking/                      # Booking DTOs
│   │   └── ...                           # Other DTOs
│   │
│   ├── 📁 Services/                      # Business logic
│   │   ├── JwtService.cs                 # JWT token management
│   │   ├── CacheService.cs               # Caching implementation
│   │   ├── MockPaymentService.cs         # Payment simulation
│   │   ├── ReviewService.cs              # Review logic
│   │   ├── LoyaltyService.cs             # Loyalty calculations
│   │   ├── ValidationService.cs          # Business validation
│   │   └── DataSeeder.cs                 # Sample data generation
│   │
│   ├── 📁 Interfaces/                    # Service contracts
│   │   ├── IJwtService.cs
│   │   ├── ICacheService.cs
│   │   ├── IPaymentService.cs
│   │   └── ...
│   │
│   ├── 📁 Data/                          # Data access layer
│   │   └── HotelContext.cs               # EF Core DbContext
│   │
│   ├── 📁 Middleware/                    # Custom middleware
│   │   └── ErrorHandlingMiddleware.cs    # Global error handling
│   │
│   ├── 📁 Filters/                       # Action filters
│   │   └── ValidationFilter.cs           # Validation filter
│   │
│   ├── 📁 Configuration/                 # Configuration classes
│   │   ├── JwtSettings.cs
│   │   ├── CacheSettings.cs
│   │   ├── PaymentSettings.cs
│   │   └── LoyaltySettings.cs
│   │
│   ├── 📁 Validation/                    # Custom validation
│   │   └── CustomValidationAttributes.cs
│   │
│   └── 📁 wwwroot/                       # Frontend application
│       ├── index.html                    # Main HTML file
│       ├── 📁 css/                       # Stylesheets
│       ├── 📁 js/                        # JavaScript files
│       └── 📁 assets/                    # Images and resources
│
└── 📁 tests/                             # Test projects (future)
    ├── UnitTests/
    └── IntegrationTests/
```

## 📚 Documentation

### Core Documentation
- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Comprehensive project information and requirements
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design patterns
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API endpoint documentation
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step setup instructions
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment guide

### Module Documentation
- **[docs/MODULE_INDEX.md](docs/MODULE_INDEX.md)** - Module documentation index
- **[docs/AUTHENTICATION_MODULE.md](docs/AUTHENTICATION_MODULE.md)** - Authentication system
- **[docs/HOTEL_MODULE.md](docs/HOTEL_MODULE.md)** - Hotel management
- **[docs/BOOKING_MODULE.md](docs/BOOKING_MODULE.md)** - Booking system
- **[docs/PAYMENT_MODULE.md](docs/PAYMENT_MODULE.md)** - Payment processing
- **[docs/REVIEW_MODULE.md](docs/REVIEW_MODULE.md)** - Review system
- **[docs/LOYALTY_MODULE.md](docs/LOYALTY_MODULE.md)** - Loyalty program

### Additional Resources
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and updates

## 🔑 Sample Credentials

The application automatically seeds sample data for testing:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@hotel.com | Admin123! | Full system access |
| **Hotel Manager** | manager@hotel.com | Manager123! | Hotel management access |
| **Guest** | guest@example.com | Guest123! | Standard user access |

### Sample Data Includes:
- **8 Users** (1 Admin, 2 Hotel Managers, 5 Guests)
- **6 Hotels** (Various cities and price ranges)
- **8 Bookings** (Different statuses and dates)
- **10 Reviews** (Realistic ratings and comments)
- **5 Loyalty Accounts** (With points and transactions)
- **8 Payments** (Including successful and refunded)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/apply-hotel-manager` - Apply for hotel manager role
- `GET /api/auth/my-application` - Check application status
- `GET /api/auth/admin/applications` - View all applications (Admin)
- `POST /api/auth/admin/applications/{id}/process` - Process application (Admin)

### Hotels
- `GET /api/hotels` - Get all hotels (cached)
- `GET /api/hotels/{id}` - Get hotel by ID
- `GET /api/hotels/search` - Search hotels
- `POST /api/hotels` - Create hotel (Manager/Admin)
- `PUT /api/hotels/{id}` - Update hotel (Manager/Admin)
- `DELETE /api/hotels/{id}` - Delete hotel (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings (Admin)
- `GET /api/bookings/my` - Get my bookings
- `GET /api/bookings/{id}` - Get booking by ID
- `GET /api/bookings/search` - Search bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/{id}/payment` - Process payment
- `PUT /api/bookings/{id}/cancel` - Cancel booking

### Reviews
- `GET /api/reviews/hotel/{hotelId}` - Get hotel reviews
- `POST /api/reviews` - Submit review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review

### Loyalty
- `GET /api/loyalty/account` - Get loyalty account
- `GET /api/loyalty/transactions` - Get transaction history

### Payments
- `GET /api/payments/{id}` - Get payment details
- `POST /api/payments/{id}/refund` - Process refund (Admin)

For detailed API documentation with request/response examples, see [API_REFERENCE.md](API_REFERENCE.md) or visit the Swagger UI at https://localhost:7000

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Coding standards
- Pull request process
- Testing requirements

## 📄 License

This project is developed for educational purposes as part of the Genc Training Project. See [LICENSE](LICENSE) for more information.

## 🙏 Acknowledgments

- **Genc Training Program** - For providing the project requirements and learning opportunity
- **Microsoft** - For the excellent ASP.NET Core framework and documentation
- **.NET Community** - For the wealth of resources and best practices

## 📞 Support

For questions, issues, or suggestions:
- Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide
- Review the [API_REFERENCE.md](API_REFERENCE.md) documentation
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ using ASP.NET Core 8.0**

*Last Updated: October 2025*
