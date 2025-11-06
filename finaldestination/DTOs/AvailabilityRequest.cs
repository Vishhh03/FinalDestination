using System.ComponentModel.DataAnnotations;

namespace FinalDestinationAPI.DTOs;

/// <summary>
/// Request DTO for checking hotel room availability
/// </summary>
public class AvailabilityRequest
{
    [Required(ErrorMessage = "Check-in date is required")]
    public DateTime CheckInDate { get; set; }
    
    [Required(ErrorMessage = "Check-out date is required")]
    public DateTime CheckOutDate { get; set; }
    
    [Range(1, 10, ErrorMessage = "Number of guests must be between 1 and 10")]
    public int NumberOfGuests { get; set; } = 1;
}
