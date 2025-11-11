using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface ILoyaltyAccountRepository : IRepository<LoyaltyAccount>
{
    Task<LoyaltyAccount?> GetByUserIdAsync(int userId);
}
