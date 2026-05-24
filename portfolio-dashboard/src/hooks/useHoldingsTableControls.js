import { useEffect, useMemo, useState } from 'react';

export const PAGE_SIZE_OPTIONS = [5, 10, 25];
export const DEFAULT_PAGE_SIZE = 10;

export const PNL_FILTER_OPTIONS = [
  { value: 'all', label: 'All P&L' },
  { value: 'profit', label: 'Profit only' },
  { value: 'loss', label: 'Loss only' },
  { value: 'flat', label: 'Breakeven' },
];

const SORT_COLUMNS = {
  ticker: (h) => h.ticker?.toUpperCase() ?? '',
  quantity: (h) => Number(h.quantity),
  purchasePrice: (h) => Number(h.purchasePrice),
  currentPrice: (h) => Number(h.currentPrice),
  marketValue: (h) => Number(h.marketValue),
  unrealizedPnL: (h) => Number(h.unrealizedPnL),
};

function matchesPnlFilter(holding, pnlFilter) {
  const pnl = Number(holding.unrealizedPnL);
  switch (pnlFilter) {
    case 'profit':
      return pnl > 0;
    case 'loss':
      return pnl < 0;
    case 'flat':
      return pnl === 0;
    default:
      return true;
  }
}

/**
 * Client-side filter, sort, and pagination on the holdings cache.
 * Fine for small portfolios; at scale, move query params to GET /api/holdings
 * and refetch when filters change (SignalR would notify "data changed" only).
 */
export function useHoldingsTableControls(holdings) {
  const [search, setSearch] = useState('');
  const [pnlFilter, setPnlFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ticker');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    const term = search.trim().toUpperCase();
    return (holdings ?? []).filter((h) => {
      if (term && !h.ticker?.toUpperCase().includes(term)) {
        return false;
      }
      return matchesPnlFilter(h, pnlFilter);
    });
  }, [holdings, search, pnlFilter]);

  const sorted = useMemo(() => {
    const accessor = SORT_COLUMNS[sortBy] ?? SORT_COLUMNS.ticker;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av < bv) {
        return sortDir === 'asc' ? -1 : 1;
      }
      if (av > bv) {
        return sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);

  useEffect(() => {
    setPage(1);
  }, [search, pnlFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const setSort = (column) => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPnlFilter('all');
    setPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || pnlFilter !== 'all';

  return {
    search,
    setSearch,
    pnlFilter,
    setPnlFilter,
    pageSize,
    setPageSize,
    page: safePage,
    setPage,
    totalPages,
    totalCount,
    totalHoldings: holdings?.length ?? 0,
    pageItems,
    rangeStart,
    rangeEnd,
    sortBy,
    sortDir,
    setSort,
    clearFilters,
    hasActiveFilters,
  };
}
