import { useState } from 'react';
import { useDeleteHoldingMutation } from '../services/api/holdingsApi';
import { formatCurrency, formatQuantity, pnlClassName } from '../utils/format';
import { parseApiError } from '../utils/errors';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export function HoldingsTable({ holdingsQuery }) {
  const {
    data: holdings = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = holdingsQuery;

  const [deleteHolding, { isLoading: isDeleting, originalArgs: deletingId }] =
    useDeleteHoldingMutation();
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this holding from the portfolio?')) {
      return;
    }

    setDeleteError('');

    try {
      await deleteHolding(id).unwrap();
    } catch (err) {
      const { message } = parseApiError(err);
      setDeleteError(message);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    const message =
      error?.data?.message ??
      error?.error ??
      'Failed to load holdings. Is the API running?';
    return <ErrorState message={message} onRetry={refetch} />;
  }

  return (
    <div className="holdings-panel">
      <div className="holdings-panel__meta">
        <span className="holdings-panel__refresh">
          {isFetching ? 'Refreshing…' : 'Auto-refresh every 5s'}
        </span>
      </div>

      {deleteError && (
        <div className="holdings-panel__alert" role="alert">
          {deleteError}
        </div>
      )}

      {holdings.length === 0 ? (
        <p className="empty-state">
          No positions yet. Add a holding using the form.
        </p>
      ) : (
        <div className="table-wrapper">
          <table className="holdings-table">
            <thead>
              <tr>
                <th scope="col">Ticker</th>
                <th scope="col">Quantity</th>
                <th scope="col">Purchase Price</th>
                <th scope="col">Current Price</th>
                <th scope="col">Market Value</th>
                <th scope="col">Unrealized P&amp;L</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const isRowDeleting =
                  isDeleting && deletingId === holding.id;

                return (
                  <tr key={holding.id}>
                    <td className="holdings-table__ticker">{holding.ticker}</td>
                    <td className="holdings-table__numeric">
                      {formatQuantity(holding.quantity)}
                    </td>
                    <td className="holdings-table__numeric">
                      {formatCurrency(holding.purchasePrice)}
                    </td>
                    <td className="holdings-table__numeric">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="holdings-table__numeric">
                      {formatCurrency(holding.marketValue)}
                    </td>
                    <td
                      className={`holdings-table__numeric ${pnlClassName(holding.unrealizedPnL)}`}
                    >
                      {formatCurrency(holding.unrealizedPnL)}
                    </td>
                    <td className="holdings-table__actions">
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleDelete(holding.id)}
                        disabled={isRowDeleting}
                        aria-label={`Delete ${holding.ticker} holding`}
                      >
                        {isRowDeleting ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
