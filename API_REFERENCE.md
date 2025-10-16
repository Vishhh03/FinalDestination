# API Reference: Smart Hotel Booking System

> Complete API endpoint documentation with request/response examples

## Base URL

- **Development**: `https://localhost:5001/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get a token by logging in through `/api/auth/login`.

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [Hotel Management Endpoints](#hotel-management-endpoints)
- [Booking Management Endpoints](#booking-management-endpoints)
- [Review System Endpoints](#review-system-endpoints)
- [Loyalty Program Endpoints](#loyalty-program-endpoints)
- [Payment Processing Endpoints](#payment-processing-endpoints)
- [Error Responses](#error-responses)

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "contactNumber": "+1234567890",
  "role": "Guest"
}
```

**Validation Rules**:
- `name`: Required, max 100 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters
- `contactNumber`: Optional, valid phone format
- `role`: Required, one of: Guest, HotelManager, Admin

**Success Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Guest",
    "contactNumber": "+1234567890",
    "createdAt": "2024-01-01T10:00:00Z",
    "isActive": true
  },
  "expiresAt": "2024-01-02T10:00:00Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "message": "Validation failed",
  "details": "Email already exists",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "admin@hotel.com",
  "password": "Admin123!"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Admin",
    "email": "admin@hotel.com",
    "role": "Admin",
    "contactNumber": "+1234567890",
    "createdAt": "2024-01-01T10:00:00Z",
    "isActive": true
  },
  "expiresAt": "2024-01-02T10:00:00Z"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "message": "Invalid credentials",
  "details": "Email or password is incorrect",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

### Get Current User

Retrieve authenticated user information.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Required (All roles)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Guest",
  "contactNumber": "+1234567890",
  "createdAt": "2024-01-01T10:00:00Z",
  "isActive": true
}
```

---

### Apply for Hotel Manager Role

Submit application to become a hotel manager.

**Endpoint**: `POST /api/auth/apply-hotel-manager`

**Authentication**: Required (Guest role)

**Request Body**:
```json
{
  "businessName": "Luxury Hotels Inc",
  "businessAddress": "123 Business St, City",
  "taxId": "12-3456789",
  "description": "We operate premium hotels across the country"
}
```

**Success Response** (201 Created):
```json
{
  "id": 1,
  "userId": 3,
  "businessName": "Luxury Hotels Inc",
  "businessAddress": "123 Business St, City",
  "taxId": "12-3456789",
  "description": "We operate premium hotels across the country",
  "status": "Pending",
  "submittedAt": "2024-01-01T10:00:00Z",
  "processedAt": null,
  "adminNotes": null
}
```

---

### Check Application Status

View your hotel manager application status.

**Endpoint**: `GET /api/auth/my-application`

**Authentication**: Required (All roles)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "userId": 3,
  "businessName": "Luxury Hotels Inc",
  "status": "Approved",
  "submittedAt": "2024-01-01T10:00:00Z",
  "processedAt": "2024-01-02T10:00:00Z",
  "adminNotes": "Application approved. Welcome!"
}
```

**Response** (404 Not Found) - No application found:
```json
{
  "message": "No application found",
  "details": "You have not submitted a hotel manager application",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

### View All Applications (Admin)

Get all hotel manager applications.

**Endpoint**: `GET /api/auth/admin/applications`

**Authentication**: Required (Admin role)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "userId": 3,
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "businessName": "Luxury Hotels Inc",
    "status": "Pending",
    "submittedAt": "2024-01-01T10:00:00Z"
  }
]
```

---

### Process Application (Admin)

Approve, reject, or request more information for an application.

**Endpoint**: `POST /api/auth/admin/applications/{id}/process`

