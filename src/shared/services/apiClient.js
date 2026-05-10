import axios from 'axios';
import { API_BASE_URL, ENABLE_API_DEBUG } from './appConfig';
import {
  AUTH_TOKENS_REFRESHED_EVENT,
  executeRefreshRequest,
  shouldAttemptTokenRefresh,
} from './refreshTokenClient';
import { API_ENDPOINTS } from './endpoints';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Single in-flight refresh so concurrent 401s share one POST /auth/refresh. */
let refreshInFlight = null;

function clearSessionAndRedirectToLogin() {
  localStorage.removeItem('treadx_token');
  localStorage.removeItem('treadx_user');
  localStorage.removeItem('treadx_refresh_token');
  localStorage.removeItem('treadx_territory_code');
  window.location.href = '/login';
}

function getSharedRefreshPromise() {
  const rt = localStorage.getItem('treadx_refresh_token');
  if (!rt) {
    return Promise.reject(new Error('No refresh token'));
  }
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const tokens = await executeRefreshRequest(apiClient, rt);
      if (!tokens.accessToken) {
        throw new Error('No access token in refresh response');
      }
      localStorage.setItem('treadx_token', tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem('treadx_refresh_token', tokens.refreshToken);
      }
      window.dispatchEvent(
        new CustomEvent(AUTH_TOKENS_REFRESHED_EVENT, {
          detail: { accessToken: tokens.accessToken },
        })
      );
      return tokens;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

apiClient.interceptors.request.use(
  (config) => {
    const isAuthRequest =
      config.url &&
      (config.url.includes(API_ENDPOINTS.LOGIN) ||
        config.url.includes(API_ENDPOINTS.REFRESH));

    if (isAuthRequest) {
      if (ENABLE_API_DEBUG) {
        const finalUrl = `${config.baseURL ?? API_BASE_URL}${config.url}`;
        console.debug('[apiClient] auth finalUrl:', finalUrl);
      }
      return config;
    }
    const token = localStorage.getItem('treadx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const responseData = error.response?.data;
    const isRefreshRequest = originalRequest?.url?.includes(API_ENDPOINTS.REFRESH);

    const canTryRefresh =
      originalRequest &&
      !isRefreshRequest &&
      !originalRequest._retry &&
      shouldAttemptTokenRefresh(status, responseData);

    if (canTryRefresh) {
      originalRequest._retry = true;
      const storedRefreshToken = localStorage.getItem('treadx_refresh_token');
      if (!storedRefreshToken) {
        clearSessionAndRedirectToLogin();
        return Promise.reject(error);
      }
      try {
        await getSharedRefreshPromise();
        const access = localStorage.getItem('treadx_token');
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch {
        clearSessionAndRedirectToLogin();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      console.error('Access denied - insufficient permissions');
    }

    if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export const createFormData = (data, file = null) => {
  const formData = new FormData();

  formData.append(
    'lead',
    new Blob([JSON.stringify(data)], {
      type: 'application/json',
    })
  );

  if (file) {
    formData.append('file', file);
  }

  return formData;
};

export const uploadConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

export const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
};

export const buildPaginationParams = ({
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  direction = 'desc',
  ...filters
}) => {
  return buildQueryParams({
    page,
    size,
    sortBy,
    direction,
    ...filters,
  });
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};

export const extractResponseData = (response) => {
  return response.data;
};

export default apiClient;
