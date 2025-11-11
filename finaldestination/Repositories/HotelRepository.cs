using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class HotelRepository : Repository<Hotel>, IHotelRepository
{
    public HotelRepository(HotelContext context) : base(context) { }

    public async Task<IEnumerable<Hotel>> GetHotelsWithManagerAsync()
    {
        return await _dbSet.Include(h => h.Manager).ToListAsync();
    }

    public async Task<Hotel?> GetHotelWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(h => h.Manager)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task<IEnumerable<Hotel>> GetHotelsByManagerAsync(int managerId)
    {
        return await _dbSet
            .Include(h => h.Manager)
            .Where(h => h.ManagerId == managerId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Hotel>> SearchHotelsAsync(string? city, decimal? maxPrice, decimal? minRating)
    {
        var query = _dbSet.Include(h => h.Manager).AsQueryable();

        if (!string.IsNullOrEmpty(city))
            query = query.Where(h => h.City.ToLower().Contains(city.ToLower()));

        if (maxPrice.HasValue)
            query = query.Where(h => h.PricePerNight <= maxPrice.Value);

        if (minRating.HasValue)
            query = query.Where(h => h.Rating >= minRating.Value);

        return await query.ToListAsync();
    }
}
