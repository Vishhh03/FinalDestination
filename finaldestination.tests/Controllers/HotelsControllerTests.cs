using FinalDestinationAPI.Models;
using FinalDestinationAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace FinalDestination.Tests.Controllers;

[TestFixture]
public class HotelsControllerTests
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
    public async Task Database_CanAddHotel()
    {
        var hotel = new Hotel { Name = "Test Hotel", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 };
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        var saved = await _context.Hotels.FindAsync(hotel.Id);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.Name, Is.EqualTo("Test Hotel"));
    }

    [Test]
    public async Task Database_CanQueryHotelsByCity()
    {
        _context.Hotels.AddRange(
            new Hotel { Name = "Mumbai Hotel", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 },
            new Hotel { Name = "Delhi Hotel", City = "Delhi", PricePerNight = 1500, AvailableRooms = 5 }
        );
        await _context.SaveChangesAsync();

        var mumbaiHotels = await _context.Hotels.Where(h => h.City == "Mumbai").ToListAsync();
        Assert.That(mumbaiHotels.Count, Is.EqualTo(1));
        Assert.That(mumbaiHotels.First().Name, Is.EqualTo("Mumbai Hotel"));
    }

    [Test]
    public async Task Database_CanUpdateHotel()
    {
        var hotel = new Hotel { Name = "Test Hotel", City = "Mumbai", PricePerNight = 1000, AvailableRooms = 10 };
        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        hotel.PricePerNight = 1500;
        await _context.SaveChangesAsync();

        var updated = await _context.Hotels.FindAsync(hotel.Id);
        Assert.That(updated.PricePerNight, Is.EqualTo(1500));
    }
}
