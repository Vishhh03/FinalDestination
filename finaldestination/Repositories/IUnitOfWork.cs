using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IHotelRepository Hotels { get; }
    IBookingRepository Bookings { get; }
    IPaymentRepository Payments { get; }
    IReviewRepository Reviews { get; }
    ILoyaltyAccountRepository LoyaltyAccounts { get; }
    IPointsTransactionRepository PointsTransactions { get; }
    IHotelManagerApplicationRepository HotelManagerApplications { get; }
    
    Task<int> SaveChangesAsync();
}
