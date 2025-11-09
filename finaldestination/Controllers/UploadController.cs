using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinalDestinationAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "HotelManager,Admin")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadController> _logger;
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Upload a hotel image
    /// </summary>
    [HttpPost("hotel-image")]
    public async Task<ActionResult<UploadResponse>> UploadHotelImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        // Validate file size
        if (file.Length > MaxFileSize)
        {
            return BadRequest(new { message = $"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB" });
        }

        // Validate file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = $"Invalid file type. Allowed types: {string.Join(", ", AllowedExtensions)}" });
        }

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "hotels");
            Directory.CreateDirectory(uploadsPath);

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Generate URL
            var imageUrl = $"/uploads/hotels/{fileName}";

            _logger.LogInformation("Image uploaded successfully: {FileName}", fileName);

            return Ok(new UploadResponse
            {
                Success = true,
                ImageUrl = imageUrl,
                FileName = fileName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image");
            return StatusCode(500, new { message = "An error occurred while uploading the image" });
        }
    }

    /// <summary>
    /// Delete a hotel image
    /// </summary>
    [HttpDelete("hotel-image")]
    public IActionResult DeleteHotelImage([FromQuery] string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
        {
            return BadRequest(new { message = "File name is required" });
        }

        try
        {
            // Security: Ensure filename doesn't contain path traversal
            if (fileName.Contains("..") || fileName.Contains("/") || fileName.Contains("\\"))
            {
                return BadRequest(new { message = "Invalid file name" });
            }

            var filePath = Path.Combine(_environment.WebRootPath, "uploads", "hotels", fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "File not found" });
            }

            System.IO.File.Delete(filePath);

            _logger.LogInformation("Image deleted successfully: {FileName}", fileName);

            return Ok(new { message = "Image deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image: {FileName}", fileName);
            return StatusCode(500, new { message = "An error occurred while deleting the image" });
        }
    }
}

public class UploadResponse
{
    public bool Success { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
