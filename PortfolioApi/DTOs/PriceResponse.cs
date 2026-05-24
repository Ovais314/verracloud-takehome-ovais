namespace PortfolioApi.DTOs;

public class PriceResponse
{
    public string Ticker { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}
