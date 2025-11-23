# Metrics Integration Guide

This guide shows how to add custom metrics to your .NET controllers and services.

## Quick Start

### 1. Inject IAppMetrics

```csharp
public class YourController : ControllerBase
{
    private readonly IAppMetrics _metrics;
    
    public YourController(IAppMetrics metrics)
    {
        _metrics = metrics;
    }
}
```

### 2. Track Events

```csharp
[HttpPost]
public async Task<ActionResult> CreateResource(CreateRequest request)
{
    // Track the operation
    _metrics.IncResourceCreated();
    
    // ... your logic
    
    return Ok(result);
}
```

## Available Metrics Methods

### Counters (Incrementing Values)

```csharp
// Bookings
_metrics.IncBookingCreated();        // New booking created
_metrics.IncBookingCancelled();      // Booking cancelled

// Payments
_metrics.IncPaymentSuccess();        // Successful payment
_metrics.IncPaymentFailed();         // Failed payment
_metrics.RecordPaymentAmount(100.50m); // Track revenue

// Users
_metrics.IncUserRegistration();      // New user registered

// Searches
_metrics.IncHotelSearch();           // Hotel search performed
```

### Gauges (Current Values)

```csharp
// Active users (updated by background service)
_metrics.SetActiveUsers(42);
```

### Histograms (Distributions)

```csharp
// Track operation duration
var sw = Stopwatch.StartNew();
// ... perform operation
sw.Stop();
_metrics.ObserveBookingProcessing(sw.Elapsed.TotalSeconds);
```

## Adding New Metrics

### Step 1: Define in IAppMetrics Interface

```csharp
// finaldestination/Services/IAppMetrics.cs
public interface IAppMetrics
{
    // ... existing methods
    
    void IncReviewCreated();
    void ObserveSearchDuration(double seconds);
}
```

### Step 2: Implement in AppMetrics Class

```csharp
// finaldestination/Services/AppMetrics.cs
public class AppMetrics : IAppMetrics
{
    private readonly Counter _reviewsCounter = Metrics.CreateCounter(
        "hotel_reviews_created_total",
        "Total number of reviews created");
    
    private readonly Histogram _searchDurationHistogram = Metrics.CreateHistogram(
        "hotel_search_duration_seconds",
        "Duration of hotel search operations",
        new HistogramConfiguration
        {
            Buckets = Histogram.ExponentialBuckets(0.01, 2, 10)
        });
    
    public void IncReviewCreated()
    {
        _reviewsCounter.Inc();
    }
    
    public void ObserveSearchDuration(double seconds)
    {
        _searchDurationHistogram.Observe(seconds);
    }
}
```

### Step 3: Use in Controllers

```csharp
[HttpPost("reviews")]
public async Task<ActionResult> CreateReview(ReviewRequest request)
{
    // ... validation
    
    var review = new Review { /* ... */ };
    await _context.Reviews.AddAsync(review);
    await _context.SaveChangesAsync();
    
    _metrics.IncReviewCreated();
    
    return Ok(review);
}

[HttpGet("search")]
public async Task<ActionResult> SearchHotels([FromQuery] SearchParams params)
{
    var sw = Stopwatch.StartNew();
    
    var results = await _hotelService.SearchAsync(params);
    
    sw.Stop();
    _metrics.IncHotelSearch();
    _metrics.ObserveSearchDuration(sw.Elapsed.TotalSeconds);
    
    return Ok(results);
}
```

## Metric Types Explained

### Counter
- **Use for**: Events that only increase (requests, errors, sales)
- **Example**: Total bookings, total revenue
- **Query**: `rate(metric_name[5m])` for rate per second

```csharp
private readonly Counter _counter = Metrics.CreateCounter(
    "operation_total",
    "Description of what this counts");

_counter.Inc();      // Increment by 1
_counter.Inc(5);     // Increment by 5
```

