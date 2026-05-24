using PortfolioApi.DTOs;

namespace PortfolioApi.Services;

public interface IHoldingsService
{
    Task<IReadOnlyList<HoldingResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<HoldingResponse> AddAsync(AddHoldingRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}
