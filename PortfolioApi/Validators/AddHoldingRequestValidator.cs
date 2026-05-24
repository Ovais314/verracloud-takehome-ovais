using FluentValidation;
using PortfolioApi.DTOs;

namespace PortfolioApi.Validators;

public class AddHoldingRequestValidator : AbstractValidator<AddHoldingRequest>
{
    public AddHoldingRequestValidator()
    {
        RuleFor(x => x.Ticker)
            .NotEmpty()
            .WithMessage("Ticker is required.")
            .MaximumLength(10)
            .WithMessage("Ticker must not exceed 10 characters.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than zero.");

        RuleFor(x => x.PurchasePrice)
            .GreaterThan(0)
            .WithMessage("Purchase price must be greater than zero.");
    }
}