### Gauge
- **Use for**: Values that go up and down (active users, queue size)
- **Example**: Current active sessions, memory usage
- **Query**: `metric_name` for current value

```csharp
private readonly Gauge _gauge = Metrics.CreateGauge(
    "current_value",
    "Description of what this measures");

_gauge.Set(42);      // Set to specific value
_gauge.Inc();        // Increment by 1
_gauge.Dec();        // Decrement by 1
```

### Histogram
- **Use for**: Distributions (request duration, response size)
- **Example**: API latency, booking processing time
- **Query**: `histogram_quantile(0.95, rate(metric_bucket[5m]))` for p95

```csharp
private readonly Histogram _histogram = Metrics.CreateHistogram(
    "operation_duration_seconds",
    "Description of what this measures",
    new HistogramConfiguration
    {
        Buckets = Histogram.ExponentialBuckets(0.01, 2, 10)
    });

_histogram.Observe(0.523);  // Record a value
```

### Summary
- **Use for**: Similar to histogram but calculates quantiles on client
- **Example**: Request latency with pre-calculated percentiles
- **Query**: `metric_name{quantile="0.95"}`

```csharp
private readonly Summary _summary = Metrics.CreateSummary(
    "operation_duration_seconds",
    "Description",
    new SummaryConfiguration
    {
        Objectives = new[]
        {
            new QuantileEpsilonPair(0.5, 0.05),
            new QuantileEpsilonPair(0.9, 0.01),
            new QuantileEpsilonPair(0.99, 0.001)
        }
    });

_summary.Observe(0.523);
```

## Best Practices

### 1. Naming Conventions

```
<namespace>_<name>_<unit>_<suffix>

Examples:
hotel_bookings_created_total
hotel_booking_processing_seconds
hotel_active_users
http_requests_received_total
```

**Suffixes**:
- `_total` - Counters
- `_seconds` - Time durations
- `_bytes` - Sizes
- No suffix - Gauges

### 2. Labels (Use Sparingly)

```csharp
private readonly Counter _requestCounter = Metrics.CreateCounter(
    "api_requests_total",
    "Total API requests",
    new CounterConfiguration
    {
        LabelNames = new[] { "method", "endpoint", "status" }
    });

_requestCounter.WithLabels("POST", "/api/bookings", "200").Inc();
```

**Warning**: High cardinality labels (user IDs, timestamps) can cause performance issues!

### 3. Measure What Matters

**Good metrics**:
- Business KPIs (bookings, revenue, conversions)
- User experience (latency, errors)
- System health (CPU, memory, disk)
- Saturation (queue depth, connection pool)

**Avoid**:
- Metrics that are never queried
- High cardinality metrics
- Duplicate information

### 4. Use Timers for Duration

```csharp
// Good: Using Stopwatch
var sw = Stopwatch.StartNew();
await PerformOperation();
sw.Stop();
_metrics.ObserveDuration(sw.Elapsed.TotalSeconds);

// Better: Using prometheus-net timer
using (_histogram.NewTimer())
{
    await PerformOperation();
}
```

### 5. Handle Errors

```csharp
try
{
    await ProcessPayment();
    _metrics.IncPaymentSuccess();
}
catch (Exception ex)
{
    _metrics.IncPaymentFailed();
    _logger.LogError(ex, "Payment failed");
    throw;
}
```

## Common Patterns

### Request/Response Tracking

```csharp
[HttpPost]
public async Task<ActionResult> CreateResource(CreateRequest request)
{
    var sw = Stopwatch.StartNew();
    
    try
    {
        var result = await _service.CreateAsync(request);
        
        sw.Stop();
        _metrics.IncResourceCreated();
        _metrics.ObserveCreationDuration(sw.Elapsed.TotalSeconds);
        
        return CreatedAtAction(nameof(GetResource), new { id = result.Id }, result);
    }
    catch (ValidationException ex)
    {
        _metrics.IncValidationError();
        return BadRequest(ex.Message);
    }
    catch (Exception ex)
    {
        _metrics.IncResourceCreationFailed();
        _logger.LogError(ex, "Failed to create resource");
        throw;
    }
}
```

