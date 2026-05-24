using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;

namespace PortfolioApi.Repositories;

public class PricesRepository : IPricesRepository
{
    private readonly PortfolioDbContext _context;

    public PricesRepository(PortfolioDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Price>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Prices
            .AsNoTracking()
            .OrderBy(p => p.Ticker)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Price>> GetAllTrackedAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Prices
            .OrderBy(p => p.Ticker)
            .ToListAsync(cancellationToken);
    }

    public async Task<Price?> GetByTickerAsync(string ticker, CancellationToken cancellationToken = default)
    {
        var normalizedTicker = ticker.Trim().ToUpperInvariant();
        return await _context.Prices
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Ticker == normalizedTicker, cancellationToken);
    }

    public async Task UpdatePricesAsync(IReadOnlyList<Price> prices, CancellationToken cancellationToken = default)
    {
        _ = prices;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
