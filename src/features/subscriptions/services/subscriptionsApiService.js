import apiClient, { buildPaginationParams, extractResponseData, handleApiError } from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/types/api';

export const subscriptionsService = {
  getSubscriptions: async (params = {}) => {
    try {
      const query = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.SUBSCRIPTIONS}?${query}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscriptions'));
    }
  },

  getSubscription: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscription'));
    }
  },

  getActiveSubscriptionByDealer: async (dealerId) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ACTIVE_SUBSCRIPTION_BY_DEALER(dealerId));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch active subscription'));
    }
  },

  createSubscription: async (payload) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS, payload);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create subscription'));
    }
  },

  updateSubscription: async (id, payload) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUBSCRIPTION_BY_ID(id), payload);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update subscription'));
    }
  },

  cancelSubscription: async (id, reason = '') => {
    try {
      const encodedReason = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      const response = await apiClient.post(`${API_ENDPOINTS.SUBSCRIPTION_CANCEL(id)}${encodedReason}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to cancel subscription'));
    }
  },

  deleteSubscription: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.SUBSCRIPTION_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete subscription'));
    }
  }
};

export default subscriptionsService;
