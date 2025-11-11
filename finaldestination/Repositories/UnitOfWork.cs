using FinalDestinationAPI.Data;
using FinalDestinationAPI.Models;

namespace FinalDestinationAPI.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly HotelContext _context;
    
    public IUserRepository Users { get; }
    public IHotelRepository Hotels { get; }
    public IBookingRepository Bookings { get; }
    public IPaymentRepository Payments { get; }
    public IReviewRepository Reviews { get; }
    public ILoyaltyAccountRepository LoyaltyAccounts { get; }
    public IPointsTransactionRepository PointsTransactions { get; }
    public IHotelManagerApplicationRepository HotelManagerApplications { get; }

    public UnitOfWork(HotelContext context)
    {
        _context = context;
        Users = new UserRepository(_context);
        Hotels = new HotelRepository(_context);
        Bookings = new BookingRepository(_context);
        Payments = new PaymentRepository(_context);
        Reviews = new ReviewRepository(_context);
        LoyaltyAccounts = new LoyaltyAccountRepository(_context);
        PointsTransactions = new PointsTransactionRepository(_context);
        HotelManagerApplications = new HotelManagerApplicationRepository(_context);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
