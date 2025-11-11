using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class BookingRepository : Repository<Booking>, IBookingRepository
{
    public BookingRepository(HotelContext context) : base(context) { }

    public async Task<IEnumerable<Booking>> GetBookingsWithDetailsAsync()
    {
        return await _dbSet
            .Include(b => b.Hotel)
            .Include(b => b.User)
            .ToListAsync();
    }

    public async Task<Booking?> GetBookingWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Hotel)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<IEnumerable<Booking>> GetBookingsByUserAsync(int userId)
    {
        return await _dbSet
            .Include(b => b.Hotel)
            .Include(b => b.User)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetBookingsByEmailAsync(string email)
    {
        return await _dbSet
            .Include(b => b.Hotel)
            .Include(b => b.User)
            .Where(b => b.GuestEmail.ToLower() == email.ToLower())
            .ToListAsync();
    }

    public async Task<bool> HasOverlappingBookingsAsync(int hotelId, DateTime checkIn, DateTime checkOut, int? excludeBookingId = null)
    {
        var query = _dbSet.Where(b => 
            b.HotelId == hotelId &&
            b.Status == BookingStatus.Confirmed &&
            b.CheckInDate < checkOut &&
            b.CheckOutDate > checkIn);

        if (excludeBookingId.HasValue)
            query = query.Where(b => b.Id != excludeBookingId.Value);

        return await query.AnyAsync();
    }
}