### Background Job Monitoring

```csharp
public class DataSyncJob : BackgroundService
{
    private readonly IAppMetrics _metrics;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var sw = Stopwatch.StartNew();
            
            try
            {
                await SyncData();
                sw.Stop();
                
                _metrics.IncSyncSuccess();
                _metrics.ObserveSyncDuration(sw.Elapsed.TotalSeconds);
            }
            catch (Exception ex)
            {
                _metrics.IncSyncFailed();
                _logger.LogError(ex, "Sync failed");
            }
            
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}
```

### Rate Limiting

```csharp
private readonly Gauge _rateLimitGauge = Metrics.CreateGauge(
    "api_rate_limit_remaining",
    "Remaining API calls before rate limit");

public async Task<ActionResult> RateLimitedEndpoint()
{
    var remaining = await _rateLimiter.GetRemainingAsync(userId);
    _rateLimitGauge.Set(remaining);
    
    if (remaining <= 0)
    {
        _metrics.IncRateLimitExceeded();
        return StatusCode(429, "Rate limit exceeded");
    }
    
    // ... process request
}
```

## Querying Your Metrics

### In Prometheus

```promql
# Request rate
rate(hotel_bookings_created_total[5m])

# Success rate
rate(hotel_payments_success_total[5m]) / 
(rate(hotel_payments_success_total[5m]) + rate(hotel_payments_failed_total[5m]))

# Average processing time
rate(hotel_booking_processing_seconds_sum[5m]) / 
rate(hotel_booking_processing_seconds_count[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(hotel_booking_processing_seconds_bucket[5m]))
```

### In Grafana

Create panels with these queries and visualize as:
- **Time series**: Trends over time
- **Gauge**: Current value
- **Stat**: Single number
- **Bar chart**: Comparisons

## Testing Metrics

### Unit Tests

```csharp
[Fact]
public async Task CreateBooking_IncrementsMetric()
{
    // Arrange
    var mockMetrics = new Mock<IAppMetrics>();
    var controller = new BookingsController(mockMetrics.Object);
    
    // Act
    await controller.CreateBooking(new CreateBookingRequest());
    
    // Assert
    mockMetrics.Verify(m => m.IncBookingCreated(), Times.Once);
}
```

### Integration Tests

```csharp
[Fact]
public async Task Metrics_AreExposed()
{
    // Arrange
    var client = _factory.CreateClient();
    
    // Act
    var response = await client.GetAsync("/metrics");
    var content = await response.Content.ReadAsStringAsync();
    
    // Assert
    response.EnsureSuccessStatusCode();
    Assert.Contains("hotel_bookings_created_total", content);
}
```

## Troubleshooting

### Metrics Not Appearing

1. Check `/metrics` endpoint: http://localhost:5000/metrics
2. Verify Prometheus is scraping: http://localhost:9090/targets
3. Check for typos in metric names
4. Ensure metrics are being called in code

### High Cardinality Issues

```csharp
// BAD: User ID as label (millions of unique values)
_counter.WithLabels(userId.ToString()).Inc();

// GOOD: Track count without labels
_counter.Inc();

// GOOD: Use limited set of labels
_counter.WithLabels(userRole).Inc(); // Only a few roles
```

### Performance Impact

- Metrics are very lightweight (microseconds)
- Avoid metrics in tight loops
- Use sampling for high-frequency events

```csharp
// Sample 10% of requests
if (Random.Shared.Next(100) < 10)
{
    _metrics.ObserveDuration(duration);
}
```

## Resources

- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [prometheus-net Documentation](https://github.com/prometheus-net/prometheus-net)
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)
- [Metric Types Guide](https://prometheus.io/docs/concepts/metric_types/)
