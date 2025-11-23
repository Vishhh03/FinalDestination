namespace FinalDestinationAPI.Services;

/// <summary>
/// Interface for application-specific metrics tracking
/// </summary>
public interface IAppMetrics
{
    void IncBookingCreated();
    void IncBookingCancelled();
    void IncPaymentSuccess();
    void IncPaymentFailed();
    void IncUserRegistration();
    void RecordPaymentAmount(decimal amount);
    void SetActiveUsers(int count);
    void IncHotelSearch();
    void ObserveBookingProcessing(double seconds);
}
