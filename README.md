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

A comprehensive hotel booking API demonstrating modern ASP.NET Core development practices. Built for the **Genc Training Project**, this system showcases enterprise-grade architecture, security, and best practices suitable for production use.

## ✨ Key Features

- **🔐 Authentication**: JWT-based auth with role-based authorization (Admin, Hotel Manager, Guest)
- **🏨 Hotel Management**: CRUD operations, search/filtering, caching, rating system
- **📅 Booking System**: Room availability, booking lifecycle, date validation
- **💳 Payment Processing**: Mock payment service, multiple methods, refunds
- **⭐ Reviews & Ratings**: 1-5 star system with automatic hotel rating calculation
- **🎁 Loyalty Program**: Points-based rewards (10% of booking amount)
- **🛡️ Infrastructure**: Global error handling, validation, logging, Swagger UI

## 🛠️ Technology Stack

- **ASP.NET Core 8.0** - Web API framework
- **Entity Framework Core 8.0** - ORM with SQL Server LocalDB
- **JWT Bearer Authentication** - Stateless auth with BCrypt password hashing
- **Swagger/OpenAPI** - Interactive API documentation
- **AutoMapper** - DTO mapping
- **IMemoryCache** - Performance caching

## 🚀 Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server LocalDB](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (optional - can use in-memory DB)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Smart-Hotel-Booking-System/finaldestination

# Restore and run
dotnet restore
dotnet run
```

### Access the API

- **Swagger UI**: https://localhost:7000
- **API Base**: https://localhost:7000/api

### First API Call

1. Open Swagger UI at https://localhost:7000
2. Expand **POST /api/auth/login**
3. Click **Try it out** and use:
   ```json
   {
     "email": "admin@hotel.com",
     "password": "Admin123!"
   }
   ```
4. Copy the token from response
5. Click **Authorize** button, enter: `Bearer <your-token>`
6. Now test any protected endpoint!

**Tip**: Set `"UseLocalDb": false` in `appsettings.Development.json` to use in-memory database (no SQL Server needed)

## 📁 Project Structure

```
Smart-Hotel-Booking-System/
├── README.md                    # Project overview
├── ARCHITECTURE.md              # System design & patterns
├── API_REFERENCE.md             # Complete API documentation
├── SETUP_GUIDE.md               # Detailed setup instructions
├── TROUBLESHOOTING.md           # Common issues & solutions
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
│
├── docs/                        # Module documentation
│   ├── MODULE_INDEX.md          # Module overview
│   ├── AUTHENTICATION_MODULE.md
│   ├── HOTEL_MODULE.md
│   ├── BOOKING_MODULE.md
│   ├── PAYMENT_MODULE.md
│   ├── REVIEW_MODULE.md
│   ├── LOYALTY_MODULE.md
│   ├── DATA_MODULE.md
│   ├── FRONTEND_MODULE.md
│   └── INFRASTRUCTURE_MODULE.md
│
└── finaldestination/            # Main API project
    ├── Controllers/             # API endpoints
    ├── Services/                # Business logic
    ├── Models/                  # Domain entities
    ├── DTOs/                    # Data transfer objects
    ├── Data/                    # EF Core context
    ├── Middleware/              # Custom middleware
    ├── Configuration/           # Settings classes
    └── wwwroot/                 # Frontend SPA
```

## 📚 Documentation

| Document                                         | Description                           |
| ------------------------------------------------ | ------------------------------------- |
| **[ARCHITECTURE.md](ARCHITECTURE.md)**           | System design, patterns, and diagrams |
| **[API_REFERENCE.md](API_REFERENCE.md)**         | Complete API endpoint documentation   |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)**             | Detailed setup for all environments   |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**     | Common issues and solutions           |
| **[docs/MODULE_INDEX.md](docs/MODULE_INDEX.md)** | Module-specific documentation         |
| **[CONTRIBUTING.md](CONTRIBUTING.md)**           | Contribution guidelines               |
| **[CHANGELOG.md](CHANGELOG.md)**                 | Version history                       |

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

See **[API_REFERENCE.md](API_REFERENCE.md)** for complete documentation or use **Swagger UI** at https://localhost:7000

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code standards, workflow, and pull requests.

## 📄 License

Educational project developed for the Genc Training Program.

---

**Built with ASP.NET Core 8.0** | _Last Updated: October 2025_
