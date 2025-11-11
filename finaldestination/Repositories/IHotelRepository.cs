using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface IHotelRepository : IRepository<Hotel>
{
    Task<IEnumerable<Hotel>> GetHotelsWithManagerAsync();
    Task<Hotel?> GetHotelWithDetailsAsync(int id);
    Task<IEnumerable<Hotel>> GetHotelsByManagerAsync(int managerId);
    Task<IEnumerable<Hotel>> SearchHotelsAsync(string? city, decimal? maxPrice, decimal? minRating);
}
