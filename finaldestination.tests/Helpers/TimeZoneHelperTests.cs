using FinalDestinationAPI.Helpers;

namespace FinalDestination.Tests.Helpers;

[TestFixture]
public class TimeZoneHelperTests
{
    [Test]
    public void GetIstNow_ReturnsDateTime()
    {
        var result = TimeZoneHelper.GetIstNow();
        Assert.That(result, Is.InstanceOf<DateTime>());
    }

    [Test]
    public void ToIst_UtcDateTime_ConvertsToIst()
    {
        var utcTime = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var result = TimeZoneHelper.ToIst(utcTime);
        Assert.That(result, Is.GreaterThan(utcTime));
    }

    [Test]
    public void GetIstNow_ReturnsCurrentTime()
    {
        var before = DateTime.UtcNow;
        var istTime = TimeZoneHelper.GetIstNow();
        var after = DateTime.UtcNow;
        
        Assert.That(istTime, Is.GreaterThanOrEqualTo(before));
        Assert.That(istTime, Is.LessThanOrEqualTo(after.AddHours(6)));
    }
}
