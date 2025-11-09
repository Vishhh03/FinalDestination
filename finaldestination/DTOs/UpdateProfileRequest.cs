using System.ComponentModel.DataAnnotations;

namespace FinalDestinationAPI.DTOs;

public class UpdateProfileRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20, ErrorMessage = "Contact number cannot exceed 20 characters")]
    public string? ContactNumber { get; set; }
}
