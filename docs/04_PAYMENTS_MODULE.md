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
