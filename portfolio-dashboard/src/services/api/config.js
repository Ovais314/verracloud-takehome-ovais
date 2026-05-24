// Dev: same-origin `/api` (Vite proxy). Prod/preview: full API URL unless overridden.
export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5205');

export const HOLDINGS_POLL_INTERVAL_MS = 5000;
