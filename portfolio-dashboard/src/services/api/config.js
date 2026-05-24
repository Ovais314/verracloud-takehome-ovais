// Dev: same-origin `/api` and `/hubs` (Vite proxy). Prod: set VITE_API_BASE_URL.
export const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5205');
