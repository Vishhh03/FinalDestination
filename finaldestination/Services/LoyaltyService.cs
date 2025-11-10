using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Services;

public class LoyaltyService : ILoyaltyService
{
    private readonly HotelContext _context;
    private readonly ILogger<LoyaltyService> _logger;

    public LoyaltyService(HotelContext context, ILogger<LoyaltyService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<LoyaltyAccountResponse?> GetLoyaltyAccountAsync(int userId)
    {
        var loyaltyAccount = await _context.LoyaltyAccounts
            .Include(la => la.Transactions.OrderByDescending(t => t.CreatedAt).Take(10))
            .FirstOrDefaultAsync(la => la.UserId == userId);

        if (loyaltyAccount == null)
        {
            return null;
        }

        return new LoyaltyAccountResponse
        {
            Id = loyaltyAccount.Id,
            UserId = loyaltyAccount.UserId,
            PointsBalance = loyaltyAccount.PointsBalance,
            TotalPointsEarned = loyaltyAccount.TotalPointsEarned,
            LastUpdated = loyaltyAccount.LastUpdated,
            RecentTransactions = loyaltyAccount.Transactions.Select(t => new PointsTransactionResponse
            {
                Id = t.Id,
                PointsEarned = t.PointsEarned,
                Description = t.Description,
                CreatedAt = t.CreatedAt,
                BookingId = t.BookingId
            }).ToList()
        };
    }

    public async Task<LoyaltyAccountResponse> CreateLoyaltyAccountAsync(int userId)
    {
        // Check if user exists
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("User not found", nameof(userId));
        }

        // Check if loyalty account already exists
        var existingAccount = await _context.LoyaltyAccounts
            .FirstOrDefaultAsync(la => la.UserId == userId);
        
        if (existingAccount != null)
        {
            throw new InvalidOperationException("Loyalty account already exists for this user");
        }

        var loyaltyAccount = new LoyaltyAccount
        {
            UserId = userId,
            PointsBalance = 0,
            TotalPointsEarned = 0,
            LastUpdated = DateTime.UtcNow
        };

        _context.LoyaltyAccounts.Add(loyaltyAccount);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created loyalty account for user {UserId}", userId);

        return new LoyaltyAccountResponse
        {
            Id = loyaltyAccount.Id,
            UserId = loyaltyAccount.UserId,
            PointsBalance = loyaltyAccount.PointsBalance,
            TotalPointsEarned = loyaltyAccount.TotalPointsEarned,
            LastUpdated = loyaltyAccount.LastUpdated,
            RecentTransactions = new List<PointsTransactionResponse>()
        };
    }

    public async Task<LoyaltyAccountResponse> AwardPointsAsync(int userId, int bookingId, decimal bookingAmount)
    {
        // Get or create loyalty account
        var loyaltyAccount = await _context.LoyaltyAccounts
            .Include(la => la.Transactions)
            .FirstOrDefaultAsync(la => la.UserId == userId);

        if (loyaltyAccount == null)
        {
            // Create loyalty account if it doesn't exist
            await CreateLoyaltyAccountAsync(userId);
            loyaltyAccount = await _context.LoyaltyAccounts
                .Include(la => la.Transactions)
                .FirstOrDefaultAsync(la => la.UserId == userId);
        }

        // Calculate points (10% of booking amount, rounded)
        var pointsToAward = await CalculatePointsAsync(bookingAmount);

        // Check if points have already been awarded for this booking
        var existingTransaction = loyaltyAccount!.Transactions
            .FirstOrDefault(t => t.BookingId == bookingId);

        if (existingTransaction != null)
        {
            _logger.LogWarning("Points already awarded for booking {BookingId}", bookingId);
            return await GetLoyaltyAccountAsync(userId) ?? throw new InvalidOperationException("Failed to retrieve loyalty account");
        }

        // Create points transaction
        var transaction = new PointsTransaction
        {
            LoyaltyAccountId = loyaltyAccount.Id,
            BookingId = bookingId,
            PointsEarned = pointsToAward,
            Description = $"Points earned from booking #{bookingId}",
            CreatedAt = DateTime.UtcNow
        };

        // Update loyalty account
        loyaltyAccount.PointsBalance += pointsToAward;
        loyaltyAccount.TotalPointsEarned += pointsToAward;
        loyaltyAccount.LastUpdated = DateTime.UtcNow;

        _context.PointsTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Awarded {Points} points to user {UserId} for booking {BookingId}", 
            pointsToAward, userId, bookingId);

