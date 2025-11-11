using System;

namespace FinalDestinationAPI.Helpers
{
    public static class TimeZoneHelper
    {
        // Common time zones
        public static readonly TimeZoneInfo IstTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        public static readonly TimeZoneInfo EstTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
        public static readonly TimeZoneInfo PstTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");
        public static readonly TimeZoneInfo UtcTimeZone = TimeZoneInfo.Utc;

        /// <summary>
        /// Converts UTC time to specified time zone
        /// </summary>
        public static DateTime ConvertFromUtc(DateTime utcDateTime, TimeZoneInfo targetTimeZone)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, targetTimeZone);
        }

        /// <summary>
        /// Converts time from one zone to another
        /// </summary>
        public static DateTime ConvertTime(DateTime dateTime, TimeZoneInfo sourceTimeZone, TimeZoneInfo targetTimeZone)
        {
            return TimeZoneInfo.ConvertTime(dateTime, sourceTimeZone, targetTimeZone);
        }

        /// <summary>
        /// Gets current time in specified time zone
        /// </summary>
        public static DateTime GetCurrentTime(TimeZoneInfo timeZone)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone);
        }

        /// <summary>
        /// Converts UTC to IST
        /// </summary>
        public static DateTime ToIst(DateTime utcDateTime)
        {
            return ConvertFromUtc(utcDateTime, IstTimeZone);
        }

        /// <summary>
        /// Gets current IST time
        /// </summary>
        public static DateTime GetIstNow()
        {
            return GetCurrentTime(IstTimeZone);
        }

        /// <summary>
        /// Formats date time with time zone info
        /// </summary>
        public static string FormatWithTimeZone(DateTime dateTime, TimeZoneInfo timeZone)
        {
            var localTime = ConvertFromUtc(dateTime, timeZone);
            return $"{localTime:yyyy-MM-dd HH:mm:ss} {timeZone.StandardName}";
        }
    }
}
