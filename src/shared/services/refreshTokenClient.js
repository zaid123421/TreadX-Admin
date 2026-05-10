/**
 * Auth API contract (align with backend OpenAPI; adjust if your server differs).
 *
 * Login (POST /auth/login): typical fields include access token as
 * `accessToken` | `token` | `access_token`, refresh as `refreshToken` | `refresh_token`.
 * AuthContext persists `treadx_token` and `treadx_refresh_token` from these.
 *
 * Refresh (POST /auth/refresh): request body uses the shape from
 * {@link buildRefreshRequestBody}. Response may return new tokens under
 * `accessToken` | `token` | `access_token` and optionally rotated refresh
 * `refreshToken` | `refresh_token`.
 *
 * Expired access token: backends usually return HTTP 401. Many return HTTP 403
 * with a generic body (e.g. message "Forbidden") when the JWT is expired.
 *
 * - By default we attempt refresh on **403** as well as 401 (see
 *   `VITE_AUTH_REFRESH_ON_403` to opt out).
 * - If you disable that, only `VITE_AUTH_REFRESH_403_CODES` (comma-separated)
 *   matches on `code` / `errorCode` / `message` / `error` trigger refresh on 403.
 */

import { API_ENDPOINTS } from './endpoints';

/** Fired on successful silent refresh so AuthContext can sync `token`. */
export const AUTH_TOKENS_REFRESHED_EVENT = 'treadx:auth:tokens-refreshed';

/** @param {string} refreshTokenValue */
export function buildRefreshRequestBody(refreshTokenValue) {
  return { refreshToken: refreshTokenValue };
}

/**
 * Extracts access + optional refresh from refresh endpoint JSON.
 * @param {Record<string, unknown>} data
 * @returns {{ accessToken: string|null, refreshToken: string|null }}
 */
export function parseTokensFromRefreshResponse(data) {
  if (!data || typeof data !== 'object') {
    return { accessToken: null, refreshToken: null };
  }
  const accessToken =
    data.accessToken ??
    data.token ??
    data.access_token ??
    null;
  const refreshToken =
    data.refreshToken ??
    data.refresh_token ??
    null;
  return {
    accessToken: accessToken ?? null,
    refreshToken: refreshToken ?? null,
  };
}

function parseRefresh403Codes() {
  const raw = import.meta.env.VITE_AUTH_REFRESH_403_CODES || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Default true: treat 403 like 401 for silent refresh (many APIs use 403 for expired JWT). */
function isAuthRefreshOn403Enabled() {
  const v = import.meta.env.VITE_AUTH_REFRESH_ON_403;
  if (v === 'false' || v === '0') return false;
  return true;
}

/**
 * Whether a failed response should trigger refresh flow (401 always; 403 when
 * enabled globally or when body matches `VITE_AUTH_REFRESH_403_CODES`).
 * @param {number|undefined} status
 * @param {unknown} responseData
 */
export function shouldAttemptTokenRefresh(status, responseData) {
  if (status === 401) return true;
  if (status !== 403) return false;

  if (isAuthRefreshOn403Enabled()) {
    return true;
  }

  const codes = parseRefresh403Codes();
  if (codes.length === 0) return false;

  const d =
    responseData && typeof responseData === 'object' ? responseData : {};
  const code = d.code ?? d.errorCode ?? d.error ?? d.message ?? '';
  const codeStr = code != null ? String(code) : '';

  return codes.some((c) => {
    if (!c) return false;
    if (c === codeStr) return true;
    if (codeStr && codeStr.includes(c)) return true;
    return false;
  });
}

/**
 * @param {import('axios').AxiosInstance} axiosInstance
 * @param {string} storedRefreshToken
 */
export async function executeRefreshRequest(axiosInstance, storedRefreshToken) {
  const response = await axiosInstance.post(
    API_ENDPOINTS.REFRESH,
    buildRefreshRequestBody(storedRefreshToken)
  );
  return parseTokensFromRefreshResponse(response.data);
}
