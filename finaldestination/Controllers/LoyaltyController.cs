using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using System.Security.Claims;

namespace FinalDestinationAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoyaltyController : ControllerBase
{
    private readonly ILoyaltyService _loyaltyService;
    private readonly ILogger<LoyaltyController> _logger;

    public LoyaltyController(ILoyaltyService loyaltyService, ILogger<LoyaltyController> logger)
    {
        _loyaltyService = loyaltyService;
        _logger = logger;
    }

    /// <summary>
    /// Get loyalty account for the current user
    /// </summary>
    [HttpGet("account")]
    public async Task<ActionResult<LoyaltyAccountResponse>> GetMyLoyaltyAccount()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token");
        }

        var loyaltyAccount = await _loyaltyService.GetLoyaltyAccountAsync(userId);
        if (loyaltyAccount == null)
        {
            // Auto-create loyalty account if it doesn't exist
            loyaltyAccount = await _loyaltyService.CreateLoyaltyAccountAsync(userId);
        }

        return Ok(loyaltyAccount);
    }

    /// <summary>
    /// Get loyalty account for a specific user (Admin only)
    /// </summary>
    [HttpGet("account/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LoyaltyAccountResponse>> GetLoyaltyAccount(int userId)
    {
        var loyaltyAccount = await _loyaltyService.GetLoyaltyAccountAsync(userId);
        if (loyaltyAccount == null)
        {
            return NotFound($"Loyalty account not found for user {userId}");
        }

        return Ok(loyaltyAccount);
    }

    /// <summary>
    /// Create loyalty account for a specific user (Admin only)
    /// </summary>
    [HttpPost("account")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LoyaltyAccountResponse>> CreateLoyaltyAccount([FromBody] CreateLoyaltyAccountRequest request)
    {
        try
        {
            var loyaltyAccount = await _loyaltyService.CreateLoyaltyAccountAsync(request.UserId);
            return CreatedAtAction(nameof(GetLoyaltyAccount), new { userId = request.UserId }, loyaltyAccount);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    /// <summary>
    /// Get points transaction history for the current user
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<List<PointsTransactionResponse>>> GetMyPointsHistory(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token");
        }

        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var history = await _loyaltyService.GetPointsHistoryAsync(userId, pageNumber, pageSize);
        return Ok(history);
    }

    /// <summary>
    /// Get points transaction history for a specific user (Admin only)
    /// </summary>
    [HttpGet("history/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<PointsTransactionResponse>>> GetPointsHistory(
        int userId,
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var history = await _loyaltyService.GetPointsHistoryAsync(userId, pageNumber, pageSize);
        return Ok(history);
    }

    /// <summary>
    /// Award points manually (Admin only)
    /// </summary>
    [HttpPost("award-points")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LoyaltyAccountResponse>> AwardPoints([FromBody] AwardPointsRequest request)
    {
        try
        {
            var loyaltyAccount = await _loyaltyService.AwardPointsAsync(request.UserId, request.BookingId, request.BookingAmount);
            return Ok(loyaltyAccount);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    /// <summary>
    /// Calculate points for a given booking amount
    /// </summary>
    [HttpGet("calculate-points")]
    public async Task<ActionResult<int>> CalculatePoints([FromQuery] decimal bookingAmount)
    {
        if (bookingAmount <= 0)
        {
            return BadRequest("Booking amount must be greater than 0");
        }

        var points = await _loyaltyService.CalculatePointsAsync(bookingAmount);
        return Ok(points);
    }

    /// <summary>
    /// Calculate discount amount for a given number of points
    /// </summary>
    [HttpGet("calculate-discount")]
    public async Task<ActionResult<decimal>> CalculateDiscount([FromQuery] int points)
    {
        if (points <= 0)
        {
            return BadRequest("Points must be greater than 0");
        }

        var discount = await _loyaltyService.CalculateDiscountFromPointsAsync(points);
        return Ok(discount);
    }

    /// <summary>
    /// Redeem loyalty points for discount (standalone redemption, not tied to booking)
    /// Note: For booking-specific redemption, use the PointsToRedeem field in CreateBookingRequest
    /// </summary>
    [HttpPost("redeem")]
    public async Task<ActionResult<RedeemPointsResponse>> RedeemPoints([FromBody] RedeemPointsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token");
        }

        try
        {
            var result = await _loyaltyService.RedeemPointsAsync(userId, request.PointsToRedeem);
            _logger.LogInformation("User {UserId} redeemed {Points} points for ${Discount:F2} discount",
                userId, result.PointsRedeemed, result.DiscountAmount);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}




