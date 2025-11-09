namespace FinalDestinationAPI.Helpers;

public static class TimeHelper
{
    private static readonly TimeZoneInfo IndianTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");

    /// <summary>
    /// Gets the current time in Indian Standard Time (IST)
    /// </summary>
    public static DateTime GetIndianTime()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, IndianTimeZone);
    }

    /// <summary>
    /// Converts UTC time to Indian Standard Time
    /// </summary>
    public static DateTime ConvertToIndianTime(DateTime utcTime)
    {
        return TimeZoneInfo.ConvertTimeFromUtc(utcTime, IndianTimeZone);
    }
}
