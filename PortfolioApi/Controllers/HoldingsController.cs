using Microsoft.AspNetCore.Mvc;
using PortfolioApi.DTOs;
using PortfolioApi.Services;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HoldingsController : ControllerBase
{
    private readonly IHoldingsService _holdingsService;

    public HoldingsController(IHoldingsService holdingsService)
    {
        _holdingsService = holdingsService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<HoldingResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<HoldingResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var holdings = await _holdingsService.GetAllAsync(cancellationToken);
        return Ok(holdings);
    }

    [HttpPost]
    [ProducesResponseType(typeof(HoldingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<HoldingResponse>> Create(
        [FromBody] AddHoldingRequest request,
        CancellationToken cancellationToken)
    {
        var holding = await _holdingsService.AddAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = holding.Id }, holding);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _holdingsService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
