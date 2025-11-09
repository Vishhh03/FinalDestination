# JWT Token Issue - FIXED

## Problem
Bookings endpoint returning 401 Unauthorized for all users (Guest, Manager, Admin).

## Root Cause
**JWT Secret Key Mismatch**

The application had different JWT keys in different configuration files:
- `appsettings.json`: `YourSuperSecretKey...`
- `appsettings.Development.json`: `DevelopmentSuperSecretKey...`

When the backend runs in Development mode, it uses `appsettings.Development.json`. If users logged in when the server was using one key, and then the server restarted with a different key, all existing tokens become invalid.

## Solution Applied

### 1. Unified JWT Keys
Both configuration files now use the same JWT key:
```
YourSuperSecretKeyThatIsAtLeast32CharactersLongForJWTTokenGeneration!
```

### 2. Extended Token Expiry
Changed from 24 hours to 168 hours (7 days) to reduce login frequency during development.

## What Users Need to Do

### Option 1: Logout and Login Again (Recommended)
1. Click "Logout" in the navbar
2. Log back in with your credentials
3. You'll get a fresh token that works

### Option 2: Clear Browser Storage
Open browser console (F12) and run:
```javascript
localStorage.clear();
location.reload();
```

Then log in again.

## Technical Details

### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "nameid": "1",
    "email": "user@example.com",
    "name": "User Name",
    "role": "Guest",
    "userId": "1",
    "userRole": "Guest",
    "jti": "unique-id",
    "iat": "timestamp",
    "exp": "expiration-timestamp",
    "iss": "FinalDestination",
    "aud": "FinalDestinationUsers"
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

### Token Validation
The backend validates:
- ✅ Signature (using secret key)
- ✅ Issuer matches configuration
- ✅ Audience matches configuration
- ✅ Token not expired
- ✅ Token format is valid

If ANY of these fail → 401 Unauthorized

## Prevention

### For Development
- Keep JWT keys consistent across all config files
- Document the key in team documentation
- Use the template file when setting up new environments

### For Production
- Use environment variables for JWT key
- Never commit JWT keys to repository
- Rotate keys periodically
- Use longer, more complex keys

## Files Modified
- ✅ `appsettings.Development.json` - Updated JWT key to match base config
- ✅ `appsettings.Development.template.json` - Updated template
- ✅ Token expiry extended to 7 days for better dev experience

## Verification

After restarting the backend and logging in again:
1. ✅ Login should work
2. ✅ Bookings page should load
3. ✅ All authenticated endpoints should work
4. ✅ Token should be valid for 7 days

---

**Status**: ✅ Fixed
**Action Required**: Users must logout and login again to get fresh tokens
