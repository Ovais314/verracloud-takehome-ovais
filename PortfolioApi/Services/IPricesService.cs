using PortfolioApi.DTOs;

namespace PortfolioApi.Services;

public interface IPricesService
{
    Task<IReadOnlyList<PriceResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PriceResponse>> RefreshPricesAsync(CancellationToken cancellationToken = default);
}
