using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalDestination.Tests.Data;

[TestFixture]
public class DatabaseTests
{
    private HotelContext _context;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<HotelContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new HotelContext(options);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Test]
    public async Task Database_CanAddMultipleHotels()
    {
        _context.Hotels.AddRange(
            new Hotel { Name = "Hotel 1", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 },
            new Hotel { Name = "Hotel 2", City = "Delhi", PricePerNight = 1500, AvailableRooms = 5 },
            new Hotel { Name = "Hotel 3", City = "Bangalore", PricePerNight = 1200, AvailableRooms = 8 }
        );
        await _context.SaveChangesAsync();

        var count = await _context.Hotels.CountAsync();
        Assert.That(count, Is.EqualTo(3));
    }

    [Test]
    public async Task Database_CanDeleteHotel()
    {
        var hotel = new Hotel { Name = "Test Hotel", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 };
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        _context.Hotels.Remove(hotel);
        await _context.SaveChangesAsync();

        var deleted = await _context.Hotels.FindAsync(hotel.Id);
        Assert.That(deleted, Is.Null);
    }

    [Test]
    public async Task Database_CanAddUserWithRole()
    {
        var user = new User
        {
            Email = "test@example.com",
            Name = "Test User",
            PasswordHash = "hash",
            Role = UserRole.Guest
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var saved = await _context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.Role, Is.EqualTo(UserRole.Guest));
    }

    [Test]
    public async Task Database_CanAddReviewWithRating()
    {
        var hotel = new Hotel { Name = "Test Hotel", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 };
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        var review = new Review
        {
            HotelId = hotel.Id,
            UserId = 1,
            Rating = 5,
            Comment = "Excellent!"
        };
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var saved = await _context.Reviews.FirstOrDefaultAsync(r => r.HotelId == hotel.Id);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.Rating, Is.EqualTo(5));
    }

    [Test]
    public async Task Database_CanQueryHotelsByPriceRange()
    {
        _context.Hotels.AddRange(
            new Hotel { Name = "Budget Hotel", City = "Mumbai", PricePerNight = 500, AvailableRooms = 10 },
            new Hotel { Name = "Mid Hotel", City = "Mumbai", PricePerNight = 1500, AvailableRooms = 5 },
            new Hotel { Name = "Luxury Hotel", City = "Mumbai", PricePerNight = 3000, AvailableRooms = 3 }
        );
        await _context.SaveChangesAsync();

        var affordable = await _context.Hotels.Where(h => h.PricePerNight <= 1500).ToListAsync();
        Assert.That(affordable.Count, Is.EqualTo(2));
    }

    [Test]
    public async Task Database_CanAddPaymentRecord()
    {
        var payment = new Payment
        {
            BookingId = 1,
            Amount = 1000,
            Currency = "INR",
            PaymentMethod = PaymentMethod.CreditCard,
            Status = PaymentStatus.Completed,
            TransactionId = "TXN123"
        };
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        var saved = await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == "TXN123");
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.Status, Is.EqualTo(PaymentStatus.Completed));
    }

    [Test]
    public async Task Database_CanAddLoyaltyTransaction()
    {
        var transaction = new PointsTransaction
        {
            LoyaltyAccountId = 1,
            BookingId = 1,
            PointsEarned = 100,
            Description = "Booking reward"
        };
        _context.PointsTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        var saved = await _context.PointsTransactions.FirstOrDefaultAsync(t => t.LoyaltyAccountId == 1);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.PointsEarned, Is.EqualTo(100));
    }
}
