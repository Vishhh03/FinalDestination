using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class PaymentRepository : Repository<Payment>, IPaymentRepository
{
    public PaymentRepository(HotelContext context) : base(context) { }

    public async Task<Payment?> GetPaymentWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(p => p.Booking)
                .ThenInclude(b => b.Hotel)
            .Include(p => p.Booking)
                .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Payment>> GetPaymentsByUserAsync(int userId)
    {
        return await _dbSet
            .Include(p => p.Booking)
                .ThenInclude(b => b.Hotel)
            .Where(p => p.Booking.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Payment?> GetCompletedPaymentByBookingAsync(int bookingId)
    {
        return await _dbSet.FirstOrDefaultAsync(p => p.BookingId == bookingId && p.Status == PaymentStatus.Completed);
    }
}
