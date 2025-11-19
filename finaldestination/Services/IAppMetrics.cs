namespace FinalDestinationAPI.Services;

public interface IAppMetrics
{
    void IncBookingCreated();
    void IncBookingCancelled();
    void IncPaymentSuccess();
    void IncPaymentFailed();
    void ObserveBookingProcessing(double seconds);
}