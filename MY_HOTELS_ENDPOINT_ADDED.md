# My Hotels Endpoint Added

## Problem
The frontend was calling `GET /api/hotels/my-hotels` but this endpoint didn't exist in the backend.

## Solution
Added the missing endpoint to `HotelsController.cs`:

### Endpoint Details
- **URL:** `GET /api/hotels/my-hotels`
- **Authorization:** Requires `HotelManager` or `Admin` role
- **Returns:** List of hotels where the current user is the manager

### How It Works
1. Extracts user ID from JWT token claims
2. Queries hotels where `ManagerId` matches the current user's ID
3. Returns the filtered list of hotels

### Code Added
```csharp
[HttpGet("my-hotels")]
[Authorize(Roles = "HotelManager,Admin")]
public async Task<ActionResult<IEnumerable<Hotel>>> GetMyHotels()
{
    // Get user ID from JWT token
    var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
    {
        return Unauthorized("Invalid token");
    }

    // Get hotels managed by this user
    var hotels = await _context.Hotels
        .Include(h => h.Manager)
        .Where(h => h.ManagerId == userId)
        .ToListAsync();

    return Ok(hotels);
}
```

## Frontend Usage
The hotel service already has the method:
```typescript
async getMyHotels(): Promise<Hotel[]> {
    return await this.http.get<Hotel[]>(`${this.apiUrl}/my-hotels`).toPromise() || [];
}
```

## Manager Dashboard
The manager dashboard component calls this to load hotels:
```typescript
async loadHotels() {
    this.hotels.set(await this.hotelService.getMyHotels());
}
```

## Testing

### 1. Restart Backend
The new endpoint requires a backend restart to be available.

### 2. Login as Hotel Manager
- Email: `manager@hotel.com`
- Password: `manager123`

### 3. Go to Manager Dashboard
- Click "My Dashboard" in navbar
- Should see hotels managed by this user

### 4. Expected Behavior
- ✅ Shows only hotels where `ManagerId` matches the logged-in user
- ✅ Can create new hotels (automatically assigned to current user)
- ✅ Can edit/delete their own hotels
- ✅ Cannot see hotels managed by other managers

## API Response Example
```json
[
  {
    "id": 1,
    "name": "Grand Plaza Hotel",
    "address": "123 Main Street",
    "city": "New York",
    "pricePerNight": 250.00,
    "availableRooms": 50,
    "rating": 4.5,
    "managerId": 2,
    "createdAt": "2024-11-08T10:00:00Z",
    "manager": {
      "id": 2,
      "name": "Hotel Manager",
      "email": "manager@hotel.com",
      "role": "HotelManager"
    }
  }
]
```

## Security
- ✅ Requires authentication (JWT token)
- ✅ Requires HotelManager or Admin role
- ✅ Only returns hotels managed by the current user
- ✅ Prevents managers from seeing other managers' hotels

---

**Restart the backend and the manager dashboard should now load hotels correctly!**
