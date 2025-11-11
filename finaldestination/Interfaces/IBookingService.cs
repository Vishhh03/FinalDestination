using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<BookingResponse>> GetAllBookingsAsync();
    Task<BookingResponse?> GetBookingByIdAsync(int id, int userId, string userRole);
    Task<IEnumerable<BookingResponse>> GetMyBookingsAsync(int userId);
    Task<IEnumerable<BookingResponse>> GetBookingsByEmailAsync(string email);
    Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, int userId);
    Task<PaymentResult> ProcessPaymentAsync(int bookingId, PaymentRequest request, int userId);
    Task<PaymentResult?> CancelBookingAsync(int bookingId, int userId, string userRole);
    Task DeleteBookingAsync(int bookingId);
}
