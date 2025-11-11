using FinalDestinationAPI.Data;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Models;
using FinalDestinationAPI.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FinalDestinationAPI.Services;

/// <summary>
/// Service for handling complex business rule validation
/// </summary>
public interface IValidationService
{
    Task<ValidationResult> ValidateBookingRequestAsync(CreateBookingRequest request, int userId);
    Task<ValidationResult> ValidatePaymentRequestAsync(PaymentRequest request, int userId);
    Task<ValidationResult> ValidateReviewRequestAsync(ReviewRequest request, int userId);
    Task<ValidationResult> ValidateHotelUpdateAsync(int hotelId, UpdateHotelRequest request, int userId, string userRole);
}

public class ValidationService : IValidationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ValidationService> _logger;

    public ValidationService(IUnitOfWork unitOfWork, ILogger<ValidationService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ValidationResult> ValidateBookingRequestAsync(CreateBookingRequest request, int userId)
    {
        var errors = new List<string>();

        // Check if hotel exists and is available
        var hotel = await _unitOfWork.Hotels.GetByIdAsync(request.HotelId);
        if (hotel == null)
        {
            errors.Add($"Hotel with ID {request.HotelId} does not exist.");
            return new ValidationResult { IsValid = false, Errors = errors };
        }

        // Check room availability
        if (hotel.AvailableRooms <= 0)
        {
            errors.Add("No rooms are currently available at this hotel.");
        }

        // Get user role to determine if they're booking for themselves or others
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        var isAdminOrManager = user?.Role == UserRole.Admin || user?.Role == UserRole.HotelManager;

        // Check for overlapping bookings by the same user (only for guests booking themselves)
        // Admin and Managers can book for different guests without this restriction
        if (!isAdminOrManager)
        {
            var existingBooking = await _unitOfWork.Bookings.FirstOrDefaultAsync(b => b.UserId == userId && 
                           b.HotelId == request.HotelId &&
                           b.Status != BookingStatus.Cancelled &&
                           ((b.CheckInDate <= request.CheckInDate && b.CheckOutDate > request.CheckInDate) ||
                            (b.CheckInDate < request.CheckOutDate && b.CheckOutDate >= request.CheckOutDate) ||
                            (b.CheckInDate >= request.CheckInDate && b.CheckOutDate <= request.CheckOutDate)));

            if (existingBooking != null)
            {
                errors.Add("You already have a booking at this hotel that overlaps with the requested dates. Please choose different dates or cancel your existing booking first.");
            }
        }

        // Check booking duration (max 30 days for regular users, unlimited for admin/manager)
        var duration = (request.CheckOutDate - request.CheckInDate).Days;
        if (!isAdminOrManager && duration > 30)
        {
            errors.Add("Booking duration cannot exceed 30 days.");
        }

        // Check advance booking limit (max 1 year in advance for regular users)
        if (!isAdminOrManager)
        {
            var maxAdvanceDate = DateTime.Today.AddYears(1);
            if (request.CheckInDate > maxAdvanceDate)
            {
                errors.Add("Bookings cannot be made more than 1 year in advance.");
            }
        }

        return new ValidationResult { IsValid = errors.Count == 0, Errors = errors };
    }

    public async Task<ValidationResult> ValidatePaymentRequestAsync(PaymentRequest request, int userId)
    {
        var errors = new List<string>();

        // Check if booking exists and belongs to user
        var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(request.BookingId);

        if (booking == null)
        {
            errors.Add($"Booking with ID {request.BookingId} does not exist.");
            return new ValidationResult { IsValid = false, Errors = errors };
        }

        if (booking.UserId != userId)
        {
            errors.Add("You can only pay for your own bookings.");
        }

        // Check booking status
        if (booking.Status == BookingStatus.Cancelled)
        {
            errors.Add("Cannot process payment for a cancelled booking.");
        }

        // Check if payment already exists
        var existingPayment = await _unitOfWork.Payments.GetCompletedPaymentByBookingAsync(request.BookingId);

        if (existingPayment != null)
        {
            errors.Add("Payment has already been processed for this booking.");
        }

        // Validate payment amount matches booking total
        if (request.Amount != booking.TotalAmount)
        {
            errors.Add($"Payment amount ({request.Amount:C}) does not match booking total ({booking.TotalAmount:C}).");
        }

        // Validate card details for card payments
        if (request.PaymentMethod == PaymentMethod.CreditCard || request.PaymentMethod == PaymentMethod.DebitCard)
        {
            if (string.IsNullOrEmpty(request.CardNumber))
                errors.Add("Card number is required for card payments.");
            
            if (string.IsNullOrEmpty(request.CardHolderName))
                errors.Add("Card holder name is required for card payments.");
            
            if (string.IsNullOrEmpty(request.ExpiryMonth) || string.IsNullOrEmpty(request.ExpiryYear))
                errors.Add("Card expiry date is required for card payments.");
            
            if (string.IsNullOrEmpty(request.CVV))
                errors.Add("CVV is required for card payments.");
        }

        return new ValidationResult { IsValid = errors.Count == 0, Errors = errors };
    }

    public async Task<ValidationResult> ValidateReviewRequestAsync(ReviewRequest request, int userId)
    {
        var errors = new List<string>();

        // Check if hotel exists
        var hotel = await _unitOfWork.Hotels.GetByIdAsync(request.HotelId);
        if (hotel == null)
        {
            errors.Add($"Hotel with ID {request.HotelId} does not exist.");
            return new ValidationResult { IsValid = false, Errors = errors };
        }

        // Check if user has a completed booking at this hotel
        var hasCompletedBooking = await _unitOfWork.Bookings.AnyAsync(b => b.UserId == userId && 
                          b.HotelId == request.HotelId && 
                          b.Status == BookingStatus.Completed &&
                          b.CheckOutDate < DateTime.UtcNow);

        if (!hasCompletedBooking)
        {
            errors.Add("You can only review hotels where you have completed a stay.");
        }

        // Check if user already reviewed this hotel
        var existingReview = await _unitOfWork.Reviews.FirstOrDefaultAsync(r => r.UserId == userId && r.HotelId == request.HotelId);

        if (existingReview != null)
        {
            errors.Add("You have already reviewed this hotel. You can update your existing review instead.");
        }

        return new ValidationResult { IsValid = errors.Count == 0, Errors = errors };
    }

    public async Task<ValidationResult> ValidateHotelUpdateAsync(int hotelId, UpdateHotelRequest request, int userId, string userRole)
    {
        var errors = new List<string>();

        // Check if hotel exists
        var hotel = await _unitOfWork.Hotels.GetByIdAsync(hotelId);
        if (hotel == null)
        {
            errors.Add($"Hotel with ID {hotelId} does not exist.");
            return new ValidationResult { IsValid = false, Errors = errors };
        }

        // Check if user has permission to update this hotel
        if (userRole == "HotelManager" && hotel.ManagerId != userId)
        {
            errors.Add("Hotel managers can only update hotels they manage.");
        }

        // Check if there are active bookings when reducing room count
        if (request.AvailableRooms < hotel.AvailableRooms)
        {
            var activeBookings = await _unitOfWork.Bookings.FindAsync(b => b.HotelId == hotelId && 
                               b.Status == BookingStatus.Confirmed &&
                               b.CheckOutDate > DateTime.UtcNow);
            var activeBookingsCount = activeBookings.Count();

            var roomReduction = hotel.AvailableRooms - request.AvailableRooms;
            if (activeBookingsCount > request.AvailableRooms)
            {
                errors.Add($"Cannot reduce room count below current active bookings ({activeBookingsCount}).");
            }
        }

        return new ValidationResult { IsValid = errors.Count == 0, Errors = errors };
    }
}

/// <summary>
/// Result of validation operation
/// </summary>
public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
}




