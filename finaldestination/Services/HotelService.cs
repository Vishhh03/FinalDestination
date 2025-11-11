using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.Models;
using FinalDestinationAPI.Repositories;

namespace FinalDestinationAPI.Services;

public class HotelService : IHotelService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly ILogger<HotelService> _logger;

    private const string HOTELS_CACHE_KEY = "hotels:all";
    private const string HOTEL_CACHE_KEY_PREFIX = "hotel:";
    private const string SEARCH_CACHE_KEY_PREFIX = "hotels:search:";
    private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(10);

    public HotelService(IUnitOfWork unitOfWork, ICacheService cache, ILogger<HotelService> logger)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IEnumerable<Hotel>> GetAllHotelsAsync()
    {
        var cachedHotels = await _cache.GetAsync<List<Hotel>>(HOTELS_CACHE_KEY);
        if (cachedHotels != null)
        {
            _logger.LogInformation("Hotels retrieved from cache");
            return cachedHotels;
        }

        var hotels = await _unitOfWork.Hotels.GetHotelsWithManagerAsync();
        await _cache.SetAsync(HOTELS_CACHE_KEY, hotels.ToList(), CacheExpiration);
        _logger.LogInformation("Hotels retrieved from database and cached");

        return hotels;
    }

    public async Task<Hotel?> GetHotelByIdAsync(int id)
    {
        var cacheKey = $"{HOTEL_CACHE_KEY_PREFIX}{id}";
        var cachedHotel = await _cache.GetAsync<Hotel>(cacheKey);
        
        if (cachedHotel != null)
        {
            _logger.LogInformation("Hotel {HotelId} retrieved from cache", id);
            return cachedHotel;
        }

        var hotel = await _unitOfWork.Hotels.GetHotelWithDetailsAsync(id);
        
        if (hotel != null)
        {
            await _cache.SetAsync(cacheKey, hotel, CacheExpiration);
            _logger.LogInformation("Hotel {HotelId} retrieved from database and cached", id);
        }

        return hotel;
    }

    public async Task<IEnumerable<Hotel>> GetMyHotelsAsync(int managerId)
    {
        _logger.LogInformation("Retrieving hotels for manager with ID: {UserId}", managerId);
        return await _unitOfWork.Hotels.GetHotelsByManagerAsync(managerId);
    }

    public async Task<IEnumerable<Hotel>> SearchHotelsAsync(string? city, decimal? maxPrice, decimal? minRating)
    {
        var cacheKey = $"{SEARCH_CACHE_KEY_PREFIX}{city?.ToLower() ?? "all"}:{maxPrice?.ToString() ?? "any"}:{minRating?.ToString() ?? "any"}";
        
        var cachedResults = await _cache.GetAsync<List<Hotel>>(cacheKey);
        if (cachedResults != null)
        {
            _logger.LogInformation("Search results retrieved from cache");
            return cachedResults;
        }

        var results = await _unitOfWork.Hotels.SearchHotelsAsync(city, maxPrice, minRating);
        await _cache.SetAsync(cacheKey, results.ToList(), CacheExpiration);
        _logger.LogInformation("Search completed, {Count} hotels found and cached", results.Count());

        return results;
    }

    public async Task<Hotel> CreateHotelAsync(CreateHotelRequest request)
    {
        if (request.ManagerId.HasValue)
        {
            var managerExists = await _unitOfWork.Users.AnyAsync(u => u.Id == request.ManagerId.Value && u.Role == UserRole.HotelManager);
            
            if (!managerExists)
            {
                throw new InvalidOperationException($"Manager with ID {request.ManagerId} not found or is not a HotelManager.");
            }
        }

        var hotel = new Hotel
        {
            Name = request.Name.Trim(),
            Address = request.Address.Trim(),
            City = request.City.Trim(),
            PricePerNight = request.PricePerNight,
            AvailableRooms = request.AvailableRooms,
            Rating = request.Rating,
            ManagerId = request.ManagerId,
            ImageUrl = request.ImageUrl?.Trim(),
            Images = request.Images?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Hotels.AddAsync(hotel);
        await _unitOfWork.SaveChangesAsync();

        await InvalidateHotelCaches();

        _logger.LogInformation("Hotel created successfully with ID: {HotelId}", hotel.Id);

        return hotel;
    }

    public async Task UpdateHotelAsync(int id, UpdateHotelRequest request, int userId, string userRole)
    {
        var existingHotel = await _unitOfWork.Hotels.GetByIdAsync(id);
        
        if (existingHotel == null)
        {
            throw new KeyNotFoundException($"Hotel with ID {id} not found.");
        }

        if (userRole == "HotelManager" && existingHotel.ManagerId != userId)
        {
            throw new UnauthorizedAccessException("You can only update hotels you manage");
        }

        if (request.ManagerId.HasValue)
        {
            var managerExists = await _unitOfWork.Users.AnyAsync(u => u.Id == request.ManagerId.Value && u.Role == UserRole.HotelManager);
            
            if (!managerExists)
            {
                throw new InvalidOperationException($"Manager with ID {request.ManagerId} not found or is not a HotelManager.");
            }
        }

        existingHotel.Name = request.Name.Trim();
        existingHotel.Address = request.Address.Trim();
        existingHotel.City = request.City.Trim();
        existingHotel.PricePerNight = request.PricePerNight;
        existingHotel.AvailableRooms = request.AvailableRooms;
        existingHotel.ManagerId = request.ManagerId;
        existingHotel.ImageUrl = request.ImageUrl?.Trim();
        existingHotel.Images = request.Images?.Trim();

        _unitOfWork.Hotels.Update(existingHotel);
        await _unitOfWork.SaveChangesAsync();

        await InvalidateHotelCaches();
        await _cache.RemoveAsync($"{HOTEL_CACHE_KEY_PREFIX}{id}");

        _logger.LogInformation("Hotel {HotelId} updated successfully", id);
    }

    public async Task DeleteHotelAsync(int id, int userId, string userRole)
    {
        var hotel = await _unitOfWork.Hotels.GetHotelWithDetailsAsync(id);
        
        if (hotel == null)
        {
            throw new KeyNotFoundException($"Hotel with ID {id} not found.");
        }

        if (userRole == "HotelManager" && hotel.ManagerId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete hotels you manage");
        }

        var hasActiveBookings = await _unitOfWork.Bookings.AnyAsync(b => b.HotelId == id && b.Status == BookingStatus.Confirmed);

        if (hasActiveBookings)
        {
            throw new InvalidOperationException("Cannot delete hotel with active bookings. Please cancel all bookings first.");
        }

        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.HotelId == id);
        foreach (var review in reviews)
        {
            _unitOfWork.Reviews.Remove(review);
        }

        var bookings = await _unitOfWork.Bookings.FindAsync(b => b.HotelId == id && b.Status != BookingStatus.Confirmed);
        foreach (var booking in bookings)
        {
            _unitOfWork.Bookings.Remove(booking);
        }

        _unitOfWork.Hotels.Remove(hotel);
        await _unitOfWork.SaveChangesAsync();

        await InvalidateHotelCaches();
        await _cache.RemoveAsync($"{HOTEL_CACHE_KEY_PREFIX}{id}");

        _logger.LogInformation("Hotel {HotelId} deleted successfully", id);
    }

    private async Task InvalidateHotelCaches()
    {
        await _cache.RemoveAsync(HOTELS_CACHE_KEY);
        await _cache.RemoveByPatternAsync($"{SEARCH_CACHE_KEY_PREFIX}*");
        _logger.LogInformation("Hotel caches invalidated");
    }
}
