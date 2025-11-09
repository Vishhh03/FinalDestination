using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly HotelContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(HotelContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all users (Admin only)
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
    {
        _logger.LogInformation("Admin retrieving all users");

        var users = await _context.Users
            .Select(u => new {
                u.Id,
                u.Name,
                u.Email,
                Role = u.Role.ToString(),
                u.ContactNumber,
                u.CreatedAt,
                u.IsActive
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Update user role (Admin only)
    /// </summary>
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        // Parse the role from string to enum
        if (!Enum.TryParse<UserRole>(request.Role, out var newRole))
        {
            return BadRequest(new { message = "Invalid role. Must be Guest, HotelManager, or Admin" });
        }

        user.Role = newRole;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Admin updated user {UserId} role to {Role}", id, newRole);

        return Ok(new { message = $"User role updated to {newRole}" });
    }
}

public class UpdateRoleRequest
{
    public string Role { get; set; } = string.Empty;
}
