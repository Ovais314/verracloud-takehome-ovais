using PortfolioApi.Services;

namespace PortfolioApi.BackgroundServices;

public class PriceRefreshBackgroundService : BackgroundService
{
    private static readonly TimeSpan RefreshInterval = TimeSpan.FromSeconds(10);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PriceRefreshBackgroundService> _logger;

    public PriceRefreshBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<PriceRefreshBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Price refresh background service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RefreshPricesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing prices in background service.");
            }

            try
            {
                await Task.Delay(RefreshInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        _logger.LogInformation("Price refresh background service stopped.");
    }

    private async Task RefreshPricesAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var pricesService = scope.ServiceProvider.GetRequiredService<IPricesService>();
        await pricesService.RefreshPricesAsync(cancellationToken);
    }
}
