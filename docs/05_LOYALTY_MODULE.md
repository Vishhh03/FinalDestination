# Loyalty Module

## Overview
Points-based loyalty program with automatic earning, redemption, and transaction tracking.

## Backend Components

### LoyaltyController
**Location**: `Controllers/LoyaltyController.cs`

**Endpoints**:
```
GET  /api/loyalty/account      - Get user's loyalty account
GET  /api/loyalty/transactions - Get points history
POST /api/loyalty/redeem       - Redeem points (manual)
```

### LoyaltyAccount Model
```csharp
- Id (int)
- UserId (int)
- PointsBalance (int)
- TotalPointsEarned (int)
- LastUpdated (DateTime)
```

### PointsTransaction Model
```csharp
- Id (int)
- UserId (int)
- BookingId (int, optional)
- PointsEarned (int)
- PointsRedeemed (int)
- Description (string)
- TransactionDate (DateTime)
```

## Loyalty Rules

### Earning Points

**Formula**:
```
Points = Floor(BookingAmount / 10)
Minimum = 100 points
```

**Examples**:
| Booking Amount | Points Earned |
|----------------|---------------|
| $50 | 100 (minimum) |
| $250 | 250 |
| $1,500 | 1,500 |
| $99 | 100 (minimum) |

**Implementation**:
```csharp
var points = (int)Math.Floor(bookingAmount / 10);
points = Math.Max(points, 100); // Enforce minimum
```

### Redeeming Points

**Rules**:
- 100 points = $1 discount
- Minimum redemption: 100 points
- Maximum redemption: 50% of booking total
- Must redeem in increments of 100

**Examples**:
| Booking | Points Available | Max Redeemable | Max Discount |
|---------|------------------|----------------|--------------|
| $200 | 5,000 | 10,000 | $100 (50%) |
| $100 | 15,000 | 5,000 | $50 (50%) |
| $500 | 30,000 | 25,000 | $250 (50%) |

**Implementation**:
```csharp
var discount = pointsRedeemed / 100m;
var maxDiscount = bookingAmount * 0.5m;
discount = Math.Min(discount, maxDiscount);
```

## Loyalty Flow

### Account Creation
```
User registers →
Role = Guest →
Loyalty account auto-created →
Initial balance: 0 points
```

### Earn Points (Booking)
```
Booking created →
Calculate points: Floor(Amount / 10) →
Minimum 100 points enforced →
Update loyalty account →
Create transaction record →
Points added to balance
```

### Redeem Points (Booking)
```
User enters points to redeem →
Validate (balance, max 50%, increments of 100) →
Calculate discount →
Apply to booking total →
Deduct points from balance →
Create transaction record →
Booking created with discount
```

### View Points
```
User visits profile →
GET /api/loyalty/account →
Display points balance, total earned →
GET /api/loyalty/transactions →
Show transaction history
```

### Cancel Booking (Refund)
```
Booking cancelled →
Check if points were redeemed →
Refund redeemed points →
Update loyalty account →
Create refund transaction
```

## Transaction Types

### Earned
Points earned from bookings:
```json
{
  "pointsEarned": 250,
  "pointsRedeemed": 0,
  "description": "Points earned from booking"
}
```

### Redeemed
Points used for discounts:
```json
{
  "pointsEarned": 0,
  "pointsRedeemed": 500,
  "description": "Points redeemed for $5 discount"
}
```

### Refunded
Points returned from cancelled bookings:
```json
{
  "pointsEarned": 500,
  "pointsRedeemed": 0,
  "description": "Points refunded from cancelled booking"
}
```

## API Examples

### Get Loyalty Account
```http
GET /api/loyalty/account
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "pointsBalance": 1250,
  "totalPointsEarned": 2500,
  "lastUpdated": "2025-11-09T12:00:00Z"
}
```

### Get Transaction History
```http
GET /api/loyalty/transactions
Authorization: Bearer {token}
```

**Response**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "bookingId": 1,
    "pointsEarned": 250,
    "pointsRedeemed": 0,
    "description": "Points earned from booking",
    "transactionDate": "2025-11-09T12:00:00Z"
  },
  {
    "id": 2,
    "userId": 1,
    "bookingId": 2,
    "pointsEarned": 0,
    "pointsRedeemed": 500,
    "description": "Points redeemed for $5 discount",
    "transactionDate": "2025-11-08T10:00:00Z"
  }
]
```

## Validation Rules

### Points Redemption
```csharp
// Check sufficient balance
if (pointsBalance < pointsToRedeem)
    throw new Exception("Insufficient points");

// Check minimum redemption
if (pointsToRedeem < 100)
    throw new Exception("Minimum 100 points");

// Check increment of 100
if (pointsToRedeem % 100 != 0)
    throw new Exception("Must redeem in increments of 100");

// Check maximum (50% of booking)
var maxPoints = (int)(bookingAmount * 0.5m * 100);
if (pointsToRedeem > maxPoints)
    throw new Exception($"Maximum {maxPoints} points");
```

## Frontend Display

### Profile Page
Shows:
- Current points balance
- Total points earned
- Points circle visualization
- Recent transaction history

### Booking Modal
Shows:
- Available points
- Points to redeem input
- Maximum redeemable points
- Discount calculation
- Final amount after discount

## Integration Points
- **Bookings Module**: Points earning and redemption
- **Payments Module**: Points awarded after successful payment
- **Authentication Module**: User identification (Guest role only)
