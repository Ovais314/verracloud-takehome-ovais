using Microsoft.EntityFrameworkCore;
using PortfolioApi.Models;

namespace PortfolioApi.Data;

public class PortfolioDbContext : DbContext
{
    public PortfolioDbContext(DbContextOptions<PortfolioDbContext> options)
        : base(options)
    {
    }

    public DbSet<Holding> Holdings => Set<Holding>();
    public DbSet<Price> Prices => Set<Price>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Holding>(entity =>
        {
            entity.ToTable("Holdings");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Ticker)
                .IsRequired()
                .HasMaxLength(10);
            entity.HasIndex(e => e.Ticker)
                .IsUnique();
            entity.Property(e => e.Quantity)
                .HasPrecision(18, 4);
            entity.Property(e => e.PurchasePrice)
                .HasPrecision(18, 4);
            entity.Property(e => e.CreatedAt)
                .IsRequired();
        });

        modelBuilder.Entity<Price>(entity =>
        {
            entity.ToTable("Prices");
            entity.HasKey(e => e.Ticker);
            entity.Property(e => e.Ticker)
                .IsRequired()
                .HasMaxLength(10);
            entity.Property(e => e.CurrentPrice)
                .HasPrecision(18, 4);
            entity.Property(e => e.LastUpdatedAt)
                .IsRequired();
        });
    }
}
