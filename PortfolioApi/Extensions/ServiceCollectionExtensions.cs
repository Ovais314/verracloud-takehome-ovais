using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.BackgroundServices;
using PortfolioApi.Data;
using PortfolioApi.Repositories;
using PortfolioApi.Services;
using PortfolioApi.Validators;

namespace PortfolioApi.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPortfolioServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddDbContext<PortfolioDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IHoldingsRepository, HoldingsRepository>();
        services.AddScoped<IPricesRepository, PricesRepository>();
        services.AddScoped<IHoldingsService, HoldingsService>();
        services.AddScoped<IPricesService, PricesService>();
        services.AddSingleton<IPortfolioNotificationService, PortfolioNotificationService>();

        services.AddSignalR();
        services.AddHostedService<PriceRefreshBackgroundService>();

        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<AddHoldingRequestValidator>();

        return services;
    }
}
