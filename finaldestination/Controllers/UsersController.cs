using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.DTOs;
using System.Security.Claims;

namespace FinalDestinationAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly HotelContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(HotelContext context, ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // PUT: api/users/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized("Invalid token");
        }

        var user = await _context.Users.FindAsync(currentUserId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Update user information
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            user.Name = request.Name.Trim();
        }

        user.ContactNumber = string.IsNullOrWhiteSpace(request.ContactNumber) 
            ? null 
            : request.ContactNumber.Trim();

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {UserId} updated their profile", currentUserId);

        return Ok(new { message = "Profile updated successfully" });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }
}
