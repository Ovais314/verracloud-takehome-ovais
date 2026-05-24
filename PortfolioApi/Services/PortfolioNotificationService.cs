using Microsoft.AspNetCore.SignalR;
using PortfolioApi.Hubs;

namespace PortfolioApi.Services;

public class PortfolioNotificationService : IPortfolioNotificationService
{
    private readonly IHubContext<PortfolioHub> _hubContext;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PortfolioNotificationService> _logger;

    public PortfolioNotificationService(
        IHubContext<PortfolioHub> hubContext,
        IServiceScopeFactory scopeFactory,
        ILogger<PortfolioNotificationService> logger)
    {
        _hubContext = hubContext;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task BroadcastHoldingsUpdatedAsync(CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var holdingsService = scope.ServiceProvider.GetRequiredService<IHoldingsService>();
        var holdings = await holdingsService.GetAllAsync(cancellationToken);

        await _hubContext.Clients.All.SendAsync(
            PortfolioHub.HoldingsUpdated,
            holdings,
            cancellationToken);

        _logger.LogDebug("Broadcast HoldingsUpdated to all clients ({Count} holdings)", holdings.Count);
    }
}
