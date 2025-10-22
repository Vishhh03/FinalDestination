using Microsoft.EntityFrameworkCore;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Services;

public static class DataSeeder
{
    public static async Task SeedAsync(HotelContext context)
    {
        // Check if data already exists
        if (await context.Users.AnyAsync())
        {
            return; // Database has been seeded
        }

        // Seed users first
        var admin = new User
        {
            Name = "John Admin",
            Email = "admin@hotel.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            ContactNumber = "+1-555-0101",
            CreatedAt = DateTime.UtcNow.AddDays(-90),
            IsActive = true
        };

        var manager1 = new User
        {
            Name = "Jane Manager",
            Email = "manager@hotel.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
            Role = UserRole.HotelManager,
            ContactNumber = "+1-555-0102",
            CreatedAt = DateTime.UtcNow.AddDays(-85),
            IsActive = true
        };

        var guest1 = new User
        {
            Name = "Bob Guest",
            Email = "guest@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Guest123!"),
            Role = UserRole.Guest,
            ContactNumber = "+1-555-0104",
            CreatedAt = DateTime.UtcNow.AddDays(-75),
            IsActive = true
        };

        context.Users.AddRange(admin, manager1, guest1);
        await context.SaveChangesAsync();

        // Seed hotels
        var hotel1 = new Hotel
        {
            Name = "Grand Plaza Hotel",
            Address = "123 Main St",
            City = "New York",
            PricePerNight = 150.00m,
            AvailableRooms = 50,
            Rating = 0,
            ReviewCount = 0,
            ManagerId = manager1.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-90)
        };

        var hotel2 = new Hotel
        {
            Name = "Ocean View Resort",
            Address = "456 Beach Ave",
            City = "Miami",
            PricePerNight = 200.00m,
            AvailableRooms = 30,
            Rating = 0,
            ReviewCount = 0,
            ManagerId = manager1.Id,
            CreatedAt = DateTime.UtcNow.AddDays(-85)
        };

        context.Hotels.AddRange(hotel1, hotel2);
        await context.SaveChangesAsync();

        // Seed a booking
        var booking1 = new Booking
        {
            GuestName = guest1.Name,
            GuestEmail = guest1.Email,
            HotelId = hotel1.Id,
            UserId = guest1.Id,
            CheckInDate = DateTime.UtcNow.AddDays(-30),
            CheckOutDate = DateTime.UtcNow.AddDays(-28),
            NumberOfGuests = 2,
            TotalAmount = 300.00m,
            Status = BookingStatus.Completed,
            CreatedAt = DateTime.UtcNow.AddDays(-35)
        };

        context.Bookings.Add(booking1);
        await context.SaveChangesAsync();

        // Seed loyalty account
        var loyaltyAccount = new LoyaltyAccount
        {
            UserId = guest1.Id,
            PointsBalance = 30,
            TotalPointsEarned = 30,
            LastUpdated = DateTime.UtcNow.AddDays(-28)
        };

        context.LoyaltyAccounts.Add(loyaltyAccount);
        await context.SaveChangesAsync();

        // Seed payment
        var payment1 = new Payment
        {
            BookingId = booking1.Id,
            Amount = 300.00m,
            Currency = "INR",
            PaymentMethod = PaymentMethod.CreditCard,
            Status = PaymentStatus.Completed,
            TransactionId = "TXN001234567",
            ProcessedAt = DateTime.UtcNow.AddDays(-35),
            CreatedAt = DateTime.UtcNow.AddDays(-35)
        };

        context.Payments.Add(payment1);
        await context.SaveChangesAsync();

        // Seed points transaction
        var pointsTransaction = new PointsTransaction
        {
            LoyaltyAccountId = loyaltyAccount.Id,
            BookingId = booking1.Id,
            PointsEarned = 30,
            Description = "Points earned from booking at Grand Plaza Hotel",
            CreatedAt = DateTime.UtcNow.AddDays(-28)
        };

        context.PointsTransactions.Add(pointsTransaction);
        await context.SaveChangesAsync();

        // Seed a review
        var review1 = new Review
        {
            UserId = guest1.Id,
            HotelId = hotel1.Id,
            Rating = 5,
            Comment = "Excellent service and beautiful rooms!",
            CreatedAt = DateTime.UtcNow.AddDays(-28)
        };

        context.Reviews.Add(review1);
        await context.SaveChangesAsync();

        // Update hotel rating
        hotel1.Rating = 5.0m;
        hotel1.ReviewCount = 1;
        await context.SaveChangesAsync();
    }
}
