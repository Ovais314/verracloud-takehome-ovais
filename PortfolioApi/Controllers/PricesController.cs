using Microsoft.AspNetCore.Mvc;
using PortfolioApi.DTOs;
using PortfolioApi.Services;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricesController : ControllerBase
{
    private readonly IPricesService _pricesService;
    private readonly IPortfolioNotificationService _notificationService;

    public PricesController(
        IPricesService pricesService,
        IPortfolioNotificationService notificationService)
    {
        _pricesService = pricesService;
        _notificationService = notificationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PriceResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PriceResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var prices = await _pricesService.GetAllAsync(cancellationToken);
        return Ok(prices);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(IReadOnlyList<PriceResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PriceResponse>>> Refresh(CancellationToken cancellationToken)
    {
        var prices = await _pricesService.RefreshPricesAsync(cancellationToken);
        await _notificationService.BroadcastHoldingsUpdatedAsync(cancellationToken);
        return Ok(prices);
    }
}
