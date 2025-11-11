using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class ReviewRepository : Repository<Review>, IReviewRepository
{
    public ReviewRepository(HotelContext context) : base(context) { }

    public async Task<IEnumerable<Review>> GetReviewsByHotelAsync(int hotelId)
    {
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Hotel)
            .Where(r => r.HotelId == hotelId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Review>> GetReviewsByUserAsync(int userId)
    {
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Hotel)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review?> GetReviewWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Hotel)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}
