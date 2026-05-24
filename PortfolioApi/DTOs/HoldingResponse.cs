namespace PortfolioApi.DTOs;

public class HoldingResponse
{
    public int Id { get; set; }
    public string Ticker { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal MarketValue { get; set; }
    public decimal UnrealizedPnL { get; set; }
}
