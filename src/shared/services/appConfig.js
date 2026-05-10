/** Client-side API configuration (Vite env). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:9003';

/** When true, logs extra request info in dev (set VITE_ENABLE_API_DEBUG=true). */
export const ENABLE_API_DEBUG =
  Boolean(import.meta.env.DEV) && import.meta.env.VITE_ENABLE_API_DEBUG === 'true';
