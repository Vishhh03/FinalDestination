using Prometheus;

namespace FinalDestinationAPI.Services
{
    // Central place for application-level Prometheus metrics (counters/histograms)
    public static class Metrics
    {
        // Booking lifecycle
        public static readonly Counter BookingsCreated = Prometheus.Metrics.CreateCounter(
            "hotel_api_bookings_created_total", "Total number of bookings created");

        public static readonly Counter BookingsCancelled = Prometheus.Metrics.CreateCounter(
            "hotel_api_bookings_cancelled_total", "Total number of bookings cancelled");

        // Payments
        public static readonly Counter PaymentSuccess = Prometheus.Metrics.CreateCounter(
            "hotel_api_payment_success_total", "Total number of successful payments");

        public static readonly Counter PaymentFailed = Prometheus.Metrics.CreateCounter(
            "hotel_api_payment_failed_total", "Total number of failed payments");
    }
}