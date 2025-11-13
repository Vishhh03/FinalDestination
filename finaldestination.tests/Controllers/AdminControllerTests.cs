using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FinalDestinationAPI.Controllers;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace finaldestination.tests.Controllers
{
    [TestFixture]
    public class AdminControllerTests
    {
        private HotelContext _context;
        private Mock<ILogger<AdminController>> _mockLogger;
        private AdminController _controller;

        [SetUp]
        public void Setup()
        {
            // 1. Set up the In-Memory Database
            // We use a unique GUID for the database name to ensure each test
            // runs against a clean, isolated database.
            var options = new DbContextOptionsBuilder<HotelContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new HotelContext(options);

            // 2. Mock the Logger
            _mockLogger = new Mock<ILogger<AdminController>>();

            // 3. Seed the database with test data
            SeedDatabase();

            // 4. Initialize the Controller
            _controller = new AdminController(_context, _mockLogger.Object);
        }

        private void SeedDatabase()
        {
            // We create simple test data just for this controller's needs.
            // We must include PasswordHash because your HotelContext defines it as required.
            var users = new List<User>
            {
                new User
                {
                    Id = 1,
                    Name = "Admin User",
                    Email = "admin@test.com",
                    Role = UserRole.Admin,
                    PasswordHash = "dummy_hash_1", // Required field
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 2,
                    Name = "Guest User",
                    Email = "guest@test.com",
                    Role = UserRole.Guest,
                    PasswordHash = "dummy_hash_2", // Required field
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };
            _context.Users.AddRange(users);
            _context.SaveChanges();
        }

        [TearDown]
        public void TearDown()
        {
            // Clean up the in-memory database after each test
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // --- Tests for GetAllUsers ---

        [Test]
        public async Task GetAllUsers_ReturnsAllUsers()
        {
            // Arrange (Done in Setup)

            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>(), "Result should be OkObjectResult");

            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult.Value, Is.Not.Null, "Result value should not be null");

            // We can check the count to verify both users were returned
            var usersList = okResult.Value as IEnumerable<object>;
            Assert.That(usersList.Count(), Is.EqualTo(2), "Should return 2 users from the seeded data");
        }

        // --- Tests for UpdateUserRole ---

        [Test]
        public async Task UpdateUserRole_UserExistsAndRoleIsValid_ReturnsOk()
        {
            // Arrange
            int userIdToUpdate = 2; // The 'Guest User'
            var request = new UpdateRoleRequest { Role = "Admin" };

            // Act
            var result = await _controller.UpdateUserRole(userIdToUpdate, request);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>(), "Result should be OkObjectResult");

            // Verify the change in the in-memory database
            var updatedUser = await _context.Users.FindAsync(userIdToUpdate);
            Assert.That(updatedUser, Is.Not.Null);
            Assert.That(updatedUser.Role, Is.EqualTo(UserRole.Admin), "User's role should be updated to Admin");
        }

        [Test]
        public async Task UpdateUserRole_UserNotFound_ReturnsNotFound()
        {
            // Arrange
            int nonExistentUserId = 999;
            var request = new UpdateRoleRequest { Role = "Admin" };

            // Act
            var result = await _controller.UpdateUserRole(nonExistentUserId, request);

            // Assert
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>(), "Result should be NotFoundObjectResult");
        }

        [Test]
        public async Task UpdateUserRole_InvalidRoleString_ReturnsBadRequest()
        {
            // Arrange
            int userIdToUpdate = 1;
            var request = new UpdateRoleRequest { Role = "NotARealRole" }; // Invalid role string

            // Act
            var result = await _controller.UpdateUserRole(userIdToUpdate, request);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>(), "Result should be BadRequestObjectResult");

            // Verify the role was NOT changed
            var user = await _context.Users.FindAsync(userIdToUpdate);
            Assert.That(user.Role, Is.EqualTo(UserRole.Admin), "User's role should not have changed");
        }
    }
}