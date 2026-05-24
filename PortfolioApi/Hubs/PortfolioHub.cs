using Microsoft.AspNetCore.SignalR;

namespace PortfolioApi.Hubs;

public class PortfolioHub : Hub
{
    public const string HoldingsUpdated = "HoldingsUpdated";
}
