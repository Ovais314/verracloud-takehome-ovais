namespace PortfolioApi.DTOs;

public class AddHoldingRequest
{
    public string Ticker { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
}
