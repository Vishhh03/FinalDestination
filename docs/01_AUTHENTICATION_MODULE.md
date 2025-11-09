# Authentication Module

## Overview
JWT-based authentication system with role-based authorization for secure user management.

## User Roles
- **Guest** (1) - Regular users who can book hotels
- **HotelManager** (2) - Users who manage hotels
- **Admin** (3) - System administrators

## Backend Components

### AuthController
**Location**: `Controllers/AuthController.cs`

**Endpoints**:
```
POST /api/auth/register - Register new user
POST /api/auth/login    - Login and get JWT token
GET  /api/auth/me       - Get current user info (requires auth)
```

### User Model
```csharp
- Id (int)
- Name (string)
- Email (string, unique)
- PasswordHash (string) - BCrypt hashed
- Role (UserRole enum)
- ContactNumber (string, optional)
- IsActive (bool)
- CreatedAt (DateTime)
```

## Frontend Components

### AuthService
**Location**: `ClientApp/src/app/services/auth.service.ts`

**Key Methods**:
- `login(email, password)` - Authenticate user
- `register(data)` - Create new account
- `logout()` - Clear session
- `isAuthenticated()` - Check if logged in
- `hasRole(role)` - Check specific role
- `hasAnyRole(roles[])` - Check multiple roles

**Storage**:
- JWT token in localStorage
- User object in localStorage
- Token expiration timestamp

### AuthGuard
**Location**: `ClientApp/src/app/guards/auth.guard.ts`

Protects routes based on authentication and roles.

## Authentication Flow

### Registration
```
User fills form → POST /api/auth/register →
Password hashed with BCrypt →
User created in database →
Loyalty account auto-created (for Guests) →
JWT token generated →
Token + User returned →
Stored in localStorage →
Redirect to home
```

### Login
```
User enters credentials → POST /api/auth/login →
Password verified with BCrypt →
JWT token generated (7-day expiration) →
Token + User returned →
Stored in localStorage →
Redirect to home
```

### Authorization
```
Request made → AuthGuard checks token →
Token valid? → Check role requirements →
Role matches? → Allow access : Redirect to login
```

## Security Features
- ✅ BCrypt password hashing (work factor: 12)
- ✅ JWT tokens with 7-day expiration
- ✅ Role-based access control
- ✅ Token validation on every request
- ✅ Automatic token refresh

## Role Normalization
The system includes a workaround to handle role type mismatches:
- Backend should send roles as strings
- Frontend normalizes numeric roles to strings
- Mapping: 1=Guest, 2=HotelManager, 3=Admin

## Configuration
JWT settings in `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "YourSecretKey...",
    "Issuer": "FinalDestination",
    "Audience": "FinalDestinationUsers",
    "ExpiryInHours": 168
  }
}
```

## API Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": 1,
  "contactNumber": "+1234567890"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Guest"
  },
  "expiresAt": "2025-11-16T12:00:00Z"
}
```

## Integration Points
- **Hotels Module**: Role-based hotel management
- **Bookings Module**: User identification
- **Reviews Module**: User authentication
- **Loyalty Module**: User identification
- **Payments Module**: User authentication
