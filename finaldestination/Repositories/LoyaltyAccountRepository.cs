using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class LoyaltyAccountRepository : Repository<LoyaltyAccount>, ILoyaltyAccountRepository
{
    public LoyaltyAccountRepository(HotelContext context) : base(context) { }

    public async Task<LoyaltyAccount?> GetByUserIdAsync(int userId)
    {
        return await _dbSet.FirstOrDefaultAsync(la => la.UserId == userId);
    }
}
