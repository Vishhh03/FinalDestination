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


## Points Calculation

### Earning Points
**Formula**: 10% of booking amount
```csharp
int pointsEarned = (int)(bookingAmount * 0.10m);
```

**Example**:
- Booking amount: ₹10,000
- Points earned: 1,000 points

### Redeeming Points
**Conversion Rate**: 1 point = ₹1 discount
```csharp
decimal discountAmount = pointsRedeemed * 1.0m;
```

**Example**:
- Points redeemed: 500
- Discount applied: ₹500

## Points Lifecycle

```
1. User completes booking with payment
   ↓
2. Payment status: Completed
   ↓
3. Award points (10% of amount)
   ↓
4. Create points transaction record
   ↓
5. Update loyalty account balance
   ↓
6. Points available for future bookings
```

## Loyalty Account Management

### Account Creation
- Automatically created on first booking
- Initial balance: 0 points
- Tracks total points earned

### Account Structure
```csharp
public class LoyaltyAccount
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int PointsBalance { get; set; }
    public int TotalPointsEarned { get; set; }
    public DateTime LastUpdated { get; set; }
}
```

### Points Transaction
```csharp
public class PointsTransaction
{
    public int Id { get; set; }
    public int LoyaltyAccountId { get; set; }
    public int? BookingId { get; set; }
    public int PointsEarned { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

## Points Redemption Flow

```
1. User selects points to redeem during booking
   ↓
2. Validate points availability
   ↓
3. Calculate discount amount
   ↓
4. Deduct points from balance
   ↓
5. Apply discount to booking total
   ↓
6. Create redemption transaction (negative points)
   ↓
7. Process payment with discounted amount
```

## Validation Rules

### Earning Points
- Only for completed payments
- Only for confirmed bookings
- Calculated after payment success
- Rounded to nearest integer

### Redeeming Points
```csharp
// Check sufficient balance
if (account.PointsBalance < pointsToRedeem)
{
    throw new InvalidOperationException("Insufficient points balance");
}

// Minimum redemption
if (pointsToRedeem < 10)
{
    throw new InvalidOperationException("Minimum 10 points required");
}

// Maximum redemption (50% of booking)
if (discountAmount > bookingAmount * 0.5m)
{
    throw new InvalidOperationException("Cannot redeem more than 50% of booking");
}
```

## Integration with Bookings

### Booking with Points
```typescript
const bookingData = {
  hotelId: 1,
  checkInDate: '2025-11-15',
  checkOutDate: '2025-11-17',
  numberOfGuests: 2,
  pointsToRedeem: 500  // Optional
};
```

### Booking Response
```json
{
  "id": 123,
  "totalAmount": 9500,
  "loyaltyPointsRedeemed": 500,
  "loyaltyDiscountAmount": 500,
  "loyaltyPointsEarned": 950
}
```

## Points Display

### User Profile
- Current points balance
- Total points earned (lifetime)
- Recent transactions
- Points expiration (if implemented)

### Booking History
- Points earned per booking
- Points redeemed per booking
- Discount amount applied

## Business Rules

### Points Earning
- ✅ Earn on completed bookings only
- ✅ Earn after successful payment
- ✅ 10% of booking amount
- ✅ Rounded to nearest integer
- ❌ No points on cancelled bookings
- ❌ No points on refunded bookings

### Points Redemption
- ✅ Redeem during booking creation
- ✅ 1 point = ₹1 discount
- ✅ Maximum 50% of booking amount
- ✅ Minimum 10 points
- ❌ Cannot redeem after booking created
- ❌ Cannot redeem on cancelled bookings

## Loyalty Tiers (Future Enhancement)

### Proposed Tiers
```
Bronze (0-999 points)
- Standard earning rate (10%)
- Standard redemption (1:1)

Silver (1,000-4,999 points)
- Enhanced earning rate (12%)
- Better redemption (1:1.1)
- Priority support

Gold (5,000-9,999 points)
- Premium earning rate (15%)
- Premium redemption (1:1.2)
- Free room upgrades
- Late checkout

Platinum (10,000+ points)
- Elite earning rate (20%)
- Elite redemption (1:1.5)
- Complimentary services
- Exclusive offers
```

## Analytics & Reporting

### Metrics to Track
- Total points issued
- Total points redeemed
- Average points per user
- Redemption rate
- Most active users
- Points liability

### Reports
- Monthly points summary
- User loyalty rankings
- Points expiration forecast
- Redemption patterns

## Future Enhancements

- [ ] Points expiration (e.g., 1 year)
- [ ] Loyalty tiers (Bronze, Silver, Gold, Platinum)
- [ ] Bonus points promotions
- [ ] Points transfer between users
- [ ] Points for reviews
- [ ] Points for referrals
- [ ] Birthday bonus points
- [ ] Anniversary rewards
- [ ] Points history export
- [ ] Email notifications for points activity
