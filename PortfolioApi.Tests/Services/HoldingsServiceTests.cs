using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using PortfolioApi.DTOs;
using PortfolioApi.Exceptions;
using PortfolioApi.Models;
using PortfolioApi.Repositories;
using PortfolioApi.Services;

namespace PortfolioApi.Tests.Services;

public class HoldingsServiceTests
{
    private readonly Mock<IHoldingsRepository> _holdings = new();
    private readonly Mock<IPricesRepository> _prices = new();

    private HoldingsService CreateService() =>
        new(_holdings.Object, _prices.Object, NullLogger<HoldingsService>.Instance);

    [Fact]
    public async Task GetAllAsync_MapsHoldingsWithPnLFromPriceFeed()
    {
        var holdings = new List<Holding>
        {
            new()
            {
                Id = 1,
                Ticker = "AAPL",
                Quantity = 10,
                PurchasePrice = 170,
                CreatedAt = DateTime.UtcNow,
            },
        };

        var prices = new List<Price>
        {
            new() { Ticker = "AAPL", CurrentPrice = 180m, LastUpdatedAt = DateTime.UtcNow },
        };

        _holdings
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(holdings);
        _prices
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(prices);

        var result = await CreateService().GetAllAsync();

        var response = Assert.Single(result);
        Assert.Equal(180m, response.CurrentPrice);
        Assert.Equal(1800m, response.MarketValue);
        Assert.Equal(100m, response.UnrealizedPnL);
    }

    [Fact]
    public async Task GetAllAsync_WhenPriceFeedMissingTicker_UsesZeroForValuation()
    {
        _holdings
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Holding>
            {
                new() { Id = 1, Ticker = "ORPHAN", Quantity = 2, PurchasePrice = 50 },
            });
        _prices
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Price>());

        var response = Assert.Single(await CreateService().GetAllAsync());

        Assert.Equal(0m, response.CurrentPrice);
        Assert.Equal(0m, response.MarketValue);
        Assert.Equal(-100m, response.UnrealizedPnL);
    }

    [Fact]
    public async Task AddAsync_WhenTickerAlreadyExists_ThrowsBusinessRuleException()
    {
        _holdings
            .Setup(r => r.ExistsByTickerAsync("AAPL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var act = () => CreateService().AddAsync(new AddHoldingRequest
        {
            Ticker = "aapl",
            Quantity = 1,
            PurchasePrice = 100,
        });

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(act);
        Assert.Contains("already exists", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task AddAsync_WhenTickerNotInPriceFeed_ThrowsBusinessRuleException()
    {
        _holdings
            .Setup(r => r.ExistsByTickerAsync("FAKE", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _prices
            .Setup(r => r.GetByTickerAsync("FAKE", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Price?)null);

        var act = () => CreateService().AddAsync(new AddHoldingRequest
        {
            Ticker = "FAKE",
            Quantity = 1,
            PurchasePrice = 10,
        });

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(act);
        Assert.Contains("not supported", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task AddAsync_WhenQuantityNotPositive_ThrowsBusinessRuleException()
    {
        var act = () => CreateService().AddAsync(new AddHoldingRequest
        {
            Ticker = "AAPL",
            Quantity = 0,
            PurchasePrice = 100,
        });

        await Assert.ThrowsAsync<BusinessRuleException>(act);
        _holdings.Verify(
            r => r.AddAsync(It.IsAny<Holding>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task AddAsync_ValidRequest_PersistsAndReturnsValuation()
    {
        _holdings
            .Setup(r => r.ExistsByTickerAsync("MSFT", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _prices
            .Setup(r => r.GetByTickerAsync("MSFT", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Price
            {
                Ticker = "MSFT",
                CurrentPrice = 400m,
                LastUpdatedAt = DateTime.UtcNow,
            });
        _holdings
            .Setup(r => r.AddAsync(It.IsAny<Holding>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Holding h, CancellationToken _) =>
            {
                h.Id = 7;
                return h;
            });

        var response = await CreateService().AddAsync(new AddHoldingRequest
        {
            Ticker = " msft ",
            Quantity = 5,
            PurchasePrice = 380,
        });

        Assert.Equal(7, response.Id);
        Assert.Equal("MSFT", response.Ticker);
        Assert.Equal(400m, response.CurrentPrice);
        Assert.Equal(2000m, response.MarketValue);
        Assert.Equal(100m, response.UnrealizedPnL);
    }
}
