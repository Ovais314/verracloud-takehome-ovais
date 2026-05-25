using PortfolioApi.Models;
using PortfolioApi.Services;

namespace PortfolioApi.Tests.Services;

public class HoldingValuationTests
{
    [Theory]
    [InlineData(10, 170, 180, 1800, 100)]
    [InlineData(10, 170, 150, 1500, -200)]
    [InlineData(10, 170, 170, 1700, 0)]
    [InlineData(2.5, 40, 44, 110, 10)]
    public void FromPrices_ComputesMarketValueAndUnrealizedPnL(
        decimal quantity,
        decimal purchasePrice,
        decimal currentPrice,
        decimal expectedMarketValue,
        decimal expectedUnrealizedPnL)
    {
        var (marketValue, unrealizedPnL) = HoldingValuation.FromPrices(
            quantity,
            purchasePrice,
            currentPrice);

        Assert.Equal(expectedMarketValue, marketValue);
        Assert.Equal(expectedUnrealizedPnL, unrealizedPnL);
    }

    [Fact]
    public void FromHolding_UsesPriceFromLookup()
    {
        var holding = new Holding
        {
            Id = 1,
            Ticker = "AAPL",
            Quantity = 10,
            PurchasePrice = 170,
        };

        var lookup = new Dictionary<string, Price>(StringComparer.OrdinalIgnoreCase)
        {
            ["AAPL"] = new Price { Ticker = "AAPL", CurrentPrice = 180m },
        };

        var (currentPrice, marketValue, unrealizedPnL) = HoldingValuation.FromHolding(holding, lookup);

        Assert.Equal(180m, currentPrice);
        Assert.Equal(1800m, marketValue);
        Assert.Equal(100m, unrealizedPnL);
    }

    [Fact]
    public void FromHolding_WhenTickerNotInLookup_TreatsCurrentPriceAsZero()
    {
        var holding = new Holding
        {
            Id = 2,
            Ticker = "XYZ",
            Quantity = 5,
            PurchasePrice = 100,
        };

        var (currentPrice, marketValue, unrealizedPnL) = HoldingValuation.FromHolding(
            holding,
            new Dictionary<string, Price>());

        Assert.Equal(0m, currentPrice);
        Assert.Equal(0m, marketValue);
        Assert.Equal(-500m, unrealizedPnL);
    }

    [Fact]
    public void FromHolding_ResolvesTickerCaseInsensitively()
    {
        var holding = new Holding { Ticker = "aapl", Quantity = 1, PurchasePrice = 100 };
        var lookup = new Dictionary<string, Price>(StringComparer.OrdinalIgnoreCase)
        {
            ["AAPL"] = new Price { Ticker = "AAPL", CurrentPrice = 110m },
        };

        var (currentPrice, _, unrealizedPnL) = HoldingValuation.FromHolding(holding, lookup);

        Assert.Equal(110m, currentPrice);
        Assert.Equal(10m, unrealizedPnL);
    }
}
