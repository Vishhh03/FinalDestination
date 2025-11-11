using System.Globalization;

namespace FinalDestinationAPI.Helpers
{
    public static class CurrencyHelper
    {
        // Exchange rates (in production, fetch from API)
        private static readonly Dictionary<string, decimal> ExchangeRates = new()
        {
            { "USD", 1.0m },
            { "INR", 83.12m },
            { "EUR", 0.92m },
            { "GBP", 0.79m },
            { "JPY", 149.50m }
        };

        /// <summary>
        /// Converts amount from one currency to another
        /// </summary>
        public static decimal Convert(decimal amount, string fromCurrency, string toCurrency)
        {
            if (fromCurrency == toCurrency) return amount;

            var fromRate = ExchangeRates.GetValueOrDefault(fromCurrency.ToUpper(), 1.0m);
            var toRate = ExchangeRates.GetValueOrDefault(toCurrency.ToUpper(), 1.0m);

            var usdAmount = amount / fromRate;
            return usdAmount * toRate;
        }

        /// <summary>
        /// Formats currency based on culture
        /// </summary>
        public static string Format(decimal amount, string currencyCode, CultureInfo culture)
        {
            return amount.ToString("C", culture);
        }

        /// <summary>
        /// Formats INR currency
        /// </summary>
        public static string FormatInr(decimal amount)
        {
            return amount.ToString("C", new CultureInfo("hi-IN"));
        }

        /// <summary>
        /// Formats USD currency
        /// </summary>
        public static string FormatUsd(decimal amount)
        {
            return amount.ToString("C", new CultureInfo("en-US"));
        }
    }
}
