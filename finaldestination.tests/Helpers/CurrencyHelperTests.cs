using FinalDestinationAPI.Helpers;

namespace FinalDestination.Tests.Helpers;

[TestFixture]
public class CurrencyHelperTests
{
    [Test]
    public void FormatInr_ValidAmount_ReturnsFormattedString()
    {
        var result = CurrencyHelper.FormatInr(1000);
        Assert.That(result, Is.EqualTo("₹1,000.00"));
    }

    [Test]
    public void FormatInr_ZeroAmount_ReturnsFormattedZero()
    {
        var result = CurrencyHelper.FormatInr(0);
        Assert.That(result, Is.EqualTo("₹0.00"));
    }

    [Test]
    public void FormatInr_LargeAmount_ReturnsFormattedString()
    {
        var result = CurrencyHelper.FormatInr(1234567.89m);
        Assert.That(result, Contains.Substring("₹"));
    }
}
