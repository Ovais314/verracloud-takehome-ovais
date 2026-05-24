using PortfolioApi.Models;

namespace PortfolioApi.Repositories;

public interface IPricesRepository
{
    Task<IReadOnlyList<Price>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Price>> GetAllTrackedAsync(CancellationToken cancellationToken = default);
    Task<Price?> GetByTickerAsync(string ticker, CancellationToken cancellationToken = default);
    Task UpdatePricesAsync(IReadOnlyList<Price> prices, CancellationToken cancellationToken = default);
}
