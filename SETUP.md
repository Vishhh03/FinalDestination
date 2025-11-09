# Setup Instructions

## Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or full instance)
- Git

## Initial Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd FinalDestination
```

### 2. Backend Setup

#### Create Development Configuration
```bash
cd finaldestination
cp appsettings.Development.template.json appsettings.Development.json
```

#### Update Configuration
Edit `appsettings.Development.json`:
- Change the JWT `Key` to your own secret (minimum 32 characters)
- Update `ConnectionStrings.DefaultConnection` if needed

#### Restore Packages
```bash
dotnet restore
```

#### Create Database
```bash
dotnet ef database update
```

#### Run Backend
```bash
dotnet run
```

Backend will run on: `https://localhost:7001` and `http://localhost:5001`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ClientApp
npm install
```

#### Run Frontend
```bash
npm start
```

Frontend will run on: `http://localhost:4200`

## Default Users

After database seeding, you can login with:

### Admin Account
- Email: `admin@hotel.com`
- Password: `Admin123!`
- Role: Admin

### Hotel Manager Account
- Email: `manager@hotel.com`
- Password: `Manager123!`
- Role: HotelManager

### Guest Account
- Email: `guest@hotel.com`
- Password: `Guest123!`
- Role: Guest

## Environment Variables

### Development
All configuration is in `appsettings.Development.json` (not tracked in git)

### Production
Set these environment variables:
- `ConnectionStrings__DefaultConnection` - Database connection string
- `Jwt__Key` - JWT secret key (minimum 32 characters)
- `Jwt__Issuer` - JWT issuer
- `Jwt__Audience` - JWT audience

## Troubleshooting

### Database Issues
```bash
# Drop and recreate database
dotnet ef database drop
dotnet ef database update
```

### Node Modules Issues
```bash
# Remove and reinstall
cd ClientApp
rm -rf node_modules package-lock.json
npm install
```

### Port Conflicts
Update ports in:
- Backend: `finaldestination/Properties/launchSettings.json`
- Frontend: `finaldestination/ClientApp/angular.json`

## Documentation

- [Module Documentation](docs/README.md) - Detailed module documentation
- [README.md](README.md) - Project overview
