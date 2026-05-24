namespace PortfolioApi.Models;

public class Price
{
    public string Ticker { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}
