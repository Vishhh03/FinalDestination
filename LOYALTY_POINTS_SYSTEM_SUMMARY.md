# Loyalty Points System - Complete Overview

## How It Works

### 1. Points Earning (Backend Automatic)

**When:** After successful payment completion

**Where:** `BookingsController.ProcessPayment()` method

**Process:**
```csharp
// After payment is completed successfully
if (paymentResult.Status == PaymentStatus.Completed) {
    booking.Status = BookingStatus.Confirmed;
    
    // Award loyalty points automatically
    await _loyaltyService.AwardPointsAsync(
        booking.UserId.Value, 
        booking.Id, 
        booking.TotalAmount
    );
}
```

**Calculation:** Points are calculated based on the booking amount (typically 10% of total)
- Example: $100 booking = 1000 points (10 points per dollar)

### 2. Points Redemption (Frontend + Backend)

**When:** During booking creation

**Where:** Hotel detail page booking modal

**Frontend Implementation:**

#### UI Components (hotel-detail.component.html)
```html
@if (availablePoints() > 0) {
  <div class="loyalty-section">
    <div class="loyalty-header">
      <span><i class="fas fa-gift"></i> Redeem Loyalty Points</span>
      <span class="points-available">{{ availablePoints() }} points available</span>
    </div>
    <div class="form-group">
      <label>Points to Redeem (100 points = $1)</label>
      <input 
        type="number" 
        [(ngModel)]="pointsToRedeem"
        min="0"
        [max]="maxRedeemablePoints()"
        step="100"
      />
      <small class="hint">Maximum {{ maxRedeemablePoints() }} points (50% of total)</small>
    </div>
  </div>
}
```

#### Logic (hotel-detail.component.ts)
```typescript
// Available points from user's loyalty account
availablePoints = computed(() => 
  this.auth.currentUser()?.loyaltyAccount?.pointsBalance || 0
);

// Maximum redeemable points (50% of total booking)
maxRedeemablePoints = computed(() => {
  const points = this.availablePoints();
  const total = this.totalAmount();
  const maxPointsForDiscount = Math.floor(total * 50); // 50% max
  return Math.min(points, maxPointsForDiscount);
});

// Discount calculation (100 points = $1)
discount = computed(() => this.pointsToRedeem / 100);

// Final amount after discount
finalAmount = computed(() => 
  Math.max(0, this.totalAmount() - this.discount())
);

// Booking submission
const bookingData = {
  hotelId: this.hotel()!.id,
  checkInDate: this.checkInDate,
  checkOutDate: this.checkOutDate,
  numberOfGuests: this.numberOfGuests,
  guestName: user?.name || '',
  guestEmail: user?.email || '',
  pointsToRedeem: this.pointsToRedeem > 0 ? this.pointsToRedeem : null
};
```

#### Backend Processing (BookingsController.CreateBooking)
```csharp
// Apply loyalty points discount if requested
if (request.PointsToRedeem.HasValue && request.PointsToRedeem.Value > 0) {
    var redemptionResult = await _loyaltyService.RedeemPointsAsync(
        currentUserId.Value, 
        request.PointsToRedeem.Value
    );
    
    pointsRedeemed = redemptionResult.PointsRedeemed;
    discountAmount = redemptionResult.DiscountAmount;
    
    // Apply discount to total amount
    totalAmount = Math.Max(0, baseAmount - discountAmount.Value);
}
```

## API Endpoints

### Loyalty Controller (`/api/loyalty`)

#### Get My Loyalty Account
```
GET /api/loyalty/account
Authorization: Bearer {token}
Response: { pointsBalance, totalPointsEarned, lastUpdated }
```

#### Get Points History
```
GET /api/loyalty/history?pageNumber=1&pageSize=10
Authorization: Bearer {token}
Response: [{ transactionId, pointsEarned, pointsRedeemed, ... }]
```

#### Calculate Points for Amount
```
GET /api/loyalty/calculate-points?bookingAmount=100
Response: 1000 (points)
```

