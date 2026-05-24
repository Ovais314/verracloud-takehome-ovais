export function HoldingsTablePagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  totalCount,
  onPageChange,
}) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <nav
      className="holdings-pagination"
      aria-label="Holdings table pagination"
    >
      <span className="holdings-pagination__range">
        {rangeStart}–{rangeEnd} of {totalCount}
      </span>

      <div className="holdings-pagination__controls">
        <button
          type="button"
          className="holdings-pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="holdings-pagination__page">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="holdings-pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
