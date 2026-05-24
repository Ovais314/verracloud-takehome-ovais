using Microsoft.EntityFrameworkCore;
using PortfolioApi.Models;

namespace PortfolioApi.Data;

public static class DatabaseSeeder
{
    private static readonly (string Ticker, decimal InitialPrice)[] SeedPrices =
    [
        ("AAPL", 175.50m),
        ("MSFT", 420.25m),
        ("JPM", 198.75m),
        ("T", 17.40m),
        ("GS", 485.00m)
    ];

    public static async Task SeedAsync(PortfolioDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.Prices.AnyAsync(cancellationToken))
        {
            return;
        }

        var utcNow = DateTime.UtcNow;
        var prices = SeedPrices.Select(p => new Price
        {
            Ticker = p.Ticker,
            CurrentPrice = p.InitialPrice,
            LastUpdatedAt = utcNow
        });

        await context.Prices.AddRangeAsync(prices, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