#### Calculate Discount from Points
```
GET /api/loyalty/calculate-discount?points=500
Response: 5.00 (dollars)
```

#### Redeem Points (Standalone)
```
POST /api/loyalty/redeem
Authorization: Bearer {token}
Body: { pointsToRedeem: 500 }
Response: { pointsRedeemed, discountAmount, newBalance }
```

## Points Conversion Rate

- **Earning:** 10 points per $1 spent (10% back)
- **Redemption:** 100 points = $1 discount
- **Maximum Redemption:** 50% of booking total

### Example Scenarios

#### Scenario 1: Earning Points
- Booking: $200 for 2 nights
- Payment completed successfully
- **Points Earned:** 2000 points (10% of $200)

#### Scenario 2: Redeeming Points
- User has: 5000 points available
- Booking total: $150
- Maximum redeemable: 7500 points (50% of $150 = $75 × 100)
- User redeems: 3000 points
- **Discount:** $30
- **Final Amount:** $120
- **Points After:** 2000 points

#### Scenario 3: Full Cycle
1. **First Booking:** $100 → Earn 1000 points
2. **Second Booking:** $200 → Redeem 1000 points ($10 off) → Pay $190 → Earn 1900 points
3. **Balance:** 1900 points available

## User Experience Flow

### Booking with Points Redemption

1. **User browses hotels** → Sees available points in navbar
2. **Clicks "Book Now"** → Booking modal opens
3. **Enters dates and guests** → Sees total amount
4. **Loyalty section appears** (if user has points)
   - Shows available points
   - Input field to enter points to redeem
   - Shows maximum redeemable points
   - Real-time discount calculation
5. **Booking summary updates** → Shows discount and final amount
6. **Confirms booking** → Points deducted, booking created
7. **Completes payment** → Points earned for this booking

### Points Display

- **Navbar:** Shows current points balance
  ```html
  <span class="points-badge">
    <i class="fas fa-star"></i>
    {{ currentUser.loyaltyAccount.pointsBalance }} pts
  </span>
  ```

- **Booking Modal:** Shows available points and redemption options

- **Booking History:** Shows points earned/redeemed per booking

## Database Schema

### LoyaltyAccount Table
```sql
- Id (PK)
- UserId (FK to Users)
- PointsBalance (current balance)
- TotalPointsEarned (lifetime total)
- LastUpdated
```

### PointsTransactions Table
```sql
- Id (PK)
- UserId (FK to Users)
- BookingId (FK to Bookings, nullable)
- PointsEarned (positive for earning)
- PointsRedeemed (positive for redemption)
- TransactionType (Earned, Redeemed, Expired, etc.)
- TransactionDate
- Description
```

### Booking Table (Loyalty Fields)
```sql
- LoyaltyPointsRedeemed (nullable)
- LoyaltyDiscountAmount (nullable)
- LoyaltyPointsEarned (calculated from transaction)
```

## Configuration

Points calculation is configured in `LoyaltySettings`:

```json
{
  "Loyalty": {
    "PointsPerDollar": 10,
    "DollarsPerHundredPoints": 1,
    "MaxRedemptionPercentage": 50
  }
}
```

## Testing

### Test Users with Points

After seeding, users start with 0 points. To test:

1. **Create a booking** as `guest@hotel.com`
2. **Complete payment** → Points earned automatically
3. **Create another booking** → Redeem points option appears
4. **Check navbar** → Points balance updates in real-time

### Manual Points Award (Admin Only)
```
POST /api/loyalty/award-points
Authorization: Bearer {admin-token}
Body: {
  userId: 3,
  bookingId: 1,
  bookingAmount: 100
}
```

## Summary

✅ **Points Earning:** Automatic after payment completion
✅ **Points Redemption:** User-initiated during booking
✅ **UI Implementation:** Complete with real-time calculations
✅ **Backend Logic:** Fully implemented with validation
✅ **Display:** Points shown in navbar and booking flow
✅ **Conversion:** 100 points = $1, max 50% discount

The loyalty system is **fully functional** and integrated throughout the booking flow!
