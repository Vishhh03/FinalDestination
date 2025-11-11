using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using System.Security.Claims;

namespace FinalDestinationAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(IBookingService bookingService, ILogger<BookingsController> logger)
    {
        _bookingService = bookingService;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> GetBookings()
    {
        var bookings = await _bookingService.GetAllBookingsAsync();
        return Ok(bookings);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponse>> GetBooking(int id)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized("Invalid token");
        }

        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

        try
        {
            var booking = await _bookingService.GetBookingByIdAsync(id, currentUserId.Value, userRole);
            
            if (booking == null)
            {
                return NotFound($"Booking with ID {id} not found.");
            }

            return Ok(booking);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> GetMyBookings()
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized("Invalid token");
        }

        var bookings = await _bookingService.GetMyBookingsAsync(currentUserId.Value);
        return Ok(bookings);
    }

    [HttpGet("guest/{email}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> GetBookingsByGuest(string email)
    {
        var bookings = await _bookingService.GetBookingsByEmailAsync(email);
        return Ok(bookings);
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> CreateBooking(CreateBookingRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized("Invalid token");
        }

        try
        {
            var response = await _bookingService.CreateBookingAsync(request, currentUserId.Value);
            return CreatedAtAction(nameof(GetBooking), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/payment")]
    public async Task<ActionResult<PaymentResult>> ProcessPayment(int id, PaymentRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized("Invalid token");
        }

        try
        {
            var result = await _bookingService.ProcessPaymentAsync(id, request, currentUserId.Value);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment for booking {BookingId}", id);
            return StatusCode(500, "An error occurred while processing the payment.");
        }
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<PaymentResult?>> CancelBooking(int id)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
        {
            return Unauthorized("Invalid token");
        }

        var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

        try
        {
            var refundResult = await _bookingService.CancelBookingAsync(id, currentUserId.Value, userRole);
            return Ok(refundResult);
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
            _logger.LogError(ex, "Error cancelling booking {BookingId}", id);
            return StatusCode(500, "An error occurred while cancelling the booking.");
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        try
        {
            await _bookingService.DeleteBookingAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
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




