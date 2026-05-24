using PortfolioApi.Models;

namespace PortfolioApi.Repositories;

public interface IHoldingsRepository
{
    Task<IReadOnlyList<Holding>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Holding?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByTickerAsync(string ticker, CancellationToken cancellationToken = default);
    Task<Holding> AddAsync(Holding holding, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
