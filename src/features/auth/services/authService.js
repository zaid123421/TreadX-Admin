import apiClient from '@/shared/services/apiClient';
import {
  executeRefreshRequest,
} from '@/shared/services/refreshTokenClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });

      // توحيد شكل token حسب ما يعيده الـ backend (قد يكون token أو accessToken)
      const token =
        response.data?.token ??
        response.data?.accessToken ??
        response.data?.access_token ??
        null;

      // دع باقي طبقات الـ auth تتعامل مع response المبسطة
      return {
        ...response.data,
        token,
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch {
      // Best-effort logout on server; local cleanup is handled by AuthContext.
    }
    return true;
  },

  refreshToken: async (refreshTokenValue) => {
    return executeRefreshRequest(apiClient, refreshTokenValue);
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default apiClient;
