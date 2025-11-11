using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Controllers;

/// <summary>
/// Controller for user authentication operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IJwtService jwtService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _jwtService = jwtService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="request">User registration information</param>
    /// <returns>Authentication response with JWT token</returns>
    /// <response code="201">User registered successfully</response>
    /// <response code="400">Invalid registration data or email already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest($"Validation failed: {string.Join(", ", errors)}");
            }

            var response = await _authService.RegisterAsync(request);
            return CreatedAtAction(nameof(Register), new { id = response.User.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Registration failed for email: {Email}", request.Email);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration for email: {Email}", request.Email);
            return StatusCode(500, "An error occurred during registration");
        }
    }

    /// <summary>
    /// Login with email and password
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Authentication response with JWT token</returns>
    /// <response code="200">Login successful</response>
    /// <response code="400">Invalid login data</response>
    /// <response code="401">Invalid credentials or inactive account</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest($"Validation failed: {string.Join(", ", errors)}");
            }

            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Login failed for email: {Email}", request.Email);
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return StatusCode(500, "An error occurred during login");
        }
    }

    /// <summary>
    /// Get current user information (requires authentication)
    /// </summary>
    /// <returns>Current user information</returns>
    /// <response code="200">User information retrieved successfully</response>
    /// <response code="401">Not authenticated</response>
    /// <response code="404">User not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserInfo), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<UserInfo>> GetCurrentUser()
    {
        try
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Authorization token is required");
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var userId = _jwtService.GetUserIdFromToken(token);

            if (userId == null)
            {
                return Unauthorized("Invalid or expired token");
            }

            var userInfo = await _authService.GetCurrentUserAsync(userId.Value);
            return Ok(userInfo);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user information");
            return StatusCode(500, "An error occurred while retrieving user information");
        }
    }



    /// <summary>
    /// Apply to become a hotel manager (requires authentication as Guest)
    /// </summary>
    /// <param name="request">Hotel manager application details</param>
    /// <returns>Application confirmation</returns>
    /// <response code="201">Application submitted successfully</response>
    /// <response code="400">Invalid application data or user already has pending/approved application</response>
    /// <response code="401">Not authenticated</response>
    /// <response code="403">User is not a Guest or already a Hotel Manager</response>
    [HttpPost("apply-hotel-manager")]
    [ProducesResponseType(typeof(HotelManagerApplicationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<HotelManagerApplicationResponse>> ApplyForHotelManager([FromBody] HotelManagerApplicationRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest($"Validation failed: {string.Join(", ", errors)}");
            }

            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Authorization token is required");
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var userId = _jwtService.GetUserIdFromToken(token);

            if (userId == null)
            {
                return Unauthorized("Invalid or expired token");
            }

            var response = await _authService.ApplyForHotelManagerAsync(userId.Value, request);
            return CreatedAtAction(nameof(GetMyApplication), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during hotel manager application submission");
            return StatusCode(500, "An error occurred while processing your application");
        }
    }

    /// <summary>
    /// Get current user's hotel manager application status
    /// </summary>
    /// <returns>Application details if exists</returns>
    /// <response code="200">Application found</response>
    /// <response code="404">No application found</response>
    /// <response code="401">Not authenticated</response>
    [HttpGet("my-application")]
    [ProducesResponseType(typeof(HotelManagerApplicationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<HotelManagerApplicationResponse>> GetMyApplication()
    {
        try
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Authorization token is required");
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var userId = _jwtService.GetUserIdFromToken(token);

            if (userId == null)
            {
                return Unauthorized("Invalid or expired token");
            }

            var response = await _authService.GetMyApplicationAsync(userId.Value);
            
            if (response == null)
            {
                return NotFound("No application found");
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving hotel manager application");
            return StatusCode(500, "An error occurred while retrieving your application");
        }
    }

    /// <summary>
    /// Get all hotel manager applications (Admin only)
    /// </summary>
    /// <param name="status">Filter by status (optional)</param>
    /// <returns>List of applications</returns>
    /// <response code="200">Applications retrieved successfully</response>
    /// <response code="401">Not authenticated</response>
    /// <response code="403">Not authorized (Admin only)</response>
    [HttpGet("admin/applications")]
    [ProducesResponseType(typeof(IEnumerable<HotelManagerApplicationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<HotelManagerApplicationResponse>>> GetAllApplications([FromQuery] ApplicationStatus? status = null)
    {
        try
        {
            var response = await _authService.GetAllApplicationsAsync(status);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving hotel manager applications");
            return StatusCode(500, "An error occurred while retrieving applications");
        }
    }

    /// <summary>
    /// Process (approve/reject) a hotel manager application (Admin only)
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="request">Processing decision and notes</param>
    /// <returns>Updated application</returns>
    /// <response code="200">Application processed successfully</response>
    /// <response code="400">Invalid request or application already processed</response>
    /// <response code="401">Not authenticated</response>
    /// <response code="403">Not authorized (Admin only)</response>
    /// <response code="404">Application not found</response>
    [HttpPost("admin/applications/{id}/process")]
    [ProducesResponseType(typeof(HotelManagerApplicationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(string), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(string), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HotelManagerApplicationResponse>> ProcessApplication(int id, [FromBody] ProcessApplicationRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest($"Validation failed: {string.Join(", ", errors)}");
            }

            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Authorization token is required");
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var adminUserId = _jwtService.GetUserIdFromToken(token);

            if (adminUserId == null)
            {
                return Unauthorized("Invalid or expired token");
            }

            var response = await _authService.ProcessApplicationAsync(id, adminUserId.Value, request);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing hotel manager application {ApplicationId}", id);
            return StatusCode(500, "An error occurred while processing the application");
        }
    }
}




