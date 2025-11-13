using FinalDestinationAPI.DTOs;
using FinalDestinationAPI.Models;

namespace FinalDestination.Tests.DTOs;

[TestFixture]
public class DtoTests
{
    [Test]
    public void CreateBookingRequest_ValidData_SetsProperties()
    {
        var request = new CreateBookingRequest
        {
            HotelId = 1,
            GuestName = "John Doe",
            GuestEmail = "john@example.com",
            CheckInDate = DateTime.Today.AddDays(1),
            CheckOutDate = DateTime.Today.AddDays(3),
            NumberOfGuests = 2
        };

        Assert.That(request.HotelId, Is.EqualTo(1));
        Assert.That(request.GuestName, Is.EqualTo("John Doe"));
        Assert.That(request.NumberOfGuests, Is.EqualTo(2));
    }

    [Test]
    public void PaymentRequest_ValidData_SetsProperties()
    {
        var request = new PaymentRequest
        {
            BookingId = 1,
            Amount = 1000m,
            Currency = "INR",
            PaymentMethod = PaymentMethod.CreditCard,
            CardNumber = "4111111111111111",
            CardHolderName = "John Doe"
        };

        Assert.That(request.BookingId, Is.EqualTo(1));
        Assert.That(request.Amount, Is.EqualTo(1000m));
        Assert.That(request.PaymentMethod, Is.EqualTo(PaymentMethod.CreditCard));
    }

    [Test]
    public void RegisterRequest_ValidData_SetsProperties()
    {
        var request = new RegisterRequest
        {
            Email = "test@example.com",
            Password = "Test123!",
            Name = "Test User"
        };

        Assert.That(request.Email, Is.EqualTo("test@example.com"));
        Assert.That(request.Name, Is.EqualTo("Test User"));
    }

    [Test]
    public void LoginRequest_ValidData_SetsProperties()
    {
        var request = new LoginRequest
        {
            Email = "test@example.com",
            Password = "Test123!"
        };

        Assert.That(request.Email, Is.EqualTo("test@example.com"));
        Assert.That(request.Password, Is.EqualTo("Test123!"));
    }

    [Test]
    public void CreateHotelRequest_ValidData_SetsProperties()
    {
        var request = new CreateHotelRequest
        {
            Name = "Test Hotel",
            City = "Mumbai",
            Address = "123 Test St",
            PricePerNight = 1000,
            AvailableRooms = 10
        };

        Assert.That(request.Name, Is.EqualTo("Test Hotel"));
        Assert.That(request.City, Is.EqualTo("Mumbai"));
        Assert.That(request.PricePerNight, Is.EqualTo(1000));
    }
}
