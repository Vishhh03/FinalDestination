namespace FinalDestinationAPI.DTOs;

/// <summary>
/// Response DTO for hotel room availability check
/// </summary>
public class AvailabilityResponse
{
    public bool IsAvailable { get; set; }
    public int AvailableRooms { get; set; }
    public int RequestedRooms { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public int Nights { get; set; }
}
