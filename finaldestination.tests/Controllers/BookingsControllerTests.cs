using FinalDestinationAPI.Models;
using FinalDestinationAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace FinalDestination.Tests.Controllers;

[TestFixture]
public class BookingsControllerTests
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
    public async Task Database_CanCreateBooking()
    {
        var hotel = new Hotel { Name = "Test Hotel", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 };
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        var booking = new Booking
        {
            UserId = 1,
            HotelId = hotel.Id,
            GuestName = "Test User",
            GuestEmail = "test@example.com",
            CheckInDate = DateTime.Today.AddDays(1),
            CheckOutDate = DateTime.Today.AddDays(3),
            NumberOfGuests = 2,
            TotalAmount = 2000,
            Status = BookingStatus.Confirmed
        };
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        var saved = await _context.Bookings.FindAsync(booking.Id);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.GuestName, Is.EqualTo("Test User"));
    }

    [Test]
    public async Task Database_CanQueryBookingsByUser()
    {
        var hotel = new Hotel { Name = "Test Hotel", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 };
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        _context.Bookings.AddRange(
            new Booking { UserId = 1, HotelId = hotel.Id, GuestName = "User 1", GuestEmail = "user1@test.com", CheckInDate = DateTime.Today.AddDays(1), CheckOutDate = DateTime.Today.AddDays(2), NumberOfGuests = 1, TotalAmount = 1000, Status = BookingStatus.Confirmed },
            new Booking { UserId = 2, HotelId = hotel.Id, GuestName = "User 2", GuestEmail = "user2@test.com", CheckInDate = DateTime.Today.AddDays(1), CheckOutDate = DateTime.Today.AddDays(2), NumberOfGuests = 1, TotalAmount = 1000, Status = BookingStatus.Confirmed }
        );
        await _context.SaveChangesAsync();

        var userBookings = await _context.Bookings.Where(b => b.UserId == 1).ToListAsync();
        Assert.That(userBookings.Count, Is.EqualTo(1));
    }
}
