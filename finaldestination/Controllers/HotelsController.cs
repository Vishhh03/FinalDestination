using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly IHotelService _hotelService;
    private readonly ILogger<HotelsController> _logger;

    public HotelsController(IHotelService hotelService, ILogger<HotelsController> logger)
    {
        _hotelService = hotelService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all hotels with caching (10-minute expiration)
    /// </summary>
    /// <returns>List of all hotels</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Hotel>>> GetHotels()
    {
        var hotels = await _hotelService.GetAllHotelsAsync();
        return Ok(hotels);
    }

    /// <summary>
    /// Gets a specific hotel by ID with caching
    /// </summary>
    /// <param name="id">Hotel ID</param>
    /// <returns>Hotel details</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<Hotel>> GetHotel(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Hotel ID must be a positive number.");
        }

        var hotel = await _hotelService.GetHotelByIdAsync(id);
        
        if (hotel == null)
        {
            return NotFound($"Hotel with ID {id} not found.");
        }

        return Ok(hotel);
    }

    /// <summary>
    /// Gets hotels managed by the current user (requires HotelManager or Admin role)
    /// </summary>
    /// <returns>List of hotels managed by the current user</returns>
    [HttpGet("my-hotels")]
    [Authorize(Roles = "HotelManager,Admin")]
    public async Task<ActionResult<IEnumerable<Hotel>>> GetMyHotels()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        var hotels = await _hotelService.GetMyHotelsAsync(userId);
        return Ok(hotels);
    }

    /// <summary>
    /// Searches hotels by city, maximum price, and/or minimum rating with caching
    /// </summary>
    /// <param name="city">City to search in (optional)</param>
    /// <param name="maxPrice">Maximum price per night (optional)</param>
    /// <param name="minRating">Minimum rating (optional, 1-5)</param>
    /// <returns>List of matching hotels</returns>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<Hotel>>> SearchHotels(
        [FromQuery] string? city = null, 
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] decimal? minRating = null)
    {
        if (maxPrice.HasValue && maxPrice.Value < 0)
        {
            return BadRequest("Maximum price cannot be negative.");
        }

        if (minRating.HasValue && (minRating.Value < 0 || minRating.Value > 5))
        {
            return BadRequest("Minimum rating must be between 0 and 5.");
        }

        var results = await _hotelService.SearchHotelsAsync(city, maxPrice, minRating);
        return Ok(results);
    }

    /// <summary>
    /// Creates a new hotel (requires HotelManager or Admin role)
    /// </summary>
    /// <param name="request">Hotel creation request</param>
    /// <returns>Created hotel</returns>
    [HttpPost]
    [Authorize(Roles = "HotelManager,Admin")]
    public async Task<ActionResult<Hotel>> CreateHotel([FromBody] CreateHotelRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var hotel = await _hotelService.CreateHotelAsync(request);
            return CreatedAtAction(nameof(GetHotel), new { id = hotel.Id }, hotel);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Updates an existing hotel (requires HotelManager or Admin role)
    /// </summary>
    /// <param name="id">Hotel ID</param>
    /// <param name="request">Hotel update request</param>
    /// <returns>No content on success</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = "HotelManager,Admin")]
    public async Task<IActionResult> UpdateHotel(int id, [FromBody] UpdateHotelRequest request)
    {
        if (id <= 0)
        {
            return BadRequest("Hotel ID must be a positive number.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        try
        {
            await _hotelService.UpdateHotelAsync(id, request, userId, userRole);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Deletes a hotel (requires Admin role or HotelManager who owns the hotel)
    /// </summary>
    /// <param name="id">Hotel ID</param>
    /// <returns>No content on success</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "HotelManager,Admin")]
    public async Task<IActionResult> DeleteHotel(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Hotel ID must be a positive number.");
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized("Invalid token");
        }

        try
        {
            await _hotelService.DeleteHotelAsync(id, userId, userRole);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting hotel {HotelId}", id);
            return StatusCode(500, "An error occurred while deleting the hotel. Please try again.");
        }
    }


}




