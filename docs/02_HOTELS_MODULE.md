# Hotels Module

## Overview
Complete hotel management system with CRUD operations, search functionality, and review integration.

## Backend Components

### HotelsController
**Location**: `Controllers/HotelsController.cs`

**Public Endpoints**:
```
GET  /api/hotels           - Get all hotels
GET  /api/hotels/{id}      - Get hotel by ID
GET  /api/hotels/search    - Search hotels
```

**Manager Endpoints** (requires HotelManager role):
```
GET    /api/hotels/my-hotels  - Get manager's hotels
POST   /api/hotels            - Create new hotel
PUT    /api/hotels/{id}       - Update hotel
DELETE /api/hotels/{id}       - Delete hotel
```

**Admin Endpoints** (requires Admin role):
```
DELETE /api/hotels/{id}  - Delete any hotel
```

### Hotel Model
```csharp
- Id (int)
- Name (string, required)
- Address (string, required)
- City (string, required)
- PricePerNight (decimal)
- AvailableRooms (int)
- Rating (double, 0-5)
- ManagerId (int)
- ImageUrl (string, optional)
- Images (List<string>, optional)
- CreatedAt (DateTime)
```

### Review Model
```csharp
- Id (int)
- UserId (int)
- HotelId (int)
- Rating (int, 1-5)
- Comment (string)
- CreatedAt (DateTime)
```

## Frontend Components

### HotelService
**Location**: `ClientApp/src/app/services/hotel.service.ts`

**Methods**:
- `getAll()` - Fetch all hotels
- `getById(id)` - Get hotel details
- `search(city, maxPrice, minRating)` - Search hotels
- `getMyHotels()` - Get manager's hotels
- `create(hotel)` - Create new hotel
- `update(id, hotel)` - Update hotel
- `delete(id)` - Delete hotel

### ReviewService
**Location**: `ClientApp/src/app/services/review.service.ts`

**Methods**:
- `getByHotelId(hotelId)` - Get hotel reviews
- `create(review)` - Submit review
- `getAverageRating(hotelId)` - Calculate average rating

## Hotel Management Flows

### Browse Hotels
```
User visits home/hotels page →
GET /api/hotels →
Hotels displayed with images, ratings, prices →
User can search/filter →
Results updated
```

### View Hotel Details
```
User clicks hotel →
GET /api/hotels/{id} →
GET /api/reviews/hotel/{id} →
Display hotel info, reviews, booking form
```

### Create Hotel (Manager)
```
Manager fills form →
POST /api/hotels →
Validation →
Hotel created with ManagerId →
Redirect to manager dashboard
```

### Update Hotel (Manager)
```
Manager edits hotel →
PUT /api/hotels/{id} →
Authorization check (owns hotel?) →
Hotel updated →
Dashboard refreshed
```

### Delete Hotel (Manager/Admin)
```
Manager clicks delete →
Confirmation modal →
DELETE /api/hotels/{id} →
Authorization check →
Hotel deleted →
Dashboard refreshed
```

## Search Functionality

**Parameters**:
- `city` - Filter by city name (case-insensitive)
- `maxPrice` - Maximum price per night
- `minRating` - Minimum rating (1-5)

**Query Logic**:
```sql
WHERE (city IS NULL OR City LIKE '%{city}%')
  AND (maxPrice IS NULL OR PricePerNight <= maxPrice)
  AND (minRating IS NULL OR Rating >= minRating)
```

## Image Support

Hotels support multiple images:
- `ImageUrl` - Primary image URL
- `Images` - Array of additional image URLs

Images are displayed with:
- Hover zoom effect
- Fallback to gradient placeholder
- Responsive sizing

## Review System

### Submit Review
```
User must be authenticated →
POST /api/reviews →
{
  "hotelId": 1,
  "rating": 5,
  "comment": "Great stay!"
}
```

### Rating Calculation
Average rating is calculated from all reviews:
```csharp
Rating = Reviews.Average(r => r.Rating)
```

