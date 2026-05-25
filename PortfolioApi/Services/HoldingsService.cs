using PortfolioApi.DTOs;
using PortfolioApi.Exceptions;
using PortfolioApi.Models;
using PortfolioApi.Repositories;

namespace PortfolioApi.Services;

public class HoldingsService : IHoldingsService
{
    private readonly IHoldingsRepository _holdingsRepository;
    private readonly IPricesRepository _pricesRepository;
    private readonly ILogger<HoldingsService> _logger;

    public HoldingsService(
        IHoldingsRepository holdingsRepository,
        IPricesRepository pricesRepository,
        ILogger<HoldingsService> logger)
    {
        _holdingsRepository = holdingsRepository;
        _pricesRepository = pricesRepository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<HoldingResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var holdings = await _holdingsRepository.GetAllAsync(cancellationToken);
        var prices = await _pricesRepository.GetAllAsync(cancellationToken);
        var priceLookup = prices.ToDictionary(p => p.Ticker, StringComparer.OrdinalIgnoreCase);

        return holdings
            .Select(h => MapToResponse(h, priceLookup))
            .ToList();
    }

    public async Task<HoldingResponse> AddAsync(AddHoldingRequest request, CancellationToken cancellationToken = default)
    {
        var ticker = request.Ticker.Trim().ToUpperInvariant();

        if (request.Quantity <= 0)
        {
            throw new BusinessRuleException("Quantity must be greater than zero.");
        }

        if (request.PurchasePrice <= 0)
        {
            throw new BusinessRuleException("Purchase price must be greater than zero.");
        }

        if (await _holdingsRepository.ExistsByTickerAsync(ticker, cancellationToken))
        {
            throw new BusinessRuleException($"A holding for ticker '{ticker}' already exists.");
        }

        var price = await _pricesRepository.GetByTickerAsync(ticker, cancellationToken);
        if (price is null)
        {
            throw new BusinessRuleException($"Ticker '{ticker}' is not supported. Available tickers are seeded in the price feed.");
        }

        var holding = new Holding
        {
            Ticker = ticker,
            Quantity = request.Quantity,
            PurchasePrice = request.PurchasePrice,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _holdingsRepository.AddAsync(holding, cancellationToken);
        _logger.LogInformation("Added holding {HoldingId} for ticker {Ticker}", created.Id, created.Ticker);

        var priceLookup = new Dictionary<string, Price>(StringComparer.OrdinalIgnoreCase)
        {
            [price.Ticker] = price
        };

        return MapToResponse(created, priceLookup);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var deleted = await _holdingsRepository.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            throw new NotFoundException($"Holding with id '{id}' was not found.");
        }

        _logger.LogInformation("Deleted holding {HoldingId}", id);
    }

    private static HoldingResponse MapToResponse(Holding holding, IReadOnlyDictionary<string, Price> priceLookup)
    {
        var (currentPrice, marketValue, unrealizedPnL) = HoldingValuation.FromHolding(holding, priceLookup);

        return new HoldingResponse
        {
            Id = holding.Id,
            Ticker = holding.Ticker,
            Quantity = holding.Quantity,
            PurchasePrice = holding.PurchasePrice,
            CreatedAt = holding.CreatedAt,
            CurrentPrice = currentPrice,
            MarketValue = marketValue,
            UnrealizedPnL = unrealizedPnL
        };
    }
}
