const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return '—';
  }
  return currencyFormatter.format(Number(value));
}

export function formatQuantity(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return '—';
  }
  return quantityFormatter.format(Number(value));
}

export function pnlClassName(value) {
  const num = Number(value);
  if (Number.isNaN(num) || num === 0) {
    return 'pnl-neutral';
  }
  return num > 0 ? 'pnl-positive' : 'pnl-negative';
}
