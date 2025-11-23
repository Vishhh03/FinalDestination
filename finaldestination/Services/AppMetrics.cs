using Prometheus;

namespace FinalDestinationAPI.Services;

/// <summary>
/// Application-specific metrics for business KPIs
/// </summary>
public class AppMetrics : IAppMetrics
{
    private static readonly Counter _bookingsCreatedCounter = Prometheus.Metrics.CreateCounter(
        "hotel_bookings_created_total",
        "Total number of hotel bookings created");

    private static readonly Counter _bookingsCancelledCounter = Prometheus.Metrics.CreateCounter(
        "hotel_bookings_cancelled_total",
        "Total number of hotel bookings cancelled");

    private static readonly Counter _paymentsSuccessCounter = Prometheus.Metrics.CreateCounter(
        "hotel_payments_success_total",
        "Total number of successful payments");

    private static readonly Counter _paymentsFailedCounter = Prometheus.Metrics.CreateCounter(
        "hotel_payments_failed_total",
        "Total number of failed payments");

    private static readonly Counter _userRegistrationsCounter = Prometheus.Metrics.CreateCounter(
        "hotel_user_registrations_total",
        "Total number of user registrations");

    private static readonly Counter _paymentAmountCounter = Prometheus.Metrics.CreateCounter(
        "hotel_payment_amount_total",
        "Total payment amount processed in INR");

    private static readonly Gauge _activeUsersGauge = Prometheus.Metrics.CreateGauge(
        "hotel_active_users",
        "Number of currently active users (logged in within 24h)");

    private static readonly Counter _hotelSearchCounter = Prometheus.Metrics.CreateCounter(
        "hotel_searches_total",
        "Total number of hotel searches performed");

    private static readonly Histogram _bookingProcessingHistogram = Prometheus.Metrics.CreateHistogram(
        "hotel_booking_processing_seconds",
        "Duration of booking processing in seconds",
        new HistogramConfiguration
        {
            Buckets = Histogram.ExponentialBuckets(start: 0.01, factor: 2, count: 10)
        });

    public void IncBookingCreated()
    {
        _bookingsCreatedCounter.Inc();
    }

    public void IncBookingCancelled()
    {
        _bookingsCancelledCounter.Inc();
    }

    public void IncPaymentSuccess()
    {
        _paymentsSuccessCounter.Inc();
    }

    public void IncPaymentFailed()
    {
        _paymentsFailedCounter.Inc();
    }

    public void IncUserRegistration()
    {
        _userRegistrationsCounter.Inc();
    }

    public void RecordPaymentAmount(decimal amount)
    {
        _paymentAmountCounter.Inc((double)amount);
    }

    public void SetActiveUsers(int count)
    {
        _activeUsersGauge.Set(count);
    }

    public void IncHotelSearch()
    {
        _hotelSearchCounter.Inc();
    }

    public void ObserveBookingProcessing(double seconds)
    {
        _bookingProcessingHistogram.Observe(seconds);
    }
}
