# Debugging Guide - Hotel Manager Dashboard Issue

## Changes Made

### 1. Added Comprehensive Logging

#### Frontend (auth.service.ts)
- ✅ Login process logging
- ✅ User data refresh logging
- ✅ Role checking logging (hasRole, hasAnyRole)
- ✅ LocalStorage operations logging

#### Frontend (navbar.component.ts)
- ✅ Component initialization logging
- ✅ Visual debug panel showing role info

#### Backend (AuthController.cs)
- ✅ Login response logging
- ✅ User refresh logging
- ✅ Role type and value logging

### 2. Created Test Page
- 📄 `/test-role-serialization.html` - Direct API testing

## How to Debug

### Step 1: Restart Backend
```bash
# Stop the backend if running
# Start it again to apply Program.cs changes
```

### Step 2: Open Test Page
Navigate to: `http://localhost:5000/test-role-serialization.html` (or your backend port)

Click "Login as Manager" and check:
- ✅ If role shows as **"HotelManager"** (string) → Backend is working correctly
- ❌ If role shows as **2** (number) → Backend enum serialization not working

### Step 3: Test in Angular App
1. Open the Angular app
2. Open browser DevTools (F12) → Console tab
3. Login with: `manager@hotel.com` / `manager123`

**Look for these console logs:**

```
🔐 [AUTH] Attempting login for: manager@hotel.com
📥 [AUTH] Login response received: {...}
🎭 [AUTH] User role from server: ??? Type: ???
💾 [AUTH] Saving auth to localStorage: {...}
✅ [AUTH] Auth saved, current user role: ???
🔄 [AUTH] Refreshing user data from server...
📥 [AUTH] Refreshed user data: {...}
🎭 [AUTH] Refreshed user role: ??? Type: ???
🧭 [NAVBAR] Component initialized
🧭 [NAVBAR] Current user: {...}
🔍 [AUTH] hasAnyRole([HotelManager, Admin]): {...}
```

### Step 4: Check Visual Debug Panel
After login, you should see a red debug box in the top-right corner showing:
- User name
- **Role value** (should be "HotelManager")
- **Role type** (should be "string")
- hasRole('HotelManager') result
- hasAnyRole(['HotelManager', 'Admin']) result

### Step 5: Check Backend Logs
Look at your backend console for:
```
User logged in successfully: manager@hotel.com
🎭 User role: ??? (Type: ???)
📤 Sending auth response with user: {...}
```

## Expected Results

### ✅ If Working Correctly:
- Role value: `"HotelManager"` (string)
- Role type: `string`
- hasRole('HotelManager'): `true`
- hasAnyRole(['HotelManager', 'Admin']): `true`
- "My Dashboard" link appears in navbar

### ❌ If Still Broken:
- Role value: `2` (number)
- Role type: `number`
- hasRole('HotelManager'): `false`
- hasAnyRole(['HotelManager', 'Admin']): `false`
- "My Dashboard" link does NOT appear

## Possible Issues

### Issue 1: Program.cs Changes Not Applied
**Solution:** Make sure you restarted the backend after modifying Program.cs

### Issue 2: Multiple Serialization Configurations
**Solution:** Check if there are other JSON serialization settings that might override our changes

### Issue 3: Caching
**Solution:** 
- Clear browser cache
- Clear localStorage: `localStorage.clear()` in browser console
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue 4: Wrong API Version
**Solution:** Make sure you're hitting the correct backend URL

## Next Steps Based on Results

### If role is still a number:
1. Check Program.cs was saved correctly
2. Verify backend restarted
3. Check for other JSON configuration in Startup/Program
4. Look for [JsonConverter] attributes on UserRole enum

### If role is a string but dashboard still not showing:
1. Check route guard configuration
2. Check if navbar is using the correct auth service
3. Check for Angular change detection issues
4. Verify the route path matches exactly

## Clean Up After Fixing

Once the issue is resolved, remove:
1. Debug panel from navbar.component.html
2. Console.log statements (or reduce to errors only)
3. test-role-serialization.html page

---

**Run through these steps and share the console output to identify the exact issue!**
