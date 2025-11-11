using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.Models;
using FinalDestinationAPI.Repositories;

namespace FinalDestinationAPI.Services;

public class ReviewService : IReviewService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICacheService _cache;
    private readonly ILogger<ReviewService> _logger;

    public ReviewService(IUnitOfWork unitOfWork, ICacheService cache, ILogger<ReviewService> logger)
    {
        _unitOfWork = unitOfWork;
        _cache = cache;
        _logger = logger;
    }

    public async Task<ReviewResponse> CreateReviewAsync(int userId, ReviewRequest request)
    {
        // Check if hotel exists
        var hotel = await _unitOfWork.Hotels.GetByIdAsync(request.HotelId);
        if (hotel == null)
        {
            throw new ArgumentException("Hotel not found");
        }

        // Check if user has a paid booking for this hotel
        var bookings = await _unitOfWork.Bookings.FindAsync(b => b.UserId == userId 
                        && b.HotelId == request.HotelId 
                        && b.Status == BookingStatus.Confirmed);
        var hasPaidBooking = false;
        foreach (var booking in bookings)
        {
            if (await _unitOfWork.Payments.AnyAsync(p => p.BookingId == booking.Id && p.Status == PaymentStatus.Completed))
            {
                hasPaidBooking = true;
                break;
            }
        }

        if (!hasPaidBooking)
        {
            throw new InvalidOperationException("You can only review hotels where you have completed a paid booking");
        }

        // Check if user already reviewed this hotel
        var existingReview = await _unitOfWork.Reviews.FirstOrDefaultAsync(r => r.UserId == userId && r.HotelId == request.HotelId);
        
        if (existingReview != null)
        {
            throw new InvalidOperationException("You have already reviewed this hotel");
        }

        var review = new Review
        {
            UserId = userId,
            HotelId = request.HotelId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Reviews.AddAsync(review);
        await _unitOfWork.SaveChangesAsync();

        // Update hotel rating
        await UpdateHotelRatingAsync(request.HotelId);

        // Clear cache for hotel reviews and hotel data
        await _cache.RemoveAsync($"hotel_reviews_{request.HotelId}");
        await _cache.RemoveAsync($"hotel_rating_{request.HotelId}");
        await _cache.RemoveAsync($"hotel:{request.HotelId}");
        await _cache.RemoveAsync("hotels:all");
        await _cache.RemoveByPatternAsync("hotels:search:*");

        _logger.LogInformation("Review created for hotel {HotelId} by user {UserId}", request.HotelId, userId);

        return await GetReviewResponseAsync(review.Id);
    }

    public async Task<ReviewResponse?> GetReviewAsync(int id)
    {
        return await GetReviewResponseAsync(id);
    }

    public async Task<IEnumerable<ReviewResponse>> GetReviewsByHotelAsync(int hotelId, int page = 1, int pageSize = 10)
    {
        var cacheKey = $"hotel_reviews_{hotelId}_page_{page}_size_{pageSize}";
        var cachedReviews = await _cache.GetAsync<IEnumerable<ReviewResponse>>(cacheKey);
        
        if (cachedReviews != null)
        {
            return cachedReviews;
        }

        var reviews = (await _unitOfWork.Reviews.GetReviewsByHotelAsync(hotelId))
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewResponse
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User.Name,
                HotelId = r.HotelId,
                HotelName = r.Hotel.Name,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToList();

        await _cache.SetAsync(cacheKey, reviews, TimeSpan.FromMinutes(10));
        return reviews;
    }

    public async Task<IEnumerable<ReviewResponse>> GetReviewsByUserAsync(int userId)
    {
        var reviews = (await _unitOfWork.Reviews.GetReviewsByUserAsync(userId))
            .Select(r => new ReviewResponse
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User.Name,
                HotelId = r.HotelId,
                HotelName = r.Hotel.Name,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToList();

        return reviews;
    }

    public async Task<ReviewResponse?> UpdateReviewAsync(int id, int userId, UpdateReviewRequest request)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id);
        if (review == null)
        {
            return null;
        }

        // Check if the review belongs to the user
        if (review.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only update your own reviews");
        }

        review.Rating = request.Rating;
        review.Comment = request.Comment;

        _unitOfWork.Reviews.Update(review);
        await _unitOfWork.SaveChangesAsync();

        // Update hotel rating
        await UpdateHotelRatingAsync(review.HotelId);

        // Clear cache for hotel reviews and hotel data
        await _cache.RemoveAsync($"hotel_reviews_{review.HotelId}");
        await _cache.RemoveAsync($"hotel_rating_{review.HotelId}");
        await _cache.RemoveAsync($"hotel:{review.HotelId}");
        await _cache.RemoveAsync("hotels:all");
        await _cache.RemoveByPatternAsync("hotels:search:*");

        _logger.LogInformation("Review {ReviewId} updated by user {UserId}", id, userId);

        return await GetReviewResponseAsync(id);
    }

    public async Task<bool> DeleteReviewAsync(int id, int userId, bool isAdmin = false)
    {
        var review = await _unitOfWork.Reviews.GetByIdAsync(id);
        if (review == null)
        {
            return false;
        }

        // Check if the review belongs to the user (admins can delete any review)
        if (!isAdmin && review.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only delete your own reviews");
        }

        var hotelId = review.HotelId;
        _unitOfWork.Reviews.Remove(review);
        await _unitOfWork.SaveChangesAsync();

        // Update hotel rating
        await UpdateHotelRatingAsync(hotelId);

        // Clear cache for hotel reviews and hotel data
        await _cache.RemoveAsync($"hotel_reviews_{hotelId}");
        await _cache.RemoveAsync($"hotel_rating_{hotelId}");
        await _cache.RemoveAsync($"hotel:{hotelId}");
        await _cache.RemoveAsync("hotels:all");
        await _cache.RemoveByPatternAsync("hotels:search:*");

        _logger.LogInformation("Review {ReviewId} deleted by user {UserId}", id, userId);

        return true;
    }

    public async Task<decimal> CalculateHotelRatingAsync(int hotelId)
    {
        var cacheKey = $"hotel_rating_{hotelId}";
        var cachedRating = await _cache.GetAsync<string>(cacheKey);
        
        if (cachedRating != null && decimal.TryParse(cachedRating, out var rating))
        {
            return rating;
        }

        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.HotelId == hotelId);

        if (!reviews.Any())
        {
            return 0;
        }

        var averageRating = Math.Round((decimal)reviews.Average(r => r.Rating), 2);
        
        await _cache.SetAsync(cacheKey, averageRating.ToString(), TimeSpan.FromMinutes(30));
        return averageRating;
    }

    public async Task<int> GetReviewCountByHotelAsync(int hotelId)
    {
        var reviews = await _unitOfWork.Reviews.FindAsync(r => r.HotelId == hotelId);
        return reviews.Count();
    }

    private async Task<ReviewResponse> GetReviewResponseAsync(int reviewId)
    {
        var review = await _unitOfWork.Reviews.GetReviewWithDetailsAsync(reviewId);

        if (review == null)
        {
            throw new ArgumentException("Review not found");
        }

        return new ReviewResponse
        {
            Id = review.Id,
            UserId = review.UserId,
            UserName = review.User.Name,
            HotelId = review.HotelId,
            HotelName = review.Hotel.Name,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    private async Task UpdateHotelRatingAsync(int hotelId)
    {
        var newRating = await CalculateHotelRatingAsync(hotelId);
        var reviewCount = await GetReviewCountByHotelAsync(hotelId);
        var hotel = await _unitOfWork.Hotels.GetByIdAsync(hotelId);
        
        if (hotel != null)
        {
            hotel.Rating = newRating;
            hotel.ReviewCount = reviewCount;
            _unitOfWork.Hotels.Update(hotel);
            await _unitOfWork.SaveChangesAsync();
            
            _logger.LogInformation("Updated hotel {HotelId} rating to {Rating} with {ReviewCount} reviews", 
                hotelId, newRating, reviewCount);
        }
    }
}




