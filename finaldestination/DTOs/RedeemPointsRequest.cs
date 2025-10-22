using System.ComponentModel.DataAnnotations;

namespace FinalDestinationAPI.DTOs;

/// <summary>
/// Request DTO for redeeming loyalty points
/// </summary>
public class RedeemPointsRequest
{
    /// <summary>
    /// Number of points to redeem
    /// </summary>
    [Required(ErrorMessage = "Points to redeem is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Points must be greater than zero")]
    public int PointsToRedeem { get; set; }
}

/// <summary>
/// Response DTO for points redemption
/// </summary>
public class RedeemPointsResponse
{
    public int PointsRedeemed { get; set; }
    public decimal DiscountAmount { get; set; }
    public int RemainingBalance { get; set; }
    public string Message { get; set; } = string.Empty;
}
