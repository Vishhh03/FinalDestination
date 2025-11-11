using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class HotelManagerApplicationRepository : Repository<HotelManagerApplication>, IHotelManagerApplicationRepository
{
    public HotelManagerApplicationRepository(HotelContext context) : base(context) { }

    public async Task<HotelManagerApplication?> GetApplicationWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(a => a.User)
            .Include(a => a.ProcessedByUser)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<HotelManagerApplication>> GetApplicationsWithDetailsAsync(ApplicationStatus? status = null)
    {
        var query = _dbSet
            .Include(a => a.User)
            .Include(a => a.ProcessedByUser)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        return await query.OrderByDescending(a => a.ApplicationDate).ToListAsync();
    }

    public async Task<HotelManagerApplication?> GetLatestApplicationByUserAsync(int userId)
    {
        return await _dbSet
            .Include(a => a.User)
            .Include(a => a.ProcessedByUser)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.ApplicationDate)
            .FirstOrDefaultAsync();
    }

    public async Task<HotelManagerApplication?> GetPendingOrApprovedApplicationByUserAsync(int userId)
    {
        return await _dbSet
            .Where(a => a.UserId == userId && 
                       (a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved))
            .FirstOrDefaultAsync();
    }
}
