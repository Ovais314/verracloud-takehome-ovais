namespace PortfolioApi.Services;

public interface IPortfolioNotificationService
{
    Task BroadcastHoldingsUpdatedAsync(CancellationToken cancellationToken = default);
}
