using System.ComponentModel.DataAnnotations;

namespace FinalDestinationAPI.Attributes;

/// <summary>
/// Validates that a string is either a valid URL or a valid relative path
/// </summary>
public class UrlOrRelativePathAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            // Null or empty is valid (use [Required] if you want to enforce non-null)
            return ValidationResult.Success;
        }

        var urlString = value.ToString()!;

        // Check if it's a valid absolute URL
        if (Uri.TryCreate(urlString, UriKind.Absolute, out var absoluteUri))
        {
            // Valid absolute URL (http://, https://, etc.)
            return ValidationResult.Success;
        }

        // Check if it's a valid relative path
        if (Uri.TryCreate(urlString, UriKind.Relative, out var relativeUri))
        {
            // Valid relative path (e.g., /uploads/hotels/image.jpg)
            return ValidationResult.Success;
        }

        return new ValidationResult(ErrorMessage ?? "The field must be a valid URL or relative path.");
    }
}
