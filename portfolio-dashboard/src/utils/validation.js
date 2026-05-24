const TICKER_PATTERN = /^[A-Za-z0-9.-]+$/;

export function validateHoldingForm({ ticker, quantity, purchasePrice }) {
  const errors = {};

  const trimmedTicker = ticker?.trim() ?? '';

  if (!trimmedTicker) {
    errors.ticker = 'Ticker is required.';
  } else if (trimmedTicker.length > 10) {
    errors.ticker = 'Ticker must not exceed 10 characters.';
  } else if (!TICKER_PATTERN.test(trimmedTicker)) {
    errors.ticker = 'Ticker contains invalid characters.';
  }

  const qty = Number(quantity);
  if (quantity === '' || quantity == null) {
    errors.quantity = 'Quantity is required.';
  } else if (Number.isNaN(qty) || qty <= 0) {
    errors.quantity = 'Quantity must be greater than zero.';
  }

  const price = Number(purchasePrice);
  if (purchasePrice === '' || purchasePrice == null) {
    errors.purchasePrice = 'Purchase price is required.';
  } else if (Number.isNaN(price) || price <= 0) {
    errors.purchasePrice = 'Purchase price must be greater than zero.';
  }

  return errors;
}

export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}
