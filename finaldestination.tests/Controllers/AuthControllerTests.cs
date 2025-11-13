using NUnit.Framework;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using FinalDestinationAPI.Controllers;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Interfaces;
using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Models;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace finaldestination.tests.Controllers
{

    [TestFixture]
    public class AuthControllerTests
    {
        private HotelContext _context;
        private Mock<IJwtService> _mockJwtService;
        private Mock<ILoyaltyService> _mockLoyaltyService;
        private Mock<ILogger<AuthController>> _mockLogger;
        private AuthController _controller;

        // ----- Test Users -----
        private User _guestUser;
        private User _adminUser;
        private string _guestUserPassword = "GuestUser123!";
        private string _guestUserHash;
        private string _fakeToken = "fake.jwt.token";

        [SetUp]
        public void Setup()
        {
            // 1. Set up the In-Memory Database
            var options = new DbContextOptionsBuilder<HotelContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new HotelContext(options);

            // 2. Set up Mocks
            _mockJwtService = new Mock<IJwtService>();
            _mockLoyaltyService = new Mock<ILoyaltyService>();
            _mockLogger = new Mock<ILogger<AuthController>>();

            // 3. Initialize Controller
            _controller = new AuthController(
                _context,
                _mockJwtService.Object,
                _mockLoyaltyService.Object,
                _mockLogger.Object
            );

            // 4. Add a fake HttpContext to simulate headers
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // 5. Seed common test data
            _guestUserHash = BCrypt.Net.BCrypt.HashPassword(_guestUserPassword);
            _guestUser = new User
            {
                Id = 1,
                Name = "Test Guest",
                Email = "guest@test.com",
                Role = UserRole.Guest,
                PasswordHash = _guestUserHash,
                IsActive = true
            };
            _adminUser = new User
            {
                Id = 2,
                Name = "Test Admin",
                Email = "admin@test.com",
                Role = UserRole.Admin,
                PasswordHash = "admin_hash",
                IsActive = true
            };

            _context.Users.AddRange(_guestUser, _adminUser);
            _context.SaveChanges();
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // --- Helper Methods ---
        private void MockUserInToken(User user)
        {
            // Simulate adding "Authorization: Bearer ..." to the request
            _controller.Request.Headers["Authorization"] = $"Bearer {_fakeToken}";

            // Mock the JWT service to return the user's ID
            _mockJwtService.Setup(s => s.GetUserIdFromToken(_fakeToken))
                           .Returns(user.Id);
        }

        private void MockLoyaltyAccount(User user)
        {
            var loyaltyResponse = new LoyaltyAccountResponse
            {
                Id = 1,
                UserId = user.Id,
                PointsBalance = 100,
                TotalPointsEarned = 100
            };
            _mockLoyaltyService.Setup(s => s.GetLoyaltyAccountAsync(user.Id))
                               .ReturnsAsync(loyaltyResponse);
        }

        // --- Register Tests ---

        [Test]
        public async Task Register_WithValidData_ReturnsCreatedAndAuthResponse()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Name = "New User",
                Email = "new@test.com",
                Password = "NewUser123!",
                ConfirmPassword = "NewUser123!"
            };

            _mockJwtService.Setup(s => s.GenerateToken(It.IsAny<User>()))
                           .Returns(_fakeToken);

            _mockLoyaltyService.Setup(s => s.GetLoyaltyAccountAsync(It.IsAny<int>()))
                               .ReturnsAsync(new LoyaltyAccountResponse { PointsBalance = 0 });

            // Act
            var result = await _controller.Register(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<CreatedAtActionResult>());

            // Check that user and loyalty account were created in the DB
            var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            var loyaltyInDb = await _context.LoyaltyAccounts.FirstOrDefaultAsync(l => l.UserId == userInDb.Id);

            Assert.That(userInDb, Is.Not.Null);
            Assert.That(loyaltyInDb, Is.Not.Null);
            Assert.That(userInDb.Role, Is.EqualTo(UserRole.Guest));
        }

        [Test]
        public async Task Register_WhenEmailExists_ReturnsBadRequest()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Name = "Another User",
                Email = _guestUser.Email, // Email already exists from setup
                Password = "NewUser123!",
                ConfirmPassword = "NewUser123!"
            };

            // Act
            var result = await _controller.Register(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result.Result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value.ToString(), Contains.Substring("email already exists"));
        }

        [Test]
        public async Task Register_WhenModelStateIsInvalid_ReturnsBadRequest()
        {
            // Arrange
            _controller.ModelState.AddModelError("Password", "Password is required");
            var request = new RegisterRequest(); // Invalid request

            // Act
            var result = await _controller.Register(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That((result.Result as BadRequestObjectResult).Value.ToString(), Contains.Substring("Validation failed"));
        }

        // --- Login Tests ---

        [Test]
        public async Task Login_WithValidCredentials_ReturnsOkAndAuthResponse()
        {
            // Arrange
            var request = new LoginRequest { Email = _guestUser.Email, Password = _guestUserPassword };

            _mockJwtService.Setup(s => s.GenerateToken(_guestUser)).Returns(_fakeToken);
            MockLoyaltyAccount(_guestUser);

            // Act
            var result = await _controller.Login(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
            var okResult = result.Result as OkObjectResult;
            var authResponse = okResult.Value as AuthResponse;

            Assert.That(authResponse, Is.Not.Null);
            Assert.That(authResponse.Token, Is.EqualTo(_fakeToken));
            Assert.That(authResponse.User.Email, Is.EqualTo(_guestUser.Email));

            // Check LastLoginAt was updated
            var userInDb = await _context.Users.FindAsync(_guestUser.Id);
            Assert.That(userInDb.LastLoginAt, Is.Not.Null);
        }

        [Test]
        public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
        {
            // Arrange
            var request = new LoginRequest { Email = _guestUser.Email, Password = "wrong_password" };

            // Act
            var result = await _controller.Login(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<UnauthorizedObjectResult>());
        }

        [Test]
        public async Task Login_WithNonExistentUser_ReturnsUnauthorized()
        {
            // Arrange
            var request = new LoginRequest { Email = "not@exists.com", Password = "password" };

            // Act
            var result = await _controller.Login(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<UnauthorizedObjectResult>());
        }

        [Test]
        public async Task Login_WithInactiveUser_ReturnsUnauthorized()
        {
            // Arrange
            _guestUser.IsActive = false; // Make user inactive
            _context.SaveChanges();

            var request = new LoginRequest { Email = _guestUser.Email, Password = _guestUserPassword };

            // Act
            var result = await _controller.Login(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<UnauthorizedObjectResult>());
            Assert.That((result.Result as UnauthorizedObjectResult).Value.ToString(), Contains.Substring("Account is inactive"));
        }

        // --- GetCurrentUser Tests ---

        [Test]
        public async Task GetCurrentUser_WithValidToken_ReturnsOkAndUserInfo()
        {
            // Arrange
            MockUserInToken(_guestUser);
            MockLoyaltyAccount(_guestUser);

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
            var okResult = result.Result as OkObjectResult;
            var userInfo = okResult.Value as UserInfo;

            Assert.That(userInfo, Is.Not.Null);
            Assert.That(userInfo.Id, Is.EqualTo(_guestUser.Id));
            Assert.That(userInfo.LoyaltyAccount, Is.Not.Null);
            Assert.That(userInfo.LoyaltyAccount.PointsBalance, Is.EqualTo(100));
        }

        [Test]
        public async Task GetCurrentUser_WithNoToken_ReturnsUnauthorized()
        {
            // Arrange (No "Authorization" header is set)

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            Assert.That(result.Result, Is.InstanceOf<UnauthorizedObjectResult>());
        }

        // --- ApplyForHotelManager Tests ---

        [Test]
        public async Task ApplyForHotelManager_WithValidGuestUser_ReturnsCreated()
        {
            // Arrange
            MockUserInToken(_guestUser); // The user applying is the guest
            var request = new HotelManagerApplicationRequest
            {
                BusinessName = "Test Hotel",
                BusinessAddress = "123 Test St",
                BusinessLicense = "LIC123",
                ContactPerson = "Test Guest",
                BusinessPhone = "1234567890",
                BusinessEmail = "biz@test.com"
            };

            // Act
            var result = await _controller.ApplyForHotelManager(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<CreatedAtActionResult>());

            // Check that the application was created in the DB
            var appInDb = await _context.HotelManagerApplications
                .FirstOrDefaultAsync(a => a.UserId == _guestUser.Id);

            Assert.That(appInDb, Is.Not.Null);
            Assert.That(appInDb.BusinessName, Is.EqualTo(request.BusinessName));
            Assert.That(appInDb.Status, Is.EqualTo(ApplicationStatus.Pending));
        }

        [Test]
        public async Task ApplyForHotelManager_WithNonGuestUser_ReturnsBadRequest()
        {
            // Arrange
            MockUserInToken(_adminUser); // The user applying is an Admin
            var request = new HotelManagerApplicationRequest();

            // Act
            var result = await _controller.ApplyForHotelManager(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That((result.Result as BadRequestObjectResult).Value.ToString(), Contains.Substring("Only Guest users can apply"));
        }

        [Test]
        public async Task ApplyForHotelManager_WithPendingApplication_ReturnsBadRequest()
        {
            // Arrange
            // Seed a pending application for the guest user
            _context.HotelManagerApplications.Add(new HotelManagerApplication
            {
                UserId = _guestUser.Id,
                Status = ApplicationStatus.Pending,
                BusinessName = "Old App" // Add required fields
            });
            _context.SaveChanges();

            MockUserInToken(_guestUser);
            var request = new HotelManagerApplicationRequest { BusinessName = "New App" };

            // Act
            var result = await _controller.ApplyForHotelManager(request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That((result.Result as BadRequestObjectResult).Value.ToString(), Contains.Substring("You already have a pending application"));
        }

        // --- ProcessApplication Tests (Admin) ---

        [Test]
        public async Task ProcessApplication_AsAdminToApprove_ReturnsOkAndUpdatesUserRole()
        {
            // Arrange
            MockUserInToken(_adminUser); // The admin is processing

            // Seed a pending application for the guest user
            var application = new HotelManagerApplication
            {
                Id = 10,
                UserId = _guestUser.Id,
                User = _guestUser,
                Status = ApplicationStatus.Pending,
                BusinessName = "Hotel To Approve"
            };
            _context.HotelManagerApplications.Add(application);
            _context.SaveChanges();

            var request = new ProcessApplicationRequest
            {
                Status = ApplicationStatus.Approved,
                AdminNotes = "Looks good. Approved."
            };

            // Act
            var result = await _controller.ProcessApplication(application.Id, request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());

            // Check that the guest user's role was updated
            var applicantInDb = await _context.Users.FindAsync(_guestUser.Id);
            Assert.That(applicantInDb.Role, Is.EqualTo(UserRole.HotelManager));

            // Check that the application status was updated
            var appInDb = await _context.HotelManagerApplications.FindAsync(application.Id);
            Assert.That(appInDb.Status, Is.EqualTo(ApplicationStatus.Approved));
            Assert.That(appInDb.ProcessedBy, Is.EqualTo(_adminUser.Id));
        }

        [Test]
        public async Task ProcessApplication_AsNonAdmin_ReturnsForbid()
        {
            // Arrange
            MockUserInToken(_guestUser); // A non-admin is trying to process

            var application = new HotelManagerApplication { Id = 10, Status = ApplicationStatus.Pending, UserId = 5 };
            _context.HotelManagerApplications.Add(application);
            _context.SaveChanges();

            var request = new ProcessApplicationRequest { Status = ApplicationStatus.Approved };

            // Act
            var result = await _controller.ProcessApplication(application.Id, request);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<ForbidResult>());
        }
    }
}