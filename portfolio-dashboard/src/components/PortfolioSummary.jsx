import { formatCurrency, pnlClassName } from '../utils/format';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export function PortfolioSummary({
  totalMarketValue,
  totalUnrealizedPnL,
  positionCount,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load portfolio summary.',
  onRetry,
}) {
  if (isLoading) {
    return (
      <section className="summary-bar summary-bar--state" aria-label="Portfolio summary">
        <LoadingState message="Loading portfolio summary…" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="summary-bar summary-bar--state" aria-label="Portfolio summary">
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </section>
    );
  }

  return (
    <section className="summary-bar" aria-label="Portfolio summary">
      <div className="summary-bar__item">
        <span className="summary-bar__label">Total Market Value</span>
        <span className="summary-bar__value">
          {formatCurrency(totalMarketValue)}
        </span>
      </div>
      <div className="summary-bar__item">
        <span className="summary-bar__label">Total Unrealized P&amp;L</span>
        <span
          className={`summary-bar__value ${pnlClassName(totalUnrealizedPnL)}`}
        >
          {formatCurrency(totalUnrealizedPnL)}
        </span>
      </div>
      <div className="summary-bar__item">
        <span className="summary-bar__label">Positions</span>
        <span className="summary-bar__value">{positionCount}</span>
      </div>
    </section>
  );
}
