using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;

namespace PortfolioApi.Repositories;

public class HoldingsRepository : IHoldingsRepository
{
    private readonly PortfolioDbContext _context;

    public HoldingsRepository(PortfolioDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Holding>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Holdings
            .AsNoTracking()
            .OrderBy(h => h.Ticker)
            .ToListAsync(cancellationToken);
    }

    public async Task<Holding?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Holdings
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByTickerAsync(string ticker, CancellationToken cancellationToken = default)
    {
        var normalizedTicker = ticker.Trim().ToUpperInvariant();
        return await _context.Holdings
            .AnyAsync(h => h.Ticker == normalizedTicker, cancellationToken);
    }

    public async Task<Holding> AddAsync(Holding holding, CancellationToken cancellationToken = default)
    {
        await _context.Holdings.AddAsync(holding, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return holding;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var holding = await _context.Holdings.FindAsync([id], cancellationToken);
        if (holding is null)
        {
            return false;
        }

        _context.Holdings.Remove(holding);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
