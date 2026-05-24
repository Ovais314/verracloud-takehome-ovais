import { API_BASE_URL } from '../api/config';

/** Hub path on the API (proxied in Vite dev). */
export const PORTFOLIO_HUB_PATH = '/hubs/portfolio';

export const HOLDINGS_UPDATED_EVENT = 'HoldingsUpdated';

export function getPortfolioHubUrl() {
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${PORTFOLIO_HUB_PATH}`;
}
