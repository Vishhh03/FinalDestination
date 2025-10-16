# Contributing to Smart Hotel Booking System

Thank you for your interest in contributing to the Smart Hotel Booking System! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Smart-Hotel-Booking-System.git
   cd Smart-Hotel-Booking-System
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/Smart-Hotel-Booking-System.git
   ```

4. **Install dependencies**:
   ```bash
   cd finaldestination
   dotnet restore
   ```

5. **Verify setup**:
   ```bash
   dotnet build
   dotnet run
   ```

### Development Environment

- .NET 8 SDK
- Visual Studio 2022 or VS Code
- SQL Server LocalDB
- Git

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

**Branch Naming Convention**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or updates

### 2. Make Your Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add comments where necessary
- Update documentation if needed

### 3. Test Your Changes

- Build the project: `dotnet build`
- Run the application: `dotnet run`
- Test affected endpoints
- Verify no regressions

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add hotel search by rating feature"
```

**Commit Message Format**:
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat: add loyalty points redemption feature

fix: resolve booking cancellation bug

docs: update API reference for new endpoints

refactor: improve hotel search performance
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the pull request

## Coding Standards

### C# Coding Conventions

Follow Microsoft's C# coding conventions:

#### Naming Conventions

```csharp
// PascalCase for classes, methods, properties
public class HotelService
{
    public string HotelName { get; set; }
    
    public async Task<Hotel> GetHotelAsync(int id)
    {
        // Implementation
    }
}

// camelCase for local variables and parameters
public void ProcessBooking(int bookingId)
{
    var booking = await _context.Bookings.FindAsync(bookingId);
    var totalAmount = CalculateTotal(booking);
}

// _camelCase for private fields
private readonly HotelContext _context;
private readonly ILogger<HotelService> _logger;

// UPPER_CASE for constants
private const int MAX_BOOKING_DAYS = 30;
```

#### Code Organization

```csharp
// 1. Using statements
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

// 2. Namespace
namespace FinalDestinationAPI.Services
{
    // 3. Class definition
    public class HotelService : IHotelService
    {
        // 4. Private fields
        private readonly HotelContext _context;
        private readonly ILogger<HotelService> _logger;
        
        // 5. Constructor
        public HotelService(HotelContext context, ILogger<HotelService> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        // 6. Public methods
        public async Task<List<Hotel>> GetAllHotelsAsync()
        {
            return await _context.Hotels.ToListAsync();
        }
        
        // 7. Private methods
        private decimal CalculateTotal(Booking booking)
        {
            // Implementation
        }
    }
}
```

#### Best Practices

1. **Use async/await** for I/O operations:
   ```csharp
   public async Task<Hotel> GetHotelAsync(int id)
   {
       return await _context.Hotels.FindAsync(id);
   }
   ```

2. **Use LINQ** for queries:
   ```csharp
   var hotels = await _context.Hotels
       .Where(h => h.City == city)
       .OrderBy(h => h.PricePerNight)
       .ToListAsync();
   ```

3. **Handle exceptions** appropriately:
   ```csharp
   try
   {
       await _context.SaveChangesAsync();
   }
   catch (DbUpdateException ex)
   {
       _logger.LogError(ex, "Error saving booking");
       throw;
   }
   ```

4. **Use dependency injection**:
   ```csharp
   public class BookingController : ControllerBase
   {
       private readonly IBookingService _bookingService;
       
       public BookingController(IBookingService bookingService)
       {
           _bookingService = bookingService;
       }
   }
   ```

5. **Add XML documentation**:
   ```csharp
   /// <summary>
   /// Retrieves a hotel by its unique identifier.
   /// </summary>
   /// <param name="id">The hotel ID</param>
   /// <returns>The hotel if found, null otherwise</returns>
   public async Task<Hotel> GetHotelAsync(int id)
   {
       return await _context.Hotels.FindAsync(id);
   }
   ```

### API Design Standards

1. **RESTful endpoints**:
   ```
   GET    /api/hotels          - Get all hotels
   GET    /api/hotels/{id}     - Get specific hotel
   POST   /api/hotels          - Create hotel
   PUT    /api/hotels/{id}     - Update hotel
   DELETE /api/hotels/{id}     - Delete hotel
   ```

2. **HTTP status codes**:
   - 200 OK - Successful GET
   - 201 Created - Successful POST
   - 204 No Content - Successful DELETE
   - 400 Bad Request - Validation error
   - 401 Unauthorized - Authentication required
   - 403 Forbidden - Insufficient permissions
   - 404 Not Found - Resource not found
   - 500 Internal Server Error - Server error

3. **Consistent response format**:
   ```csharp
   // Success response
   return Ok(new { data = hotels });
   
   // Error response
   return BadRequest(new ErrorResponse
   {
       Message = "Validation failed",
       Details = "Email already exists",
       Timestamp = DateTime.UtcNow
   });
   ```

## Testing Guidelines

### Manual Testing

1. **Test all affected endpoints** using Swagger UI
2. **Verify different user roles** (Admin, HotelManager, Guest)
3. **Test error scenarios** (invalid input, unauthorized access)
4. **Check database changes** are correct

### Future: Automated Testing

When adding tests:

1. **Unit Tests**:
   ```csharp
   [Fact]
   public async Task GetHotel_ReturnsHotel_WhenHotelExists()
   {
       // Arrange
       var hotelId = 1;
       
       // Act
       var result = await _hotelService.GetHotelAsync(hotelId);
       
       // Assert
       Assert.NotNull(result);
       Assert.Equal(hotelId, result.Id);
   }
   ```

2. **Integration Tests**:
   ```csharp
   [Fact]
   public async Task GetHotels_ReturnsOk_WithHotelList()
   {
       // Arrange
       var client = _factory.CreateClient();
       
       // Act
       var response = await client.GetAsync("/api/hotels");
       
       // Assert
       response.EnsureSuccessStatusCode();
   }
   ```

## Documentation

### Code Documentation

- Add XML comments to public methods
- Document complex logic with inline comments
- Update README if adding new features
- Update API documentation for new endpoints

### Documentation Files

When updating documentation:

1. **README.md** - Project overview
2. **API_REFERENCE.md** - API endpoints
3. **SETUP_GUIDE.md** - Setup instructions
4. **ARCHITECTURE.md** - System architecture
5. **Module docs** - Specific module documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep formatting consistent

## Pull Request Process

### Before Submitting

- [ ] Code builds without errors
- [ ] All tests pass (if applicable)
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How was this tested?

## Checklist
- [ ] Code builds successfully
- [ ] Documentation updated
- [ ] Follows coding standards
- [ ] No breaking changes

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Automated checks** run on PR
2. **Code review** by maintainers
3. **Feedback** addressed by contributor
4. **Approval** and merge by maintainer

### After Merge

- Delete your feature branch
- Pull latest changes from main
- Update your fork

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** for solutions
3. **Verify** it's not a configuration issue

### Issue Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 10
- .NET Version: 8.0.0
- Browser: Chrome 120

## Additional Context
Any other relevant information
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## Questions?

- Check the [documentation](README.md)
- Review [existing issues](https://github.com/OWNER/REPO/issues)
- Ask in discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing!** Your efforts help make this project better for everyone.

**Last Updated**: October 2025
