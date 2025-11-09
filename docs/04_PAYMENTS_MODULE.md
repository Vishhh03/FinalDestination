# Payments Module

## Overview
Simulated payment processing system with multiple payment methods and transaction tracking.

⚠️ **Note**: This is a demonstration system. In production, use a real payment gateway like Stripe or PayPal.

## Backend Components

### PaymentsController
**Location**: `Controllers/PaymentsController.cs`

**Endpoints**:
```
POST /api/payments/process           - Process payment
GET  /api/payments/{id}              - Get payment details
GET  /api/payments/booking/{bookingId} - Get booking payment
```

### Payment Model
```csharp
- Id (int)
- BookingId (int)
- Amount (decimal)
- Currency (string, default: "USD")
- PaymentMethod (PaymentMethod enum)
- Status (PaymentStatus enum)
- TransactionId (string, unique)
- CardLastFourDigits (string, optional)
- ErrorMessage (string, optional)
- ProcessedAt (DateTime)
```

### PaymentStatus Enum
```csharp
Pending = 0
Completed = 1
Failed = 2
Refunded = 3
```

### PaymentMethod Enum
```csharp
CreditCard = 0
DebitCard = 1
PayPal = 2
BankTransfer = 3
```

## Payment Flow

### Process Payment
```
User completes booking →
Payment required →
User clicks "Pay Now" →
Payment modal opens →
User enters card details →
POST /api/payments/process →
Validation (card format, expiry) →
Generate transaction ID →
Payment status: Completed →
Booking updated with PaymentId →
Success message displayed
```

## Payment Validation

### Card Number
- Must be 16 digits
- Format: XXXX-XXXX-XXXX-XXXX or XXXXXXXXXXXXXXXX
- No actual validation of card network

### CVV
- Must be 3 digits
- Format: XXX

### Expiry Date
- Month: 01-12
- Year: Current year or later
- Must not be in the past

### Amount
- Must match booking total
- Must be greater than 0
- Booking must exist and not be paid

## Simulated Processing

```csharp
// This is a simulation - no real payment gateway
var payment = new Payment
{
    BookingId = request.BookingId,
    Amount = request.Amount,
    Currency = request.Currency,
    PaymentMethod = request.PaymentMethod,
    Status = PaymentStatus.Completed,
    TransactionId = Guid.NewGuid().ToString(),
    CardLastFourDigits = request.CardNumber?.Substring(request.CardNumber.Length - 4),
    ProcessedAt = DateTime.UtcNow
};
```

## Payment Methods

### Credit Card
- Requires: Card number, holder name, expiry, CVV
- Instant processing
- Most common method

### Debit Card
- Same requirements as credit card
- Instant processing

### PayPal
- Simplified simulation
- No actual PayPal integration
- Instant processing

### Bank Transfer
- Simplified simulation
- No actual bank integration
- Instant processing

## API Examples

### Process Payment
```http
POST /api/payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": 1,
  "amount": 595.00,
  "currency": "USD",
  "paymentMethod": 0,
  "cardNumber": "4532123456789012",
  "cardHolderName": "John Doe",
  "expiryMonth": "12",
  "expiryYear": "2026",
  "cvv": "123"
}
```

**Response**:
```json
{
  "paymentId": 1,
  "status": 1,
  "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "amount": 595.00,
  "currency": "USD",
  "processedAt": "2025-11-09T12:00:00Z"
}
```

### Get Payment Details
```http
GET /api/payments/1
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": 1,
  "bookingId": 1,
  "amount": 595.00,
  "currency": "USD",
  "paymentMethod": 0,
  "status": 1,
  "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "cardLastFourDigits": "9012",
  "processedAt": "2025-11-09T12:00:00Z"
}
```

## Security Considerations

### Current Implementation
- ✅ Card number validation (format only)
- ✅ Expiry date validation
- ✅ CVV format validation
- ✅ Transaction ID generation
- ✅ Last 4 digits storage only

### Production Requirements
- ⚠️ Use real payment gateway (Stripe, PayPal, etc.)
- ⚠️ Never store full card numbers
- ⚠️ Use PCI-DSS compliant services
- ⚠️ Implement 3D Secure
- ⚠️ Add fraud detection
- ⚠️ Use HTTPS only
- ⚠️ Implement webhook handling
- ⚠️ Add refund processing

