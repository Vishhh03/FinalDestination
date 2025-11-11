using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class PointsTransactionRepository : Repository<PointsTransaction>, IPointsTransactionRepository
{
    public PointsTransactionRepository(HotelContext context) : base(context) { }

    public async Task<IEnumerable<PointsTransaction>> GetTransactionsByUserAsync(int userId)
    {
        return await _dbSet
            .Include(pt => pt.Booking)
                .ThenInclude(b => b.Hotel)
            .Include(pt => pt.LoyaltyAccount)
            .Where(pt => pt.LoyaltyAccount.UserId == userId)
            .OrderByDescending(pt => pt.CreatedAt)
            .ToListAsync();
    }

    public async Task<PointsTransaction?> GetEarnedPointsTransactionByBookingAsync(int bookingId)
    {
        return await _dbSet.FirstOrDefaultAsync(pt => pt.BookingId == bookingId && pt.PointsEarned > 0);
    }
}
