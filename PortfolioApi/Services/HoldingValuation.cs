using PortfolioApi.Models;

namespace PortfolioApi.Services;

/// <summary>
/// Market value and unrealized P&amp;L: (currentPrice − purchasePrice) × quantity.
/// </summary>
public static class HoldingValuation
{
    public static (decimal CurrentPrice, decimal MarketValue, decimal UnrealizedPnL) FromHolding(
        Holding holding,
        IReadOnlyDictionary<string, Price> priceLookup)
    {
        var currentPrice = priceLookup.TryGetValue(holding.Ticker, out var price)
            ? price.CurrentPrice
            : 0m;

        var (marketValue, unrealizedPnL) = FromPrices(
            holding.Quantity,
            holding.PurchasePrice,
            currentPrice);

        return (currentPrice, marketValue, unrealizedPnL);
    }

    public static (decimal MarketValue, decimal UnrealizedPnL) FromPrices(
        decimal quantity,
        decimal purchasePrice,
        decimal currentPrice)
    {
        var marketValue = currentPrice * quantity;
        var unrealizedPnL = (currentPrice - purchasePrice) * quantity;
        return (marketValue, unrealizedPnL);
    }
}
