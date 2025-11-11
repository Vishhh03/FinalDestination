using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface IPaymentRepository : IRepository<Payment>
{
    Task<Payment?> GetPaymentWithDetailsAsync(int id);
    Task<IEnumerable<Payment>> GetPaymentsByUserAsync(int userId);
    Task<Payment?> GetCompletedPaymentByBookingAsync(int bookingId);
}
