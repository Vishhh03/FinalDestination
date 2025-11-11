using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.Models;
using FinalDestinationAPI.Repositories;
using FinalDestinationAPI.Helpers;

namespace FinalDestinationAPI.Services;

public class BookingService : IBookingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPaymentService _paymentService;
    private readonly ILoyaltyService _loyaltyService;
    private readonly IValidationService _validationService;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        IUnitOfWork unitOfWork,
        IPaymentService paymentService,
        ILoyaltyService loyaltyService,
        IValidationService validationService,
        ILogger<BookingService> logger)
    {
        _unitOfWork = unitOfWork;
        _paymentService = paymentService;
        _loyaltyService = loyaltyService;
        _validationService = validationService;
        _logger = logger;
    }

    public async Task<IEnumerable<BookingResponse>> GetAllBookingsAsync()
    {
        var bookings = await _unitOfWork.Bookings.GetBookingsWithDetailsAsync();
        return bookings.Select(MapToBookingResponse);
    }

    public async Task<BookingResponse?> GetBookingByIdAsync(int id, int userId, string userRole)
    {
        var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(id);

        if (booking == null)
        {
            return null;
        }

        if (userRole != "Admin" && booking.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only access your own bookings.");
        }

        return MapToBookingResponse(booking);
    }

    public async Task<IEnumerable<BookingResponse>> GetMyBookingsAsync(int userId)
    {
        var bookings = await _unitOfWork.Bookings.GetBookingsByUserAsync(userId);
        return bookings.Select(MapToBookingResponse);
    }

    public async Task<IEnumerable<BookingResponse>> GetBookingsByEmailAsync(string email)
    {
        var bookings = await _unitOfWork.Bookings.GetBookingsByEmailAsync(email);
        return bookings.Select(MapToBookingResponse);
    }

    public async Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, int userId)
    {
        var validationResult = await _validationService.ValidateBookingRequestAsync(request, userId);
        if (!validationResult.IsValid)
        {
            throw new InvalidOperationException(string.Join(", ", validationResult.Errors));
        }

        var hotel = await _unitOfWork.Hotels.GetByIdAsync(request.HotelId);

        var nights = (request.CheckOutDate - request.CheckInDate).Days;
        var baseAmount = hotel!.PricePerNight * nights;
        var totalAmount = baseAmount;

        _logger.LogInformation("Booking calculation: {Nights} nights × {PricePerNight} = {BaseAmount}",
            nights, CurrencyHelper.FormatInr(hotel.PricePerNight), CurrencyHelper.FormatInr(baseAmount));

        int? pointsRedeemed = null;
        decimal? discountAmount = null;

        if (request.PointsToRedeem.HasValue && request.PointsToRedeem.Value > 0)
        {
            var redemptionResult = await _loyaltyService.RedeemPointsAsync(userId, request.PointsToRedeem.Value);
            pointsRedeemed = redemptionResult.PointsRedeemed;
            discountAmount = redemptionResult.DiscountAmount;
            totalAmount = Math.Max(0, baseAmount - discountAmount.Value);

            _logger.LogInformation("Applied loyalty discount of ${Discount:F2} ({Points} points) to booking for user {UserId}",
                discountAmount.Value, pointsRedeemed.Value, userId);
        }

        var booking = new Booking
        {
            GuestName = request.GuestName,
            GuestEmail = request.GuestEmail,
            HotelId = request.HotelId,
            UserId = userId,
            CheckInDate = request.CheckInDate,
            CheckOutDate = request.CheckOutDate,
            NumberOfGuests = request.NumberOfGuests,
            TotalAmount = totalAmount,
            LoyaltyPointsRedeemed = pointsRedeemed,
            LoyaltyDiscountAmount = discountAmount,
            Status = BookingStatus.Confirmed,
            CreatedAt = TimeZoneHelper.GetIstNow()
        };

        await _unitOfWork.Bookings.AddAsync(booking);
        hotel.AvailableRooms--;
        _unitOfWork.Hotels.Update(hotel);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Booking {BookingId} created for user {UserId}, payment required", booking.Id, userId);

        booking.Hotel = hotel;
        var response = MapToBookingResponse(booking);
        response.PaymentRequired = true;

        return response;
    }

    public async Task<PaymentResult> ProcessPaymentAsync(int bookingId, PaymentRequest request, int userId)
    {
        request.BookingId = bookingId;

        var validationResult = await _validationService.ValidatePaymentRequestAsync(request, userId);
        if (!validationResult.IsValid)
        {
            throw new InvalidOperationException(validationResult.Errors.FirstOrDefault() ?? "Payment validation failed");
        }

        var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(bookingId);

        var paymentResult = await _paymentService.ProcessPaymentAsync(request);

        if (paymentResult.Status == PaymentStatus.Completed)
        {
            booking!.Status = BookingStatus.Confirmed;
            await _unitOfWork.SaveChangesAsync();

            if (booking.UserId.HasValue)
            {
                try
                {
                    await _loyaltyService.AwardPointsAsync(booking.UserId.Value, booking.Id, booking.TotalAmount);
                    _logger.LogInformation("Loyalty points awarded for booking {BookingId} to user {UserId}",
                        booking.Id, booking.UserId.Value);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to award loyalty points for booking {BookingId}", booking.Id);
                }
            }

            _logger.LogInformation("Payment {TransactionId} completed for booking {BookingId}",
                paymentResult.TransactionId, bookingId);
        }
        else
        {
            if (booking!.Hotel != null)
            {
                booking.Hotel.AvailableRooms++;
                _unitOfWork.Hotels.Update(booking.Hotel);
            }
            booking.Status = BookingStatus.Cancelled;
            await _unitOfWork.SaveChangesAsync();

            _logger.LogWarning("Payment failed for booking {BookingId}: {ErrorMessage}",
                bookingId, paymentResult.ErrorMessage);
        }

        return paymentResult;
    }

    public async Task<PaymentResult?> CancelBookingAsync(int bookingId, int userId, string userRole)
    {
        var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(bookingId);

        if (booking == null)
        {
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");
        }

        if (userRole != "Admin" && booking.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only cancel your own bookings.");
        }

        if (booking.Status == BookingStatus.Cancelled)
        {
            throw new InvalidOperationException("Booking is already cancelled.");
        }

        PaymentResult? refundResult = null;

        var payment = await _unitOfWork.Payments.GetCompletedPaymentByBookingAsync(bookingId);

        if (payment != null)
        {
            refundResult = await _paymentService.RefundPaymentAsync(payment.Id, payment.Amount);

            if (refundResult.Status != PaymentStatus.Refunded)
            {
                throw new InvalidOperationException($"Failed to process refund: {refundResult.ErrorMessage}");
            }

            _logger.LogInformation("Refund {TransactionId} processed for booking {BookingId}",
                refundResult.TransactionId, bookingId);
        }

        if (booking.UserId.HasValue)
        {
            if (booking.LoyaltyPointsRedeemed.HasValue && booking.LoyaltyPointsRedeemed.Value > 0)
            {
                try
                {
                    await _loyaltyService.RefundRedeemedPointsAsync(booking.UserId.Value, booking.Id, booking.LoyaltyPointsRedeemed.Value);
                    _logger.LogInformation("Refunded {Points} redeemed loyalty points for cancelled booking {BookingId}",
                        booking.LoyaltyPointsRedeemed.Value, bookingId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to refund redeemed loyalty points for booking {BookingId}", bookingId);
                }
            }

            if (payment != null)
            {
                try
                {
                    await _loyaltyService.RevokeEarnedPointsAsync(booking.UserId.Value, booking.Id);
                    _logger.LogInformation("Revoked earned loyalty points for cancelled booking {BookingId}", bookingId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to revoke earned loyalty points for booking {BookingId}", bookingId);
                }
            }
        }

        booking.Status = BookingStatus.Cancelled;

        if (booking.Hotel != null)
        {
            booking.Hotel.AvailableRooms++;
            _unitOfWork.Hotels.Update(booking.Hotel);
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Booking {BookingId} cancelled by user {UserId}", bookingId, userId);

        return refundResult;
    }

    public async Task DeleteBookingAsync(int bookingId)
    {
        var booking = await _unitOfWork.Bookings.GetBookingWithDetailsAsync(bookingId);

        if (booking == null)
        {
            throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");
        }

        var hasPayments = await _unitOfWork.Payments.AnyAsync(p => p.BookingId == bookingId);
        if (hasPayments)
        {
            throw new InvalidOperationException("Cannot delete booking with associated payments. Cancel the booking instead.");
        }

        if (booking.Status == BookingStatus.Confirmed && booking.Hotel != null)
        {
            booking.Hotel.AvailableRooms++;
            _unitOfWork.Hotels.Update(booking.Hotel);
        }

        _unitOfWork.Bookings.Remove(booking);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Booking {BookingId} deleted by admin", bookingId);
    }

    private BookingResponse MapToBookingResponse(Booking booking)
    {
        var hasPayment = _unitOfWork.Payments.AnyAsync(p => p.BookingId == booking.Id && p.Status == PaymentStatus.Completed).Result;
        var payment = _unitOfWork.Payments.GetCompletedPaymentByBookingAsync(booking.Id).Result;

        int? loyaltyPointsEarned = null;
        if (booking.UserId.HasValue)
        {
            var pointsTransaction = _unitOfWork.PointsTransactions.GetEarnedPointsTransactionByBookingAsync(booking.Id).Result;
            loyaltyPointsEarned = pointsTransaction?.PointsEarned;
        }

        return new BookingResponse
        {
            Id = booking.Id,
            GuestName = booking.GuestName,
            GuestEmail = booking.GuestEmail,
            HotelId = booking.HotelId,
            HotelName = booking.Hotel?.Name ?? "Unknown Hotel",
            UserId = booking.UserId,
            CheckInDate = booking.CheckInDate,
            CheckOutDate = booking.CheckOutDate,
            NumberOfGuests = booking.NumberOfGuests,
            TotalAmount = booking.TotalAmount,
            LoyaltyPointsRedeemed = booking.LoyaltyPointsRedeemed,
            LoyaltyDiscountAmount = booking.LoyaltyDiscountAmount,
            Status = booking.Status,
            CreatedAt = TimeZoneHelper.ToIst(booking.CreatedAt),
            PaymentRequired = !hasPayment && booking.Status != BookingStatus.Cancelled,
            PaymentId = payment?.Id,
            LoyaltyPointsEarned = loyaltyPointsEarned
        };
    }
}
