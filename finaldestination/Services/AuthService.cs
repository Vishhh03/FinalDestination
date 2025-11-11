using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.Models;
using FinalDestinationAPI.Repositories;

namespace FinalDestinationAPI.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly ILoyaltyService _loyaltyService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService, ILoyaltyService loyaltyService, ILogger<AuthService> logger)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _loyaltyService = loyaltyService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _unitOfWork.Users.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException("A user with this email already exists");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = passwordHash,
            Role = UserRole.Guest,
            ContactNumber = request.ContactNumber?.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var loyaltyAccount = new LoyaltyAccount
        {
            UserId = user.Id,
            PointsBalance = 0,
            TotalPointsEarned = 0,
            LastUpdated = DateTime.UtcNow
        };

        await _unitOfWork.LoyaltyAccounts.AddAsync(loyaltyAccount);
        await _unitOfWork.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(24);

        user.LastLoginAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        var userInfo = await CreateUserInfoAsync(user);
        
        _logger.LogInformation("User registered successfully: {Email}", user.Email);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = userInfo
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is inactive. Please contact support.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        var token = _jwtService.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(24);

        user.LastLoginAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        var userInfo = await CreateUserInfoAsync(user);
        
        _logger.LogInformation("User logged in successfully: {Email}", user.Email);

        return new AuthResponse
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = userInfo
        };
    }

    public async Task<UserInfo> GetCurrentUserAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Account is inactive");
        }

        return await CreateUserInfoAsync(user);
    }

    public async Task<HotelManagerApplicationResponse> ApplyForHotelManagerAsync(int userId, HotelManagerApplicationRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (user.Role != UserRole.Guest)
        {
            throw new InvalidOperationException($"Only Guest users can apply for Hotel Manager role. You are already a {user.Role}");
        }

        var existingApplication = await _unitOfWork.HotelManagerApplications.GetPendingOrApprovedApplicationByUserAsync(userId);

        if (existingApplication != null)
        {
            if (existingApplication.Status == ApplicationStatus.Approved)
            {
                throw new InvalidOperationException("You already have an approved application. Your role will be updated shortly.");
            }
            throw new InvalidOperationException("You already have a pending application. Please wait for it to be processed.");
        }

        var application = new HotelManagerApplication
        {
            UserId = userId,
            BusinessName = request.BusinessName.Trim(),
            BusinessAddress = request.BusinessAddress.Trim(),
            BusinessLicense = request.BusinessLicense.Trim(),
            ContactPerson = request.ContactPerson.Trim(),
            BusinessPhone = request.BusinessPhone.Trim(),
            BusinessEmail = request.BusinessEmail.ToLower().Trim(),
            AdditionalInfo = request.AdditionalInfo?.Trim(),
            ApplicationDate = DateTime.UtcNow,
            Status = ApplicationStatus.Pending
        };

        await _unitOfWork.HotelManagerApplications.AddAsync(application);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Hotel manager application submitted by user {UserId}", userId);

        return new HotelManagerApplicationResponse
        {
            Id = application.Id,
            UserId = application.UserId,
            UserName = user.Name,
            UserEmail = user.Email,
            BusinessName = application.BusinessName,
            BusinessAddress = application.BusinessAddress,
            BusinessLicense = application.BusinessLicense,
            ContactPerson = application.ContactPerson,
            BusinessPhone = application.BusinessPhone,
            BusinessEmail = application.BusinessEmail,
            AdditionalInfo = application.AdditionalInfo,
            ApplicationDate = application.ApplicationDate,
            Status = application.Status,
            StatusText = application.Status.ToString()
        };
    }

    public async Task<HotelManagerApplicationResponse?> GetMyApplicationAsync(int userId)
    {
        var application = await _unitOfWork.HotelManagerApplications.GetLatestApplicationByUserAsync(userId);

        if (application == null)
        {
            return null;
        }

        return new HotelManagerApplicationResponse
        {
            Id = application.Id,
            UserId = application.UserId,
            UserName = application.User.Name,
            UserEmail = application.User.Email,
            BusinessName = application.BusinessName,
            BusinessAddress = application.BusinessAddress,
            BusinessLicense = application.BusinessLicense,
            ContactPerson = application.ContactPerson,
            BusinessPhone = application.BusinessPhone,
            BusinessEmail = application.BusinessEmail,
            AdditionalInfo = application.AdditionalInfo,
            ApplicationDate = application.ApplicationDate,
            Status = application.Status,
            StatusText = application.Status.ToString(),
            ProcessedDate = application.ProcessedDate,
            ProcessedByName = application.ProcessedByUser?.Name,
            AdminNotes = application.AdminNotes
        };
    }

    public async Task<IEnumerable<HotelManagerApplicationResponse>> GetAllApplicationsAsync(ApplicationStatus? status = null)
    {
        var applications = await _unitOfWork.HotelManagerApplications.GetApplicationsWithDetailsAsync(status);

        return applications.Select(a => new HotelManagerApplicationResponse
        {
            Id = a.Id,
            UserId = a.UserId,
            UserName = a.User.Name,
            UserEmail = a.User.Email,
            BusinessName = a.BusinessName,
            BusinessAddress = a.BusinessAddress,
            BusinessLicense = a.BusinessLicense,
            ContactPerson = a.ContactPerson,
            BusinessPhone = a.BusinessPhone,
            BusinessEmail = a.BusinessEmail,
            AdditionalInfo = a.AdditionalInfo,
            ApplicationDate = a.ApplicationDate,
            Status = a.Status,
            StatusText = a.Status.ToString(),
            ProcessedDate = a.ProcessedDate,
            ProcessedByName = a.ProcessedByUser?.Name,
            AdminNotes = a.AdminNotes
        });
    }

    public async Task<HotelManagerApplicationResponse> ProcessApplicationAsync(int applicationId, int adminUserId, ProcessApplicationRequest request)
    {
        var application = await _unitOfWork.HotelManagerApplications.GetApplicationWithDetailsAsync(applicationId);

        if (application == null)
        {
            throw new KeyNotFoundException($"Application with ID {applicationId} not found");
        }

        if (application.Status != ApplicationStatus.Pending && application.Status != ApplicationStatus.RequiresMoreInfo)
        {
            throw new InvalidOperationException($"Application has already been {application.Status}");
        }

        if (request.Status != ApplicationStatus.Approved && 
            request.Status != ApplicationStatus.Rejected && 
            request.Status != ApplicationStatus.RequiresMoreInfo)
        {
            throw new InvalidOperationException("Status must be Approved, Rejected, or RequiresMoreInfo");
        }

        application.Status = request.Status;
        application.ProcessedDate = DateTime.UtcNow;
        application.ProcessedBy = adminUserId;
        application.AdminNotes = request.AdminNotes?.Trim();

        if (request.Status == ApplicationStatus.Approved)
        {
            application.User.Role = UserRole.HotelManager;
            _logger.LogInformation("User {UserId} upgraded to Hotel Manager by admin {AdminId}", 
                application.UserId, adminUserId);
        }

        await _unitOfWork.SaveChangesAsync();

        var adminUser = await _unitOfWork.Users.GetByIdAsync(adminUserId);

        _logger.LogInformation("Application {ApplicationId} processed as {Status} by admin {AdminId}", 
            applicationId, request.Status, adminUserId);

        return new HotelManagerApplicationResponse
        {
            Id = application.Id,
            UserId = application.UserId,
            UserName = application.User.Name,
            UserEmail = application.User.Email,
            BusinessName = application.BusinessName,
            BusinessAddress = application.BusinessAddress,
            BusinessLicense = application.BusinessLicense,
            ContactPerson = application.ContactPerson,
            BusinessPhone = application.BusinessPhone,
            BusinessEmail = application.BusinessEmail,
            AdditionalInfo = application.AdditionalInfo,
            ApplicationDate = application.ApplicationDate,
            Status = application.Status,
            StatusText = application.Status.ToString(),
            ProcessedDate = application.ProcessedDate,
            ProcessedByName = adminUser?.Name,
            AdminNotes = application.AdminNotes
        };
    }

    private async Task<UserInfo> CreateUserInfoAsync(User user)
    {
        var userInfo = new UserInfo
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            ContactNumber = user.ContactNumber,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            IsActive = user.IsActive
        };

        try
        {
            var loyaltyAccount = await _loyaltyService.GetLoyaltyAccountAsync(user.Id);
            if (loyaltyAccount != null)
            {
                userInfo.LoyaltyAccount = new LoyaltyInfo
                {
                    PointsBalance = loyaltyAccount.PointsBalance,
                    TotalPointsEarned = loyaltyAccount.TotalPointsEarned,
                    LastUpdated = loyaltyAccount.LastUpdated
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve loyalty account for user {UserId}", user.Id);
        }

        return userInfo;
    }
}
