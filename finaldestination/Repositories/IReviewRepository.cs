using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface IReviewRepository : IRepository<Review>
{
    Task<IEnumerable<Review>> GetReviewsByHotelAsync(int hotelId);
    Task<IEnumerable<Review>> GetReviewsByUserAsync(int userId);
    Task<Review?> GetReviewWithDetailsAsync(int id);
}
