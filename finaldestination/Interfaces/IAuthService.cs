using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserInfo> GetCurrentUserAsync(int userId);
    Task<HotelManagerApplicationResponse> ApplyForHotelManagerAsync(int userId, HotelManagerApplicationRequest request);
    Task<HotelManagerApplicationResponse?> GetMyApplicationAsync(int userId);
    Task<IEnumerable<HotelManagerApplicationResponse>> GetAllApplicationsAsync(ApplicationStatus? status = null);
    Task<HotelManagerApplicationResponse> ProcessApplicationAsync(int applicationId, int adminUserId, ProcessApplicationRequest request);
}