## Error Handling

### Payment Failures
```json
{
  "paymentId": 1,
  "status": 2,
  "errorMessage": "Invalid card number",
  "processedAt": "2025-11-09T12:00:00Z"
}
```

### Common Errors
- Invalid card number format
- Expired card
- Invalid CVV
- Booking already paid
- Booking not found
- Amount mismatch

## Integration Points
- **Bookings Module**: Payment requirement and completion
- **Loyalty Module**: Points awarded after successful payment
- **Authentication Module**: User identification


## Payment Status Enum Alignment

### Backend (C#)
```csharp
public enum PaymentStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Refunded = 3
}
```

### Frontend (TypeScript)
```typescript
enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Refunded = 3
}
```

**Important**: Both frontend and backend use numeric enum values for consistency.

## Payment Processing Flow

```
1. User initiates booking
   ↓
2. Booking created with Confirmed status
   ↓
3. Room reserved (AvailableRooms--)
   ↓
4. Payment processing initiated
   ↓
5a. Payment Success (90% chance in mock)
    - Payment status: Completed
    - Booking status: Confirmed
    - Award loyalty points
    - Room remains reserved
   ↓
5b. Payment Failure (10% chance in mock)
    - Payment status: Failed
    - Booking status: Cancelled
    - Restore room (AvailableRooms++)
    - No points awarded
```

## Mock Payment Service

### Success Rate
- **90%** success rate (simulates real-world scenarios)
- **10%** failure rate for testing

### Transaction ID Generation
```csharp
TransactionId = $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}"
// Example: TXN202411101234567890
```

### Processing Delay
- Simulates real payment gateway delay
- Helps test loading states in UI

## Refund Processing

### Refund Flow
```
1. User cancels confirmed booking
   ↓
2. Check for completed payment
   ↓
3. Process refund
   - Create refund transaction
   - Update payment status to Refunded
   - Generate refund transaction ID
   ↓
4. Update booking status to Cancelled
   ↓
5. Restore room availability
```

### Refund Validation
```csharp
// Only refund completed payments
if (payment.Status != PaymentStatus.Completed)
{
    return BadRequest("Cannot refund non-completed payment");
}
```

## Payment Methods Supported

```csharp
public enum PaymentMethod
{
    CreditCard = 0,
    DebitCard = 1,
    PayPal = 2,
    UPI = 3
}
```

### Indian Payment Methods
- Credit Card
- Debit Card
- UPI (Unified Payments Interface)
- PayPal

## Currency

All payments in **Indian Rupees (₹)**:
- Display: ₹ symbol throughout UI
- Storage: Decimal values in database
- Calculations: Precise decimal arithmetic

## Payment Security

### Validation
- Amount validation (positive, reasonable range)
- Payment method validation
- Booking ownership verification
- Duplicate payment prevention

### Logging
```csharp
_logger.LogInformation("Payment {TransactionId} completed for booking {BookingId}", 
    paymentResult.TransactionId, bookingId);

_logger.LogWarning("Payment failed for booking {BookingId}: {ErrorMessage}", 
    bookingId, paymentResult.ErrorMessage);
```

### Error Handling
- Try-catch blocks for payment processing
- Automatic room restoration on errors
- User-friendly error messages
- Detailed logging for debugging

## Integration with Loyalty System

### Points Earning
```csharp
// Award 10% of booking amount as points
if (paymentResult.Status == PaymentStatus.Completed)
{
    await _loyaltyService.AwardPointsAsync(
        userId, 
        bookingId, 
        booking.TotalAmount
    );
}
```

### Points Redemption
```csharp
// Apply discount before payment
if (pointsToRedeem > 0)
{
    var redemption = await _loyaltyService.RedeemPointsAsync(userId, pointsToRedeem);
    totalAmount -= redemption.DiscountAmount;
}
```

## Future Enhancements

- [ ] Real payment gateway integration (Stripe, Razorpay)
- [ ] Partial refunds
- [ ] Payment installments
- [ ] Multiple payment methods per booking
- [ ] Payment retry mechanism
- [ ] Webhook handling for async payments
- [ ] Payment receipts (PDF generation)
- [ ] Payment history export
