using PortfolioApi.DTOs;
using PortfolioApi.Models;
using PortfolioApi.Repositories;

namespace PortfolioApi.Services;

public class PricesService : IPricesService
{
    private readonly IPricesRepository _pricesRepository;
    private readonly ILogger<PricesService> _logger;

    public PricesService(IPricesRepository pricesRepository, ILogger<PricesService> logger)
    {
        _pricesRepository = pricesRepository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<PriceResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var prices = await _pricesRepository.GetAllAsync(cancellationToken);
        return prices.Select(MapToResponse).ToList();
    }

    public async Task<IReadOnlyList<PriceResponse>> RefreshPricesAsync(CancellationToken cancellationToken = default)
    {
        var prices = await _pricesRepository.GetAllTrackedAsync(cancellationToken);
        var utcNow = DateTime.UtcNow;

        foreach (var price in prices)
        {
            price.CurrentPrice = ApplyRandomPriceChange(price.CurrentPrice);
            price.LastUpdatedAt = utcNow;
        }

        await _pricesRepository.UpdatePricesAsync(prices, cancellationToken);
        _logger.LogInformation("Refreshed {Count} price records", prices.Count);

        return prices.Select(MapToResponse).ToList();
    }

    internal static decimal ApplyRandomPriceChange(decimal currentPrice)
    {
        var changePercent = (Random.Shared.NextDouble() * 4d) - 2d;
        var multiplier = 1m + (decimal)changePercent / 100m;
        var newPrice = currentPrice * multiplier;
        return Math.Round(newPrice, 4, MidpointRounding.AwayFromZero);
    }

    private static PriceResponse MapToResponse(Price price) => new()
    {
        Ticker = price.Ticker,
        CurrentPrice = price.CurrentPrice,
        LastUpdatedAt = price.LastUpdatedAt
    };
}
