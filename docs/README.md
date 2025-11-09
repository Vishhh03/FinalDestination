# Final Destination - Module Documentation

## Overview
This folder contains detailed documentation for each module in the Final Destination hotel booking system.

## Module Documentation

### 1. [Authentication Module](01_AUTHENTICATION_MODULE.md)
JWT-based authentication with role-based authorization.
- User registration and login
- Password hashing with BCrypt
- JWT token management
- Role-based access control (Guest, HotelManager, Admin)

### 2. [Hotels Module](02_HOTELS_MODULE.md)
Complete hotel management system.
- Hotel CRUD operations
- Search and filtering
- Review system
- Image support
- Manager dashboard

### 3. [Bookings Module](03_BOOKINGS_MODULE.md)
Hotel booking system with loyalty integration.
- Booking creation and management
- Date validation
- Room availability
- Loyalty points earning and redemption
- Booking status tracking

### 4. [Payments Module](04_PAYMENTS_MODULE.md)
Simulated payment processing system.
- Multiple payment methods
- Card validation
- Transaction tracking
- Payment status management
- ⚠️ Demo only - use real gateway in production

### 5. [Loyalty Module](05_LOYALTY_MODULE.md)
Points-based loyalty program.
- Automatic points earning (Floor(Amount/10), min 100)
- Points redemption (100 points = $1, max 50%)
- Transaction history
- Points balance tracking

## Quick Reference

### User Roles
- **Guest** (1) - Regular users
- **HotelManager** (2) - Hotel managers
- **Admin** (3) - System administrators

### Loyalty Points
- **Earning**: Floor(BookingAmount / 10), minimum 100 points
- **Redemption**: 100 points = $1 discount, maximum 50% of booking

### Booking Statuses
- **Confirmed** (1) - Active booking
- **Cancelled** (2) - User cancelled
- **Completed** (3) - Check-out passed

### Payment Statuses
- **Pending** (0) - Awaiting payment
- **Completed** (1) - Payment successful
- **Failed** (2) - Payment failed
- **Refunded** (3) - Payment refunded

## Architecture

```
Frontend (Angular 18)
    ↓
API Controllers
    ↓
Business Logic
    ↓
Entity Framework Core
    ↓
SQL Server Database
```

## Getting Started

1. Read the [Authentication Module](01_AUTHENTICATION_MODULE.md) first
2. Explore modules relevant to your work
3. Check API examples in each module
4. Review integration points between modules

## Additional Resources
- Main README: `../README.md`
- System Documentation: `../SYSTEM_DOCUMENTATION.md`
