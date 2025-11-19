using Prometheus;
using System;

namespace FinalDestinationAPI.Services;

public class AppMetrics : IAppMetrics
{
    private readonly Counter _bookingsCreated = Metrics.CreateCounter(
        "hotel_api_bookings_created_total", "Total number of bookings created");

    private readonly Counter _bookingsCancelled = Metrics.CreateCounter(
        "hotel_api_bookings_cancelled_total", "Total number of bookings cancelled");

    private readonly Counter _paymentSuccess = Metrics.CreateCounter(
        "hotel_api_payment_success_total", "Total number of successful payments");

    private readonly Counter _paymentFailed = Metrics.CreateCounter(
        "hotel_api_payment_failed_total", "Total number of failed payments");

    // Histogram to measure booking processing duration (seconds)
    private readonly Histogram _bookingProcessingDuration = Metrics.CreateHistogram(
        "hotel_api_booking_processing_seconds", "Booking creation processing time in seconds",
        new HistogramConfiguration
        {
            Buckets = Histogram.ExponentialBuckets(start: 0.01, factor: 2, count: 12) // 10ms..~20s
        });

    public void IncBookingCreated() => _bookingsCreated.Inc();

    public void IncBookingCancelled() => _bookingsCancelled.Inc();

    public void IncPaymentSuccess() => _paymentSuccess.Inc();

    public void IncPaymentFailed() => _paymentFailed.Inc();

    public void ObserveBookingProcessing(double seconds) => _bookingProcessingDuration.Observe(seconds);
}