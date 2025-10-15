# Setup Guide: Smart Hotel Booking System

> Complete step-by-step instructions for setting up the development environment

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

#### 1. .NET 8 SDK

**Download**: [https://dotnet.microsoft.com/download/dotnet/8.0](https://dotnet.microsoft.com/download/dotnet/8.0)

**Verify Installation**:
```bash
dotnet --version
# Should output: 8.0.x or higher
```

**Supported Platforms**:
- Windows 10/11 (x64, x86, ARM64)
- macOS 10.15+ (x64, ARM64)
- Linux (various distributions)

#### 2. SQL Server LocalDB (Recommended)

**Option A: Install with Visual Studio 2022**
- Download Visual Studio 2022 Community (free)
- Select "ASP.NET and web development" workload
- LocalDB is included automatically

**Option B: Standalone Installation**
- Download SQL Server Express with LocalDB
- Link: [https://www.microsoft.com/en-us/sql-server/sql-server-downloads](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

**Verify Installation**:
```bash
sqllocaldb info
# Should list available LocalDB instances
```

**Start LocalDB**:
```bash
sqllocaldb start mssqllocaldb
```

#### 3. Git (for version control)

**Download**: [https://git-scm.com/downloads](https://git-scm.com/downloads)

**Verify Installation**:
```bash
git --version
```

### Recommended Tools

#### IDEs

**Visual Studio 2022** (Recommended for Windows)
- Edition: Community (free) or higher
- Workload: ASP.NET and web development
- Download: [https://visualstudio.microsoft.com/downloads/](https://visualstudio.microsoft.com/downloads/)

**Visual Studio Code** (Cross-platform)
- Download: [https://code.visualstudio.com/](https://code.visualstudio.com/)
- Required Extensions:
  - C# for Visual Studio Code (ms-dotnettools.csharp)
  - .NET Extension Pack (ms-dotnettools.vscode-dotnet-pack)
  - REST Client (humao.rest-client) - Optional

#### API Testing Tools

**Postman**
- Download: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
- Best for: Comprehensive API testing

**Insomnia**
- Download: [https://insomnia.rest/download](https://insomnia.rest/download)
- Best for: Lightweight API testing

**Thunder Client** (VS Code Extension)
- Install from VS Code marketplace
- Best for: In-editor API testing

#### Database Management (Optional)

**SQL Server Management Studio (SSMS)**
- Download: [Download SSMS](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- Best for: Advanced database management

**Azure Data Studio**
- Download: [Download Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/download-azure-data-studio)
- Best for: Cross-platform database management

## Installation Methods

### Method 1: Visual Studio 2022 (Recommended for Beginners)

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Smart-Hotel-Booking-System
```

#### Step 2: Open in Visual Studio

1. Launch Visual Studio 2022
2. Click "Open a project or solution"
3. Navigate to the cloned folder
4. Select `finaldestination.sln`

#### Step 3: Restore NuGet Packages

Visual Studio automatically restores packages. If not:
- Right-click solution in Solution Explorer
- Select "Restore NuGet Packages"

#### Step 4: Build the Solution

- Press `Ctrl+Shift+B`
- Or: Build → Build Solution
- Ensure no build errors

#### Step 5: Run the Application

- Press `F5` (with debugging)
- Or: `Ctrl+F5` (without debugging)
- Browser opens automatically to Swagger UI

### Method 2: Visual Studio Code

#### Step 1: Clone and Open

```bash
git clone <repository-url>
cd Smart-Hotel-Booking-System
code .
```

#### Step 2: Install Extensions

When prompted, install recommended extensions:
- C# for Visual Studio Code
- .NET Extension Pack

#### Step 3: Restore Dependencies

```bash
cd finaldestination
dotnet restore
```

#### Step 4: Build the Project

```bash
dotnet build
```

#### Step 5: Run the Application

```bash
dotnet run
```

Or press `F5` to run with debugger.

### Method 3: Command Line

#### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Smart-Hotel-Booking-System/finaldestination
```

#### Step 2: Restore and Build

```bash
dotnet restore
dotnet build
```

#### Step 3: Run Application

```bash
# Development mode
dotnet run

# Watch mode (auto-restart on changes)
dotnet watch run

# Production mode
dotnet run --environment Production
```

## Database Setup

### Option 1: SQL Server LocalDB (Recommended)

#### Automatic Setup

The application automatically:
1. Creates the database on first run
2. Applies migrations
3. Seeds sample data

**No manual steps required!**

#### Manual Verification

```bash
# Check LocalDB status
sqllocaldb info

# Start LocalDB if not running
sqllocaldb start mssqllocaldb

# Connect with SSMS
Server name: (localdb)\mssqllocaldb
Database: FinalDestinationDB
Authentication: Windows Authentication
```

#### Connection String

Default connection string in `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinalDestinationDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### Option 2: In-Memory Database (For Testing)

Perfect for quick testing without SQL Server.

#### Enable In-Memory Database

Edit `appsettings.Development.json`:
```json
{
  "UseLocalDb": false
}
```

#### Benefits

- No SQL Server installation required
- Faster startup
- Automatic cleanup on restart

#### Limitations

- Data lost on application restart
- Not suitable for production
- Limited query capabilities

### Option 3: Full SQL Server Instance

For production-like environment.

#### Step 1: Install SQL Server

- Download SQL Server Developer Edition (free)
- Or use SQL Server Express

#### Step 2: Update Connection String

Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FinalDestinationDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

Or for SQL Authentication:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FinalDestinationDB;User Id=sa;Password=YourPassword;MultipleActiveResultSets=true;TrustServerCertificate=true"
  }
}
```

#### Step 3: Create Database

```bash
dotnet ef database update
```

## Configuration

### Application Settings

#### Development Configuration

File: `finaldestination/appsettings.Development.json`

```json
{
  "UseLocalDb": true,
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinalDestinationDB_Dev;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "DevelopmentSuperSecretKeyThatIsAtLeast32CharactersLongForJWTTokenGeneration!",
    "Issuer": "FinalDestination",
    "Audience": "FinalDestinationUsers",
    "ExpiryInHours": 24
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "Payment": {
    "MockSuccessRate": 1.0,
    "ProcessingDelayMs": 500
  }
}
```

#### Production Configuration

File: `finaldestination/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinalDestinationDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLongForJWTTokenGeneration!",
    "Issuer": "FinalDestination",
    "Audience": "FinalDestinationUsers",
    "ExpiryInHours": 24
  },
  "Cache": {
    "DefaultExpirationMinutes": 30,
    "HotelCacheExpirationMinutes": 10
  },
  "Payment": {
    "MockSuccessRate": 0.9,
    "ProcessingDelayMs": 1000
  },
  "Loyalty": {
    "PointsPercentage": 0.1,
    "MinimumBookingAmount": 50.0
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Environment Variables

Set environment-specific variables:

**Windows (PowerShell)**:
```powershell
$env:ASPNETCORE_ENVIRONMENT="Development"
$env:ConnectionStrings__DefaultConnection="your-connection-string"
$env:Jwt__Key="your-jwt-key"
```

**Windows (Command Prompt)**:
```cmd
set ASPNETCORE_ENVIRONMENT=Development
set ConnectionStrings__DefaultConnection=your-connection-string
set Jwt__Key=your-jwt-key
```

**Linux/macOS**:
```bash
export ASPNETCORE_ENVIRONMENT=Development
export ConnectionStrings__DefaultConnection="your-connection-string"
export Jwt__Key="your-jwt-key"
```

### Port Configuration

Default ports are configured in `Properties/launchSettings.json`:

```json
{
  "profiles": {
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "https://localhost:5001;http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

To change ports, modify the `applicationUrl` value.

## Running the Application

### Development Mode

**Visual Studio**:
- Press `F5` (with debugger)
- Or `Ctrl+F5` (without debugger)

**Command Line**:
```bash
cd finaldestination
dotnet run
```

**Watch Mode** (auto-restart on file changes):
```bash
dotnet watch run
```

### Production Mode

```bash
dotnet run --environment Production
```

### Application URLs

After starting, the application is available at:

- **HTTPS**: https://localhost:5001 (Frontend)
- **HTTP**: http://localhost:5000
- **Swagger UI**: https://localhost:5001/swagger

### Console Output

Successful startup shows:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
```

## Verification

### Step 1: Check Application

1. Open browser to https://localhost:5001 (Frontend)
2. Or visit https://localhost:5001/swagger (Swagger UI)
3. Verify application loads correctly

### Step 2: Test Authentication

1. In Swagger UI, expand "Auth" section
2. Click "POST /api/auth/login"
3. Click "Try it out"
4. Use credentials:
   ```json
   {
     "email": "admin@hotel.com",
     "password": "Admin123!"
   }
   ```
5. Click "Execute"
6. Should receive 200 OK with token

### Step 3: Authorize Requests

1. Copy the token from login response
2. Click "Authorize" button at top of Swagger UI
3. Enter: `Bearer <your-token>`
4. Click "Authorize"

### Step 4: Test Protected Endpoint

1. Expand "GET /api/bookings/my"
2. Click "Try it out"
3. Click "Execute"
4. Should receive 200 OK with bookings

### Step 5: Verify Database

**Using SSMS**:
1. Connect to `(localdb)\mssqllocaldb`
2. Expand Databases → FinalDestinationDB
3. Verify tables exist:
   - Users
   - Hotels
   - Bookings
   - Reviews
   - Payments
   - LoyaltyAccounts
   - PointsTransactions
   - HotelManagerApplications

**Using SQL Query**:
```sql
-- Check sample data
SELECT COUNT(*) FROM Users;      -- Should be 8
SELECT COUNT(*) FROM Hotels;     -- Should be 6
SELECT COUNT(*) FROM Bookings;   -- Should be 8
SELECT COUNT(*) FROM Reviews;    -- Should be 10
```

### Step 6: Test API with cURL

```bash
# Get all hotels
curl https://localhost:5001/api/hotels

# Login
curl -X POST "https://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hotel.com", "password": "Admin123!"}'

# Get my bookings (replace <token> with actual token)
curl -X GET "https://localhost:5001/api/bookings/my" \
  -H "Authorization: Bearer <token>"
```

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error**: "Failed to bind to address https://localhost:5001"

**Solution**:
```bash
# Windows - Find process using port
netstat -ano | findstr :5001

# Kill process
taskkill /PID <process-id> /F

# Or change port in launchSettings.json
```

#### SSL Certificate Issues

**Error**: "Unable to configure HTTPS endpoint"

**Solution**:
```bash
# Trust development certificate
dotnet dev-certs https --trust

# Or regenerate certificate
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

#### Database Connection Errors

**Error**: "Cannot open database"

**Solution**:
```bash
# Check LocalDB status
sqllocaldb info

# Start LocalDB
sqllocaldb start mssqllocaldb

# Or use in-memory database
# Set UseLocalDb: false in appsettings.Development.json
```

#### NuGet Package Errors

**Error**: "Package restore failed"

**Solution**:
```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore packages
dotnet restore

# Rebuild
dotnet build
```

#### Build Errors

**Error**: "Build failed"

**Solution**:
```bash
# Clean solution
dotnet clean

# Restore packages
dotnet restore

# Rebuild
dotnet build
```

### Getting Help

If issues persist:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review application logs in console
3. Verify all prerequisites are installed
4. Ensure correct .NET version (8.0+)
5. Check firewall settings for port access

### Verification Checklist

- [ ] .NET 8 SDK installed
- [ ] SQL Server LocalDB installed and running
- [ ] Project builds without errors
- [ ] Application starts successfully
- [ ] Swagger UI accessible
- [ ] Database created and seeded
- [ ] Sample login works
- [ ] Protected endpoints accessible with token

## Next Steps

After successful setup:

1. **Explore the API** using Swagger UI
2. **Review the code** to understand implementation
3. **Test endpoints** with different user roles
4. **Read the documentation**:
   - [API Reference](API_REFERENCE.md)
   - [Architecture](ARCHITECTURE.md)
   - [Project Overview](PROJECT_OVERVIEW.md)
5. **Try the exercises** in module documentation

## Additional Resources

- [Official .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [SQL Server LocalDB Documentation](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb)

---

**Setup Complete!** You're ready to start developing with the Smart Hotel Booking System.

**Last Updated**: October 2025
