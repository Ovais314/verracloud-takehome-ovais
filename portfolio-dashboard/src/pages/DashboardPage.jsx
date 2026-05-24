import { useGetHoldingsQuery } from '../services/api/holdingsApi';
import { usePortfolioSummary } from '../hooks/usePortfolioSummary';
import { useHoldingsRealtime } from '../hooks/useHoldingsRealtime';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { AddHoldingForm } from '../components/AddHoldingForm';
import { HoldingsTable } from '../components/HoldingsTable';
import { LiveStatusBadge } from '../components/LiveStatusBadge';

export function DashboardPage() {
  const connectionStatus = useHoldingsRealtime();

  const holdingsQuery = useGetHoldingsQuery();

  const { data: holdings = [] } = holdingsQuery;
  const summary = usePortfolioSummary(holdings);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-row">
          <div>
            <h1 className="dashboard__title">Portfolio Holdings Dashboard</h1>
            <p className="dashboard__subtitle">
              Live positions — prices update on the server and push to your
              screen instantly
            </p>
          </div>
          <LiveStatusBadge status={connectionStatus} />
        </div>
      </header>

      <PortfolioSummary
        totalMarketValue={summary.totalMarketValue}
        totalUnrealizedPnL={summary.totalUnrealizedPnL}
        positionCount={summary.positionCount}
        isLoading={holdingsQuery.isLoading}
        isError={holdingsQuery.isError}
        errorMessage={
          holdingsQuery.error?.data?.message ??
          holdingsQuery.error?.error ??
          'Failed to load portfolio summary.'
        }
        onRetry={holdingsQuery.refetch}
      />

      <div className="dashboard__layout">
        <aside>
          <section className="panel">
            <header className="panel__header">
              <h2 className="panel__title">Add Holding</h2>
            </header>
            <div className="panel__body">
              <AddHoldingForm />
            </div>
          </section>
        </aside>

        <main>
          <section className="panel">
            <header className="panel__header">
              <h2 className="panel__title">Holdings</h2>
            </header>
            <div className="panel__body">
              <HoldingsTable
                holdingsQuery={holdingsQuery}
                connectionStatus={connectionStatus}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