**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "action": "Approve",
  "adminNotes": "Application approved. All documents verified."
}
```

**Actions**: `Approve`, `Reject`, `RequestMoreInfo`

**Success Response** (200 OK):
```json
{
  "id": 1,
  "userId": 3,
  "businessName": "Luxury Hotels Inc",
  "status": "Approved",
  "submittedAt": "2024-01-01T10:00:00Z",
  "processedAt": "2024-01-02T10:00:00Z",
  "adminNotes": "Application approved. All documents verified."
}
```

---

## Hotel Management Endpoints

### Get All Hotels

Retrieve list of all hotels (cached for 10 minutes).

**Endpoint**: `GET /api/hotels`

**Authentication**: Not required

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Grand Plaza Hotel",
    "address": "123 Main St",
    "city": "New York",
    "pricePerNight": 150.00,
    "availableRooms": 48,
    "rating": 4.5,
    "managerId": 2,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Get Hotel by ID

Retrieve specific hotel details.

**Endpoint**: `GET /api/hotels/{id}`

**Authentication**: Not required

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Grand Plaza Hotel",
  "address": "123 Main St",
  "city": "New York",
  "pricePerNight": 150.00,
  "availableRooms": 48,
  "rating": 4.5,
  "managerId": 2,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "message": "Hotel not found",
  "details": "Hotel with ID 999 does not exist",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

### Search Hotels

Search hotels by city, price range, and rating.

**Endpoint**: `GET /api/hotels/search`

**Authentication**: Not required

**Query Parameters**:
- `city` (optional): Filter by city name
- `maxPrice` (optional): Maximum price per night
- `minPrice` (optional): Minimum price per night
- `minRating` (optional): Minimum rating (1-5)

**Example Request**:
```
GET /api/hotels/search?city=Miami&maxPrice=250&minRating=4.0
```

**Success Response** (200 OK):
```json
[
  {
    "id": 2,
    "name": "Ocean View Resort",
    "address": "456 Beach Ave",
    "city": "Miami",
    "pricePerNight": 200.00,
    "availableRooms": 28,
    "rating": 5.0,
    "managerId": 2,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Create Hotel

Add a new hotel (Hotel Manager or Admin only).

**Endpoint**: `POST /api/hotels`

**Authentication**: Required (HotelManager, Admin)

**Request Body**:
```json
{
  "name": "Luxury Resort",
  "address": "123 Beach Ave",
  "city": "Miami",
  "pricePerNight": 299.99,
  "availableRooms": 50
}
```

**Success Response** (201 Created):
```json
{
  "id": 7,
  "name": "Luxury Resort",
  "address": "123 Beach Ave",
  "city": "Miami",
  "pricePerNight": 299.99,
  "availableRooms": 50,
  "rating": 0.0,
  "managerId": 2,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### Update Hotel

Modify existing hotel (Hotel Manager or Admin only).

**Endpoint**: `PUT /api/hotels/{id}`

**Authentication**: Required (HotelManager, Admin)

**Request Body**:
```json
{
  "name": "Updated Hotel Name",
  "address": "456 New Address",
  "city": "Miami",
  "pricePerNight": 199.99,
  "availableRooms": 45
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Updated Hotel Name",
  "address": "456 New Address",
  "city": "Miami",
  "pricePerNight": 199.99,
  "availableRooms": 45,
  "rating": 4.5,
  "managerId": 2,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Delete Hotel

Remove a hotel (Admin only).

**Endpoint**: `DELETE /api/hotels/{id}`

**Authentication**: Required (Admin)

**Success Response** (204 No Content)

---

## Booking Management Endpoints

### Get All Bookings (Admin)

Retrieve all bookings in the system.

**Endpoint**: `GET /api/bookings`

**Authentication**: Required (Admin)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "guestName": "Bob Guest",
    "guestEmail": "guest@example.com",
    "hotelId": 1,
    "hotelName": "Grand Plaza Hotel",
    "userId": 3,
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-17",
    "numberOfGuests": 2,
    "totalAmount": 300.00,
    "status": "Confirmed",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

### Get My Bookings

Retrieve current user's bookings.

**Endpoint**: `GET /api/bookings/my`

**Authentication**: Required (All roles)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "guestName": "Bob Guest",
    "guestEmail": "guest@example.com",
    "hotelId": 1,
    "hotelName": "Grand Plaza Hotel",
    "userId": 3,
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-17",
    "numberOfGuests": 2,
    "totalAmount": 300.00,
    "status": "Confirmed",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

### Get Booking by ID

Retrieve specific booking details.

**Endpoint**: `GET /api/bookings/{id}`

**Authentication**: Required (Own bookings or Admin)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "guestName": "Bob Guest",
  "guestEmail": "guest@example.com",
  "hotelId": 1,
  "hotelName": "Grand Plaza Hotel",
  "userId": 3,
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-17",
  "numberOfGuests": 2,
  "totalAmount": 300.00,
  "status": "Confirmed",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### Search Bookings

Search bookings by guest email.

**Endpoint**: `GET /api/bookings/search`

**Authentication**: Required (All roles)

**Query Parameters**:
- `email` (required): Guest email address

**Example Request**:
```
GET /api/bookings/search?email=guest@example.com
```

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "guestName": "Bob Guest",
    "guestEmail": "guest@example.com",
    "hotelId": 1,
    "hotelName": "Grand Plaza Hotel",
    "userId": 3,
    "checkInDate": "2024-01-15",
    "checkOutDate": "2024-01-17",
    "numberOfGuests": 2,
    "totalAmount": 300.00,
    "status": "Confirmed",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

### Create Booking

Make a new hotel reservation.

**Endpoint**: `POST /api/bookings`

**Authentication**: Required (All roles)

**Request Body**:
```json
{
  "hotelId": 1,
  "checkInDate": "2024-12-01",
  "checkOutDate": "2024-12-03",
  "numberOfGuests": 2,
  "guestName": "John Doe",
  "guestEmail": "john@example.com"
}
```

**Validation Rules**:
- `hotelId`: Must exist
- `checkInDate`: Must be future date
- `checkOutDate`: Must be after check-in date
- `numberOfGuests`: Must be positive
- Hotel must have available rooms

**Success Response** (201 Created):
```json
{
  "id": 9,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "hotelId": 1,
  "hotelName": "Grand Plaza Hotel",
  "userId": 1,
  "checkInDate": "2024-12-01",
  "checkOutDate": "2024-12-03",
  "numberOfGuests": 2,
  "totalAmount": 300.00,
  "status": "Confirmed",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### Process Payment

Pay for a booking.

**Endpoint**: `POST /api/bookings/{id}/payment`

**Authentication**: Required (Booking owner or Admin)

**Request Body**:
```json
{
  "amount": 300.00,
  "currency": "USD",
  "paymentMethod": "CreditCard",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "cardHolderName": "John Doe"
}
```

**Success Response** (200 OK):
```json
{
  "paymentId": 9,
  "status": "Completed",
  "transactionId": "TXN123456789",
  "amount": 300.00,
  "currency": "USD",
  "paymentMethod": "CreditCard",
  "processedAt": "2024-01-01T10:00:00Z",
  "errorMessage": null
}
```

**Error Response** (400 Bad Request):
```json
{
  "paymentId": 0,
  "status": "Failed",
  "transactionId": null,
  "amount": 300.00,
  "currency": "USD",
  "paymentMethod": "CreditCard",
  "processedAt": "2024-01-01T10:00:00Z",
  "errorMessage": "Payment processing failed"
}
```

---

### Cancel Booking

Cancel an existing booking.

**Endpoint**: `PUT /api/bookings/{id}/cancel`

**Authentication**: Required (Booking owner or Admin)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "guestName": "Bob Guest",
  "guestEmail": "guest@example.com",
  "hotelId": 1,
  "hotelName": "Grand Plaza Hotel",
  "userId": 3,
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-17",
  "numberOfGuests": 2,
  "totalAmount": 300.00,
  "status": "Cancelled",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

## Review System Endpoints

### Get Hotel Reviews

Retrieve all reviews for a specific hotel.

**Endpoint**: `GET /api/reviews/hotel/{hotelId}`

**Authentication**: Not required

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "userId": 3,
    "userName": "Bob Guest",
    "hotelId": 1,
    "rating": 5,
    "comment": "Excellent service and beautiful rooms!",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

### Submit Review

Post a review for a hotel.

**Endpoint**: `POST /api/reviews`

**Authentication**: Required (All roles)

**Request Body**:
```json
{
  "hotelId": 1,
  "rating": 5,
  "comment": "Amazing experience! Highly recommended."
}
```

**Validation Rules**:
- `hotelId`: Must exist
- `rating`: Must be between 1 and 5
- `comment`: Optional, max 1000 characters

**Success Response** (201 Created):
```json
{
  "id": 11,
  "userId": 1,
  "userName": "John Doe",
  "hotelId": 1,
  "rating": 5,
  "comment": "Amazing experience! Highly recommended.",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### Update Review

Modify an existing review.

**Endpoint**: `PUT /api/reviews/{id}`

**Authentication**: Required (Review owner or Admin)

**Request Body**:
```json
{
  "rating": 4,
  "comment": "Updated review: Good experience overall."
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "userId": 1,
  "userName": "John Doe",
  "hotelId": 1,
  "rating": 4,
  "comment": "Updated review: Good experience overall.",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### Delete Review

Remove a review.

**Endpoint**: `DELETE /api/reviews/{id}`

**Authentication**: Required (Review owner or Admin)

**Success Response** (204 No Content)

---

## Loyalty Program Endpoints

### Get Loyalty Account

Retrieve current user's loyalty account information.

**Endpoint**: `GET /api/loyalty/account`

**Authentication**: Required (All roles)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "userId": 3,
  "pointsBalance": 150,
  "totalPointsEarned": 200,
  "lastUpdated": "2024-01-01T10:00:00Z"
}
```

---

### Get Transaction History

View points transaction history.

**Endpoint**: `GET /api/loyalty/transactions`

**Authentication**: Required (All roles)

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "loyaltyAccountId": 1,
    "bookingId": 1,
    "pointsEarned": 30,
    "description": "Points earned from booking at Grand Plaza Hotel",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

## Payment Processing Endpoints

### Get Payment Details

Retrieve payment information.

**Endpoint**: `GET /api/payments/{id}`

**Authentication**: Required (Payment owner or Admin)

**Success Response** (200 OK):
```json
{
  "id": 1,
  "bookingId": 1,
  "amount": 300.00,
  "currency": "USD",
  "paymentMethod": "CreditCard",
  "status": "Completed",
  "transactionId": "TXN123456789",
  "processedAt": "2024-01-01T10:00:00Z",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

### Process Refund

Refund a payment (Admin only).

**Endpoint**: `POST /api/payments/{id}/refund`

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "amount": 300.00,
  "reason": "Booking cancelled by customer"
}
```

**Success Response** (200 OK):
```json
{
  "paymentId": 1,
  "status": "Refunded",
  "transactionId": "REF123456789",
  "amount": 300.00,
  "currency": "USD",
  "paymentMethod": "CreditCard",
  "processedAt": "2024-01-01T10:00:00Z",
  "errorMessage": null
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "message": "Brief error description",
  "details": "Detailed error information",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Validation errors, invalid data |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business rule violation |
| 500 | Internal Server Error | Unexpected server error |

### Validation Error Response

```json
{
  "message": "Validation failed",
  "details": {
    "Email": ["Email is required", "Email format is invalid"],
    "Password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

## Rate Limiting

Currently not implemented. Future versions will include:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Custom limits for different endpoints

## Versioning

Current API version: **v1**

Future versions will use URL versioning:
- `/api/v1/hotels`
- `/api/v2/hotels`

---

**For more information**, visit the Swagger UI at `https://localhost:5001/swagger` or refer to the [Setup Guide](SETUP_GUIDE.md).

**Last Updated**: October 2025
