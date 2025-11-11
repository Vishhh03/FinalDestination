using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface IPointsTransactionRepository : IRepository<PointsTransaction>
{
    Task<IEnumerable<PointsTransaction>> GetTransactionsByUserAsync(int userId);
    Task<PointsTransaction?> GetEarnedPointsTransactionByBookingAsync(int bookingId);
}