        return await GetLoyaltyAccountAsync(userId) ?? throw new InvalidOperationException("Failed to retrieve updated loyalty account");
    }

    public async Task<List<PointsTransactionResponse>> GetPointsHistoryAsync(int userId, int pageNumber = 1, int pageSize = 10)
    {
        var loyaltyAccount = await _context.LoyaltyAccounts
            .FirstOrDefaultAsync(la => la.UserId == userId);

        if (loyaltyAccount == null)
        {
            return new List<PointsTransactionResponse>();
        }

        var transactions = await _context.PointsTransactions
            .Where(t => t.LoyaltyAccountId == loyaltyAccount.Id)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new PointsTransactionResponse
            {
                Id = t.Id,
                PointsEarned = t.PointsEarned,
                Description = t.Description,
                CreatedAt = t.CreatedAt,
                BookingId = t.BookingId
            })
            .ToListAsync();

        return transactions;
    }

    public Task<int> CalculatePointsAsync(decimal bookingAmount)
    {
        // 10% of booking amount, rounded to nearest integer
        var points = (int)Math.Round(bookingAmount * 0.10m);
        return Task.FromResult(points);
    }

    public async Task<bool> HasLoyaltyAccountAsync(int userId)
    {
        return await _context.LoyaltyAccounts
            .AnyAsync(la => la.UserId == userId);
    }

    public async Task<RedeemPointsResponse> RedeemPointsAsync(int userId, int pointsToRedeem)
    {
        if (pointsToRedeem <= 0)
        {
            throw new ArgumentException("Points to redeem must be greater than zero", nameof(pointsToRedeem));
        }

        // Get loyalty account
        var loyaltyAccount = await _context.LoyaltyAccounts
            .FirstOrDefaultAsync(la => la.UserId == userId);

        if (loyaltyAccount == null)
        {
            throw new InvalidOperationException("Loyalty account not found. Please create an account first.");
        }

        // Check if user has sufficient points
        if (loyaltyAccount.PointsBalance < pointsToRedeem)
        {
            throw new InvalidOperationException(
                $"Insufficient points. Available: {loyaltyAccount.PointsBalance}, Required: {pointsToRedeem}");
        }

        // Calculate discount amount (1 point = $0.01)
        var discountAmount = await CalculateDiscountFromPointsAsync(pointsToRedeem);

        // Deduct points from balance
        loyaltyAccount.PointsBalance -= pointsToRedeem;
        loyaltyAccount.LastUpdated = DateTime.UtcNow;

        // Create redemption transaction (negative points)
        var transaction = new PointsTransaction
        {
            LoyaltyAccountId = loyaltyAccount.Id,
            BookingId = null, // Will be updated when booking is created
            PointsEarned = -pointsToRedeem,
            Description = $"Redeemed {pointsToRedeem} points for ₹{discountAmount:F2} discount",
            CreatedAt = DateTime.UtcNow
        };

        _context.PointsTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} redeemed {Points} points for ${Discount:F2} discount",
            userId, pointsToRedeem, discountAmount);

        return new RedeemPointsResponse
        {
            PointsRedeemed = pointsToRedeem,
            DiscountAmount = discountAmount,
            RemainingBalance = loyaltyAccount.PointsBalance,
            Message = $"Successfully redeemed {pointsToRedeem} points for ₹{discountAmount:F2} discount"
        };
    }

    public Task<decimal> CalculateDiscountFromPointsAsync(int points)
    {
        // Conversion rate: 1 point = ₹1
        // Direct 1:1 conversion
        var discount = points * 1.0m;
        return Task.FromResult(discount);
    }
}




