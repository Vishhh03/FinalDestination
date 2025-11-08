# Authorization Verification - Frontend vs Backend

## ✅ Authorization is Correctly Configured

### Backend Setup

#### UserRole Enum (C#)
```csharp
public enum UserRole
{
    Guest = 1,
    HotelManager = 2,
    Admin = 3
}
```

#### JWT Token Generation
The backend serializes the enum as a **string** in JWT tokens:
```csharp
new Claim(ClaimTypes.Role, user.Role.ToString()),  // "Guest", "HotelManager", or "Admin"
new Claim("userRole", user.Role.ToString())
```

**Result:** JWT tokens contain role as string values: `"Guest"`, `"HotelManager"`, `"Admin"`

### Frontend Setup

#### User Model (TypeScript)
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;  // ✅ Correctly typed as string
  contactNumber?: string;
  createdAt: string;
  isActive: boolean;
  loyaltyAccount?: LoyaltyInfo;
}
```

#### Role Checking Methods
```typescript
// auth.service.ts
hasRole(role: string): boolean {
  return this.currentUser()?.role === role;
}

hasAnyRole(roles: string[]): boolean {
  const user = this.currentUser();
  return user ? roles.includes(user.role) : false;
}
```

### Usage Examples

#### ✅ Correct Usage in Frontend

**1. Route Guards**
```typescript
// app.routes.ts
{
  path: 'manager-dashboard',
  canActivate: [roleGuard(['HotelManager', 'Admin'])]
}
```

**2. Component Authorization**
```typescript
// manager-dashboard.component.ts
if (!this.auth.hasAnyRole(['HotelManager', 'Admin'])) {
  this.router.navigate(['/']);
  return;
}
```

**3. Template Conditional Rendering**
```html
<!-- navbar.component.html -->
@if (authService.hasAnyRole(['HotelManager', 'Admin'])) {
  <li><a routerLink="/manager-dashboard">My Dashboard</a></li>
}
```

### Role Values Mapping

| Backend Enum | Enum Value | JWT Token String | Frontend Check |
|--------------|------------|------------------|----------------|
| `UserRole.Guest` | 1 | `"Guest"` | `hasRole('Guest')` |
| `UserRole.HotelManager` | 2 | `"HotelManager"` | `hasRole('HotelManager')` |
| `UserRole.Admin` | 3 | `"Admin"` | `hasRole('Admin')` |

### Authorization Flow

1. **User Logs In**
   - Backend validates credentials
   - Backend generates JWT with `role: "Guest"` (or HotelManager/Admin)
   - Frontend stores token and user object

2. **Frontend Checks Authorization**
   - Reads `user.role` from stored user object
   - Compares string value: `user.role === 'HotelManager'`
   - Grants/denies access based on match

3. **Backend Validates Requests**
   - Reads JWT token from Authorization header
   - Extracts role claim from token
   - Validates against `[Authorize(Roles = "HotelManager")]` attributes

### ✅ Verification Checklist

- [x] Backend enum serializes to string in JWT
- [x] Frontend User model has `role: string`
- [x] Frontend checks use string comparison
- [x] Role values match exactly (case-sensitive)
- [x] Route guards use correct role names
- [x] Component authorization checks use correct role names
- [x] Template conditionals use correct role names

### Role Names (Case-Sensitive)

**✅ Correct:**
- `"Guest"`
- `"HotelManager"`
- `"Admin"`

**❌ Incorrect:**
- `"guest"` (lowercase)
- `"hotelmanager"` (lowercase)
- `"Hotel Manager"` (with space)
- `"ADMIN"` (uppercase)

### Security Notes

1. **Token-Based Authorization**
   - Role is embedded in JWT token
   - Token is validated on every backend request
   - Frontend checks are for UX only (hiding/showing UI)
   - Backend always enforces actual authorization

2. **Default Role**
   - New users are always created as `Guest`
   - Cannot register directly as `HotelManager` or `Admin`
   - Role upgrades require admin approval

3. **Role Hierarchy**
   - `Guest` (1) - Basic user, can book hotels
   - `HotelManager` (2) - Can manage their own hotels
   - `Admin` (3) - Full system access

## Conclusion

✅ **Authorization is correctly configured and matches between frontend and backend**

The backend serializes the UserRole enum as strings in JWT tokens, and the frontend correctly handles these as string values. All role checks use the proper string values that match the enum names.

**No changes needed - everything is working as designed!** 🎉
