import { PAGE_SIZE_OPTIONS, PNL_FILTER_OPTIONS } from '../hooks/useHoldingsTableControls';

export function HoldingsTableToolbar({
  search,
  onSearchChange,
  pnlFilter,
  onPnlFilterChange,
  pageSize,
  onPageSizeChange,
  totalCount,
  totalHoldings,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <div className="holdings-toolbar">
      <p className="holdings-toolbar__count" aria-live="polite">
        Showing <strong>{totalCount}</strong> of <strong>{totalHoldings}</strong>{' '}
        positions
        {hasActiveFilters ? ' (filtered)' : ''}
      </p>

      <div className="holdings-toolbar__filters">
        <label className="holdings-toolbar__control">
          <span className="holdings-toolbar__label">Ticker</span>
          <input
            type="search"
            className="holdings-toolbar__input"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Filter holdings by ticker"
          />
        </label>

        <label className="holdings-toolbar__control">
          <span className="holdings-toolbar__label">P&amp;L</span>
          <div className="holdings-toolbar__select-wrap">
            <select
              className="holdings-toolbar__select"
              value={pnlFilter}
              onChange={(e) => onPnlFilterChange(e.target.value)}
              aria-label="Filter by profit or loss"
            >
              {PNL_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="holdings-toolbar__control holdings-toolbar__control--narrow">
          <span className="holdings-toolbar__label">Rows</span>
          <div className="holdings-toolbar__select-wrap">
            <select
              className="holdings-toolbar__select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            className="holdings-toolbar__clear"
            onClick={onClearFilters}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
