using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Interfaces;

public interface IHotelService
{
    Task<IEnumerable<Hotel>> GetAllHotelsAsync();
    Task<Hotel?> GetHotelByIdAsync(int id);
    Task<IEnumerable<Hotel>> GetMyHotelsAsync(int managerId);
    Task<IEnumerable<Hotel>> SearchHotelsAsync(string? city, decimal? maxPrice, decimal? minRating);
    Task<Hotel> CreateHotelAsync(CreateHotelRequest request);
    Task UpdateHotelAsync(int id, UpdateHotelRequest request, int userId, string userRole);
    Task DeleteHotelAsync(int id, int userId, string userRole);
}
