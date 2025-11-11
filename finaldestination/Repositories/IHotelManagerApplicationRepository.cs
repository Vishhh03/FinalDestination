using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface IHotelManagerApplicationRepository : IRepository<HotelManagerApplication>
{
    Task<HotelManagerApplication?> GetApplicationWithDetailsAsync(int id);
    Task<IEnumerable<HotelManagerApplication>> GetApplicationsWithDetailsAsync(ApplicationStatus? status = null);
    Task<HotelManagerApplication?> GetLatestApplicationByUserAsync(int userId);
    Task<HotelManagerApplication?> GetPendingOrApprovedApplicationByUserAsync(int userId);
}
