using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface IBookingRepository : IRepository<Booking>
{
    Task<IEnumerable<Booking>> GetBookingsWithDetailsAsync();
    Task<Booking?> GetBookingWithDetailsAsync(int id);
    Task<IEnumerable<Booking>> GetBookingsByUserAsync(int userId);
    Task<IEnumerable<Booking>> GetBookingsByEmailAsync(string email);
    Task<bool> HasOverlappingBookingsAsync(int hotelId, DateTime checkIn, DateTime checkOut, int? excludeBookingId = null);
}
