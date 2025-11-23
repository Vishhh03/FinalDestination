using FinalDestinationAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace FinalDestinationAPI.Services;

/// <summary>
/// Background service that periodically updates metrics from database
/// </summary>
public class MetricsUpdater : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MetricsUpdater> _logger;

    public MetricsUpdater(IServiceProvider serviceProvider, ILogger<MetricsUpdater> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Metrics Updater Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<HotelContext>();
                var metrics = scope.ServiceProvider.GetRequiredService<IAppMetrics>();

                // Count active users (users who logged in within last 24 hours)
                var activeUserCount = await context.Users
                    .CountAsync(u => u.LastLoginAt.HasValue && 
                                   u.LastLoginAt.Value > DateTime.UtcNow.AddHours(-24), 
                                   stoppingToken);

                metrics.SetActiveUsers(activeUserCount);

                _logger.LogDebug("Updated metrics: Active Users = {ActiveUsers}", activeUserCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating metrics");
            }

            // Update every 30 seconds
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }

        _logger.LogInformation("Metrics Updater Service stopped");
    }
}
