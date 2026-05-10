import apiClient, {
  buildPaginationParams,
  handleApiError,
  extractResponseData,
} from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

export const subscriptionPlansService = {
  getActiveSubscriptionPlans: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscription plans'));
    }
  },

  getAllSubscriptionPlans: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscription plans'));
    }
  },

  getSubscriptionPlan: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscription plan'));
    }
  },

  createSubscriptionPlan: async (planData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION_PLANS, planData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create subscription plan'));
    }
  },

  updateSubscriptionPlan: async (id, planData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(id), planData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update subscription plan'));
    }
  },

  deleteSubscriptionPlan: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete subscription plan'));
    }
  },
};

export default subscriptionPlansService;
