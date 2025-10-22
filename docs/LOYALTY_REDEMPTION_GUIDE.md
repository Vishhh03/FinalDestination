# Loyalty Points Redemption

## Conversion Rate
1 point = ₹0.10 INR

Examples: 100 points = ₹10 | 500 points = ₹50 | 1,000 points = ₹100

## Usage

### Redeem During Booking Creation

Include `pointsToRedeem` field in booking request:

```http
POST /api/bookings
Authorization: Bearer {your-jwt-token}
Content-Type: application/json

{
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "hotelId": 1,
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-23",
  "numberOfGuests": 2,
  "pointsToRedeem": 500
}
```

**Response**:
```json
{
  "id": 123,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "hotelId": 1,
  "hotelName": "Grand Plaza Hotel",
  "checkInDate": "2024-12-20",
  "checkOutDate": "2024-12-23",
  "numberOfGuests": 2,
  "totalAmount": 2950.00,
  "loyaltyPointsRedeemed": 500,
  "loyaltyDiscountAmount": 50.00,
  "status": "Confirmed",
  "paymentRequired": true
}
```

System validates points, deducts from balance, applies discount, records transaction.

## API Endpoints

- `GET /api/loyalty/account` - Check balance
- `GET /api/loyalty/calculate-discount?points={points}` - Calculate discount
- `POST /api/bookings` - Create booking (with optional `pointsToRedeem`)
- `POST /api/loyalty/redeem` - Standalone redemption
- `GET /api/loyalty/history` - Transaction history

## Validation

- Points > 0
- Sufficient balance
- Loyalty account exists
- Discount ≤ booking total
- Payment matches discounted total

## Code Example

```javascript
// Create booking with redemption
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ...bookingData,
    pointsToRedeem: 500
  })
});
```

## Notes

- Points earned on amount paid (10% of discounted amount)
- Redemptions show as negative in transaction history
- Account auto-created on first booking
