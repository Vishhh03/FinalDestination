using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using System;
using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;
using Prometheus;

namespace FinalDestinationAPI.Services
{
    public class MetricsUpdater : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _interval = TimeSpan.FromSeconds(15);

        // metric names aligned with Grafana dashboard (hotel_api_ prefix)
        private static readonly Gauge TotalHotels = Metrics.CreateGauge("hotel_api_total_hotels", "Total hotels");
        private static readonly Gauge TotalBookings = Metrics.CreateGauge("hotel_api_total_bookings", "Total bookings");
        private static readonly Gauge TotalUsers = Metrics.CreateGauge("hotel_api_total_users", "Total users");
        private static readonly Gauge TotalReviews = Metrics.CreateGauge("hotel_api_total_reviews", "Total reviews");
        private static readonly Gauge ActiveBookings = Metrics.CreateGauge("hotel_api_active_bookings", "Active bookings");

        public MetricsUpdater(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<HotelContext>();

                    var hotels = await context.Hotels.CountAsync(stoppingToken);
                    var bookings = await context.Bookings.CountAsync(stoppingToken);
                    var users = await context.Users.CountAsync(stoppingToken);
                    var reviews = await context.Reviews.CountAsync(stoppingToken);
                    var activeBookings = await context.Bookings.CountAsync(b => b.Status == BookingStatus.Confirmed, stoppingToken);

                    TotalHotels.Set(hotels);
                    TotalBookings.Set(bookings);
                    TotalUsers.Set(users);
                    TotalReviews.Set(reviews);
                    ActiveBookings.Set(activeBookings);
                }
                catch
                {
                    // Swallow errors to avoid crashing the background service; add logging if needed.
                }

                try
                {
                    await Task.Delay(_interval, stoppingToken);
                }
                catch (TaskCanceledException) { /* shutting down */ }
            }
        }
    }
}