## Authorization Rules

| Action | Guest | Manager | Admin |
|--------|-------|---------|-------|
| View hotels | ✅ | ✅ | ✅ |
| Search hotels | ✅ | ✅ | ✅ |
| Create hotel | ❌ | ✅ | ✅ |
| Update own hotel | ❌ | ✅ | ✅ |
| Delete own hotel | ❌ | ✅ | ✅ |
| Delete any hotel | ❌ | ❌ | ✅ |

## API Examples

### Create Hotel
```http
POST /api/hotels
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Grand Hotel",
  "address": "123 Main St",
  "city": "New York",
  "pricePerNight": 150.00,
  "availableRooms": 50,
  "imageUrl": "https://images.unsplash.com/...",
  "images": [
    "https://images.unsplash.com/...",
    "https://images.unsplash.com/..."
  ]
}
```

### Search Hotels
```http
GET /api/hotels/search?city=New York&maxPrice=200&minRating=4
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Grand Hotel",
    "city": "New York",
    "pricePerNight": 150.00,
    "rating": 4.5,
    "availableRooms": 50,
    "imageUrl": "https://..."
  }
]
```

## Integration Points
- **Bookings Module**: Hotel availability and pricing
- **Reviews Module**: Hotel ratings
- **Authentication Module**: Manager ownership


## Image Upload Feature

### Backend Implementation

#### UploadController
**Location**: `Controllers/UploadController.cs`

**Endpoints**:
```
POST   /api/upload/hotel-image  - Upload hotel image
DELETE /api/upload/hotel-image  - Delete hotel image
```

**Security**:
- Requires HotelManager or Admin role
- File type validation (JPG, PNG, WebP only)
- File size limit (5MB maximum)
- Unique filename generation (GUID)
- Path traversal prevention

**Storage**:
- Location: `wwwroot/uploads/hotels/`
- Served as static files
- Excluded from git (.gitignore)

### Frontend Implementation

**File Upload UI**:
- Drag-and-drop interface
- Image preview before upload
- File validation (client-side)
- Progress indication
- Remove uploaded image option

**Integration**:
- Manager Dashboard: Upload images when creating/editing hotels
- Admin Dashboard: Full image management capabilities
- Automatic URL generation and storage

### Usage Example

```typescript
// Upload image
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch('/api/upload/hotel-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
// result.imageUrl = "/uploads/hotels/guid.jpg"
```

## Room Availability Management

### Automatic Room Count Updates

**When Booking Created**:
```csharp
hotel.AvailableRooms--;  // Decrease by 1
```

**When Payment Fails**:
```csharp
hotel.AvailableRooms++;  // Restore room
```

**When Booking Cancelled**:
```csharp
hotel.AvailableRooms++;  // Restore room
```

**When Booking Deleted** (Admin only):
```csharp
if (booking.Status == BookingStatus.Confirmed)
{
    hotel.AvailableRooms++;  // Restore if was confirmed
}
```

This ensures accurate room availability tracking throughout the booking lifecycle.

## Hotel Distribution

Hotels are evenly distributed between managers:
- **Manager 2 (Jane Manager)**: 10 hotels (one per city)
- **Manager 3 (Mike Wilson)**: 10 hotels (one per city)

Cities covered:
- Mumbai, Delhi, Bangalore, Goa, Jaipur
- Hyderabad, Chennai, Kolkata, Pune

## Recent Bug Fixes

### 1. Hotel Edit 400 Error
**Issue**: Missing required fields in update request
**Fix**: Include imageUrl, images, and managerId in update payload

### 2. Hotel Delete 500 Error
**Issue**: Foreign key constraints with reviews and bookings
**Fix**: Cascade delete reviews and non-active bookings before hotel deletion

### 3. Uneven Hotel Distribution
**Issue**: Hotels not evenly split between managers
**Fix**: Updated DataSeeder to distribute hotels evenly (10 each)
