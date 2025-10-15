# Quick Start Guide

> Get up and running with the Smart Hotel Booking System in 5 minutes

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server LocalDB](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (or use in-memory database)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Smart-Hotel-Booking-System
```

### 2. Navigate to Project

```bash
cd finaldestination
```

### 3. Restore Dependencies

```bash
dotnet restore
```

### 4. Run the Application

```bash
dotnet run
```

The application will start at:
- **HTTPS**: https://localhost:7000
- **HTTP**: http://localhost:5000
- **Swagger UI**: https://localhost:7000 (opens automatically)

## First Steps

### 1. Access Swagger UI

Open your browser to: https://localhost:7000

### 2. Login

1. In Swagger UI, expand **Auth** section
2. Click **POST /api/auth/login**
3. Click **Try it out**
4. Use these credentials:
   ```json
   {
     "email": "admin@hotel.com",
     "password": "Admin123!"
   }
   ```
5. Click **Execute**
6. Copy the `token` from the response

### 3. Authorize

1. Click the **Authorize** button at the top of Swagger UI
2. Enter: `Bearer <your-token>`
3. Click **Authorize**

### 4. Test an Endpoint

1. Expand **GET /api/bookings/my**
2. Click **Try it out**
3. Click **Execute**
4. You should see your bookings!

## Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hotel.com | Admin123! |
| Hotel Manager | manager@hotel.com | Manager123! |
| Guest | guest@example.com | Guest123! |

## Common Commands

```bash
# Run application
dotnet run

# Run with auto-restart on changes
dotnet watch run

# Build project
dotnet build

# Clean build
dotnet clean

# Restore packages
dotnet restore
```

## Quick API Tests

### Get All Hotels (No Auth Required)

```bash
curl https://localhost:7000/api/hotels
```

### Login

```bash
curl -X POST "https://localhost:7000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hotel.com", "password": "Admin123!"}'
```

### Get My Bookings (Auth Required)

```bash
curl -X GET "https://localhost:7000/api/bookings/my" \
  -H "Authorization: Bearer <your-token>"
```

## Troubleshooting

### Port Already in Use

```bash
# Windows - Find and kill process
netstat -ano | findstr :7000
taskkill /PID <process-id> /F
```

### Database Connection Error

```bash
# Start LocalDB
sqllocaldb start mssqllocaldb

# Or use in-memory database
# Set "UseLocalDb": false in appsettings.Development.json
```

### SSL Certificate Error

```bash
dotnet dev-certs https --trust
```

## Next Steps

- 📖 Read the [README](README.md) for project overview
- 🏗️ Review [ARCHITECTURE](ARCHITECTURE.md) for system design
- 📚 Check [API_REFERENCE](API_REFERENCE.md) for all endpoints
- 🔧 See [SETUP_GUIDE](SETUP_GUIDE.md) for detailed setup
- 🐛 Visit [TROUBLESHOOTING](TROUBLESHOOTING.md) for common issues

## Project Structure

```
Smart-Hotel-Booking-System/
├── README.md                    # Start here
├── QUICK_START.md              # This file
├── SETUP_GUIDE.md              # Detailed setup
├── API_REFERENCE.md            # API documentation
├── ARCHITECTURE.md             # System design
├── TROUBLESHOOTING.md          # Common issues
├── CONTRIBUTING.md             # How to contribute
├── CHANGELOG.md                # Version history
│
├── docs/                       # Module documentation
│   ├── MODULE_INDEX.md
│   ├── AUTHENTICATION_MODULE.md
│   ├── HOTEL_MODULE.md
│   └── ... (other modules)
│
└── finaldestination/           # Main application
    ├── Program.cs
    ├── Controllers/
    ├── Services/
    ├── Models/
    └── ... (other folders)
```

## Key Features

- ✅ JWT Authentication
- ✅ Hotel Management
- ✅ Booking System
- ✅ Payment Processing
- ✅ Review System
- ✅ Loyalty Program
- ✅ Swagger UI
- ✅ Sample Data

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/{id}` - Get hotel by ID
- `GET /api/hotels/search` - Search hotels
- `POST /api/hotels` - Create hotel (Manager/Admin)

### Bookings
- `GET /api/bookings/my` - Get my bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}/cancel` - Cancel booking

### Reviews
- `GET /api/reviews/hotel/{hotelId}` - Get hotel reviews
- `POST /api/reviews` - Submit review

### Loyalty
- `GET /api/loyalty/account` - Get loyalty account
- `GET /api/loyalty/transactions` - Get transaction history

## Support

- 📖 [Full Documentation](README.md)
- 🐛 [Troubleshooting Guide](TROUBLESHOOTING.md)
- 💬 [Open an Issue](https://github.com/OWNER/REPO/issues)

---

**Ready to dive deeper?** Check out the [complete documentation](README.md)!

**Last Updated**: October 2025
