import { useState } from 'react';
import { useDeleteHoldingMutation } from '../services/api/holdingsApi';
import { useHoldingsTableControls } from '../hooks/useHoldingsTableControls';
import { formatCurrency, formatQuantity, pnlClassName } from '../utils/format';
import { parseApiError } from '../utils/errors';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { HoldingsTableToolbar } from './HoldingsTableToolbar';
import { HoldingsTablePagination } from './HoldingsTablePagination';

const LIVE_STATUS_HINT = {
  connected: 'Updates pushed from server (SignalR)',
  connecting: 'Connecting for live updates…',
  reconnecting: 'Reconnecting…',
  disconnected: 'Live updates unavailable — refresh the page',
};

const COLUMNS = [
  { id: 'ticker', label: 'Ticker', sortable: true },
  { id: 'quantity', label: 'Quantity', sortable: true },
  { id: 'purchasePrice', label: 'Purchase Price', sortable: true },
  { id: 'currentPrice', label: 'Current Price', sortable: true },
  { id: 'marketValue', label: 'Market Value', sortable: true },
  { id: 'unrealizedPnL', label: 'Unrealized P&L', sortable: true },
];

function SortIndicator({ column, sortBy, sortDir }) {
  if (sortBy !== column) {
    return <span className="sort-indicator sort-indicator--idle" aria-hidden="true">↕</span>;
  }
  return (
    <span className="sort-indicator" aria-hidden="true">
      {sortDir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export function HoldingsTable({ holdingsQuery, connectionStatus = 'disconnected' }) {
  const {
    data: holdings = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = holdingsQuery;

  const controls = useHoldingsTableControls(holdings);

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

  const isEmptyPortfolio = controls.totalHoldings === 0;

  return (
    <div className="holdings-panel">
      <div className="holdings-panel__meta">
        <span className="holdings-panel__refresh">
          {isFetching ? 'Updating…' : LIVE_STATUS_HINT[connectionStatus]}
        </span>
      </div>

      {deleteError && (
        <div className="holdings-panel__alert" role="alert">
          {deleteError}
        </div>
      )}

      {isEmptyPortfolio ? (
        <p className="empty-state">
          No positions yet. Add a holding using the form.
        </p>
      ) : (
        <>
          <HoldingsTableToolbar
            search={controls.search}
            onSearchChange={controls.setSearch}
            pnlFilter={controls.pnlFilter}
            onPnlFilterChange={controls.setPnlFilter}
            pageSize={controls.pageSize}
            onPageSizeChange={controls.setPageSize}
            totalCount={controls.totalCount}
            totalHoldings={controls.totalHoldings}
            hasActiveFilters={controls.hasActiveFilters}
            onClearFilters={controls.clearFilters}
          />

          {controls.totalCount === 0 ? (
            <p className="empty-state">
              No holdings match your filters.{' '}
              <button
                type="button"
                className="empty-state__link"
                onClick={controls.clearFilters}
              >
                Clear filters
              </button>
            </p>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="holdings-table">
                  <thead>
                    <tr>
                      {COLUMNS.map((col) => (
                        <th key={col.id} scope="col">
                          {col.sortable ? (
                            <button
                              type="button"
                              className="holdings-table__sort-btn"
                              onClick={() => controls.setSort(col.id)}
                              aria-sort={
                                controls.sortBy === col.id
                                  ? controls.sortDir === 'asc'
                                    ? 'ascending'
                                    : 'descending'
                                  : 'none'
                              }
                            >
                              {col.label}
                              <SortIndicator
                                column={col.id}
                                sortBy={controls.sortBy}
                                sortDir={controls.sortDir}
                              />
                            </button>
                          ) : (
                            col.label
                          )}
                        </th>
                      ))}
                      <th scope="col">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.pageItems.map((holding) => {
                      const isRowDeleting =
                        isDeleting && deletingId === holding.id;

                      return (
                        <tr key={holding.id}>
                          <td className="holdings-table__ticker">
                            {holding.ticker}
                          </td>
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

              <HoldingsTablePagination
                page={controls.page}
                totalPages={controls.totalPages}
                rangeStart={controls.rangeStart}
                rangeEnd={controls.rangeEnd}
                totalCount={controls.totalCount}
                onPageChange={controls.setPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
