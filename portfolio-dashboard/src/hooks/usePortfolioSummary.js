import { useMemo } from 'react';

export function usePortfolioSummary(holdings) {
  return useMemo(() => {
    const positions = holdings ?? [];

    const totalMarketValue = positions.reduce(
      (sum, h) => sum + Number(h.marketValue ?? 0),
      0,
    );

    const totalUnrealizedPnL = positions.reduce(
      (sum, h) => sum + Number(h.unrealizedPnL ?? 0),
      0,
    );

    return {
      totalMarketValue,
      totalUnrealizedPnL,
      positionCount: positions.length,
    };
  }, [holdings]);
}
