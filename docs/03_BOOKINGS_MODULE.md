# Bookings Module

## Overview
Hotel booking system with date validation, room availability tracking, and loyalty points integration.

## Backend Components

### BookingsController
**Location**: `Controllers/BookingsController.cs`

**Endpoints**:
```
GET  /api/bookings           - Get user's bookings
GET  /api/bookings/{id}      - Get booking details
POST /api/bookings           - Create new booking
PUT  /api/bookings/{id}/cancel - Cancel booking
```

### Booking Model
```csharp
- Id (int)
- UserId (int)
- HotelId (int)
- GuestName (string)
- GuestEmail (string)
- CheckInDate (DateTime)
- CheckOutDate (DateTime)
- NumberOfGuests (int)
- TotalAmount (decimal)
- LoyaltyPointsRedeemed (int, optional)
- LoyaltyDiscountAmount (decimal, optional)
- LoyaltyPointsEarned (int, optional)
- Status (BookingStatus enum)
- CreatedAt (DateTime)
- PaymentId (int, optional)
```

### BookingStatus Enum
```csharp
Confirmed = 1
Cancelled = 2
Completed = 3
```

## Frontend Components

### BookingService
**Location**: `ClientApp/src/app/services/booking.service.ts`

**Methods**:
- `getMyBookings()` - Get user's bookings
- `getById(id)` - Get booking details
- `create(booking)` - Create new booking
- `cancel(id)` - Cancel booking

## Booking Flow

### Create Booking
```
User selects dates/guests →
Calculate total amount →
Optional: Redeem loyalty points →
POST /api/bookings →
Validation (dates, rooms available) →
Calculate loyalty points earned →
Booking created with Confirmed status →
Loyalty points updated →
Return booking with payment required flag
```

### View Bookings
```
User visits bookings page →
GET /api/bookings →
Display all bookings with status →
Show payment button if payment required
```

### Cancel Booking
```
User clicks cancel →
Confirmation modal →
PUT /api/bookings/{id}/cancel →
Status changed to Cancelled →
Refund loyalty points if used →
Bookings list refreshed
```

## Booking Validation

### Date Validation
- Check-in date must be in the future
- Check-out date must be after check-in date
- Dates cannot be in the past

### Room Availability
- Hotel must have available rooms
- Rooms are not actually reserved (simplified system)

### User Validation
- User must be authenticated
- User can only view/cancel their own bookings

## Loyalty Points Integration

### Points Earned
```
Points = Floor(TotalAmount / 10)
Minimum = 100 points per booking
```

**Examples**:
- $250 booking = 250 points (minimum 100)
- $50 booking = 100 points (minimum enforced)
- $1,500 booking = 1,500 points

### Points Redemption
```
Discount = PointsRedeemed / 100
Maximum = 50% of total amount
Minimum = 100 points (increments of 100)
```

**Examples**:
- $200 booking, 5000 points available
- Maximum redeemable: 10,000 points (50% = $100)
- User redeems 5,000 points = $50 discount
- Final amount: $150

### Calculation Logic
```csharp
// Calculate points earned
var pointsEarned = (int)Math.Floor(totalAmount / 10);
pointsEarned = Math.Max(pointsEarned, 100); // Minimum 100

// Calculate discount from points
var discount = pointsRedeemed / 100m;
var maxDiscount = totalAmount * 0.5m; // 50% max
discount = Math.Min(discount, maxDiscount);

// Apply discount
var finalAmount = totalAmount - discount;
```

## Booking Statuses

### Confirmed
- Initial status when booking is created
- Payment may be required
- Can be cancelled

### Cancelled
- User cancelled the booking
- Loyalty points refunded if used
- Cannot be modified

### Completed
- Booking has been fulfilled
- Check-out date has passed
- Cannot be cancelled

## API Examples

### Create Booking
```http
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "hotelId": 1,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "checkInDate": "2025-12-01",
  "checkOutDate": "2025-12-05",
  "numberOfGuests": 2,
  "loyaltyPointsToRedeem": 500
}
```

**Response**:
```json
{
  "id": 1,
  "hotelId": 1,
  "hotelName": "Grand Hotel",
  "guestName": "John Doe",
  "checkInDate": "2025-12-01",
  "checkOutDate": "2025-12-05",
  "numberOfGuests": 2,
  "totalAmount": 600.00,
  "loyaltyPointsRedeemed": 500,
  "loyaltyDiscountAmount": 5.00,
  "loyaltyPointsEarned": 100,
  "status": 1,
  "paymentRequired": true
}
```

### Cancel Booking
```http
PUT /api/bookings/1/cancel
Authorization: Bearer {token}
```

## Integration Points
- **Hotels Module**: Hotel availability and pricing
- **Loyalty Module**: Points earning and redemption
- **Payments Module**: Payment processing
- **Authentication Module**: User identification
