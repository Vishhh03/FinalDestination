using FinalDestinationAPI.Models;

namespace FinalDestination.Tests.Models;

[TestFixture]
public class ModelTests
{
    [Test]
    public void Hotel_Creation_SetsPropertiesCorrectly()
    {
        var hotel = new Hotel
        {
            Name = "Test Hotel",
            City = "Mumbai",
            PricePerNight = 1000,
            AvailableRooms = 10
        };

        Assert.That(hotel.Name, Is.EqualTo("Test Hotel"));
        Assert.That(hotel.City, Is.EqualTo("Mumbai"));
        Assert.That(hotel.PricePerNight, Is.EqualTo(1000));
        Assert.That(hotel.AvailableRooms, Is.EqualTo(10));
    }

    [Test]
    public void Booking_Creation_SetsPropertiesCorrectly()
    {
        var booking = new Booking
        {
            GuestName = "Test User",
            GuestEmail = "test@example.com",
            NumberOfGuests = 2,
            TotalAmount = 2000,
            Status = BookingStatus.Confirmed
        };

        Assert.That(booking.GuestName, Is.EqualTo("Test User"));
        Assert.That(booking.GuestEmail, Is.EqualTo("test@example.com"));
        Assert.That(booking.NumberOfGuests, Is.EqualTo(2));
        Assert.That(booking.TotalAmount, Is.EqualTo(2000));
        Assert.That(booking.Status, Is.EqualTo(BookingStatus.Confirmed));
    }

    [Test]
    public void User_Creation_SetsPropertiesCorrectly()
    {
        var user = new User
        {
            Email = "test@example.com",
            Name = "Test User",
            Role = UserRole.Guest
        };

        Assert.That(user.Email, Is.EqualTo("test@example.com"));
        Assert.That(user.Name, Is.EqualTo("Test User"));
        Assert.That(user.Role, Is.EqualTo(UserRole.Guest));
    }

    [Test]
    public void Review_Creation_SetsPropertiesCorrectly()
    {
        var review = new Review
        {
            Rating = 5,
            Comment = "Excellent hotel!",
            UserId = 1,
            HotelId = 1
        };

        Assert.That(review.Rating, Is.EqualTo(5));
        Assert.That(review.Comment, Is.EqualTo("Excellent hotel!"));
        Assert.That(review.UserId, Is.EqualTo(1));
        Assert.That(review.HotelId, Is.EqualTo(1));
    }

    [Test]
    public void LoyaltyAccount_Creation_SetsPropertiesCorrectly()
    {
        var account = new LoyaltyAccount
        {
            UserId = 1,
            PointsBalance = 500,
            TotalPointsEarned = 1000
        };

        Assert.That(account.UserId, Is.EqualTo(1));
        Assert.That(account.PointsBalance, Is.EqualTo(500));
        Assert.That(account.TotalPointsEarned, Is.EqualTo(1000));
    }

    [Test]
    public void Payment_Creation_SetsPropertiesCorrectly()
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

        Assert.That(payment.BookingId, Is.EqualTo(1));
        Assert.That(payment.Amount, Is.EqualTo(1000));
        Assert.That(payment.Status, Is.EqualTo(PaymentStatus.Completed));
    }

    [Test]
    public void PointsTransaction_Creation_SetsPropertiesCorrectly()
    {
        var transaction = new PointsTransaction
        {
            LoyaltyAccountId = 1,
            PointsEarned = 100,
            Description = "Booking reward"
        };

        Assert.That(transaction.LoyaltyAccountId, Is.EqualTo(1));
        Assert.That(transaction.PointsEarned, Is.EqualTo(100));
        Assert.That(transaction.Description, Is.EqualTo("Booking reward"));
    }

    [Test]
    public void BookingStatus_EnumValues_AreCorrect()
    {
        Assert.That((int)BookingStatus.Confirmed, Is.EqualTo(1));
        Assert.That((int)BookingStatus.Cancelled, Is.EqualTo(2));
        Assert.That((int)BookingStatus.Completed, Is.EqualTo(3));
    }

    [Test]
    public void UserRole_EnumValues_AreCorrect()
    {
        Assert.That((int)UserRole.Guest, Is.EqualTo(1));
        Assert.That((int)UserRole.HotelManager, Is.EqualTo(2));
        Assert.That((int)UserRole.Admin, Is.EqualTo(3));
    }
}
