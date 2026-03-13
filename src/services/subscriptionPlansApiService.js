import apiClient, { 
  buildPaginationParams, 
  buildQueryParams,
  handleApiError, 
  extractResponseData,
  USE_MOCK_DATA 
} from './apiClient';
import { API_ENDPOINTS } from '../types/api';

// Mock data for development
const mockSubscriptionPlans = [
  {
    id: 1,
    planName: 'Basic Plan',
    description: 'Perfect for small tire shops',
    price: 29.99,
    billingCycle: 'MONTHLY',
    maxTireStorage: 1000,
    maxUsers: 5,
    features: [
      'Basic tire inventory management',
      'Up to 5 user accounts',
      'Email support',
      'Basic reporting'
    ],
    isActive: true
  },
  {
    id: 2,
    planName: 'Professional Plan',
    description: 'Ideal for growing businesses',
    price: 79.99,
    billingCycle: 'MONTHLY',
    maxTireStorage: 5000,
    maxUsers: 15,
    features: [
      'Advanced tire inventory management',
      'Up to 15 user accounts',
      'Priority support',
      'Advanced reporting & analytics',
      'API access',
      'Custom integrations'
    ],
    isActive: true
  },
  {
    id: 3,
    planName: 'Enterprise Plan',
    description: 'For large tire distribution networks',
    price: 199.99,
    billingCycle: 'MONTHLY',
    maxTireStorage: 25000,
    maxUsers: 50,
    features: [
      'Unlimited tire inventory management',
      'Up to 50 user accounts',
      '24/7 dedicated support',
      'Advanced analytics & insights',
      'Full API access',
      'Custom integrations',
      'White-label options',
      'Dedicated account manager'
    ],
    isActive: true
  }
];

// Real API service functions
const realSubscriptionPlansService = {
  // Get all active subscription plans with pagination
  getActiveSubscriptionPlans: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscription plans'));
    }
  },

  // Get all subscription plans (including inactive)
  getAllSubscriptionPlans: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscription plans'));
    }
  },

  // Get single subscription plan by ID
  getSubscriptionPlan: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch subscription plan'));
    }
  },

  // Create new subscription plan
  createSubscriptionPlan: async (planData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION_PLANS, planData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create subscription plan'));
    }
  },

  // Update existing subscription plan
  updateSubscriptionPlan: async (id, planData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(id), planData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update subscription plan'));
    }
  },

  // Delete subscription plan
  deleteSubscriptionPlan: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete subscription plan'));
    }
  }
};

// Mock service for development
const mockSubscriptionPlansService = {
  getActiveSubscriptionPlans: async (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredPlans = mockSubscriptionPlans.filter(plan => plan.isActive);
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredPlans = filteredPlans.filter(plan => 
            plan.planName.toLowerCase().includes(searchLower) ||
            plan.description.toLowerCase().includes(searchLower)
          );
        }
        
        const page = params.page || 0;
        const size = params.size || 10;
        const start = page * size;
        const end = start + size;
        
        resolve({
          content: filteredPlans.slice(start, end),
          totalElements: filteredPlans.length,
          totalPages: Math.ceil(filteredPlans.length / size),
          size: size,
          number: page,
          first: page === 0,
          last: end >= filteredPlans.length,
          numberOfElements: Math.min(size, filteredPlans.length - start),
          empty: filteredPlans.length === 0
        });
      }, 500);
    });
  },

  getAllSubscriptionPlans: async (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredPlans = [...mockSubscriptionPlans];
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredPlans = filteredPlans.filter(plan => 
            plan.planName.toLowerCase().includes(searchLower) ||
            plan.description.toLowerCase().includes(searchLower)
          );
        }
        
        const page = params.page || 0;
        const size = params.size || 10;
        const start = page * size;
        const end = start + size;
        
        resolve({
          content: filteredPlans.slice(start, end),
          totalElements: filteredPlans.length,
          totalPages: Math.ceil(filteredPlans.length / size),
          size: size,
          number: page,
          first: page === 0,
          last: end >= filteredPlans.length,
          numberOfElements: Math.min(size, filteredPlans.length - start),
          empty: filteredPlans.length === 0
        });
      }, 500);
    });
  },

  getSubscriptionPlan: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const plan = mockSubscriptionPlans.find(p => p.id === parseInt(id));
        if (plan) {
          resolve(plan);
        } else {
          reject(new Error('Subscription plan not found'));
        }
      }, 300);
    });
  },

  createSubscriptionPlan: async (planData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPlan = {
          ...planData,
          id: Date.now(),
          isActive: true
        };
        mockSubscriptionPlans.unshift(newPlan);
        resolve(newPlan);
      }, 500);
    });
  },

  updateSubscriptionPlan: async (id, planData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSubscriptionPlans.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          mockSubscriptionPlans[index] = {
            ...mockSubscriptionPlans[index],
            ...planData
          };
          resolve(mockSubscriptionPlans[index]);
        } else {
          reject(new Error('Subscription plan not found'));
        }
      }, 500);
    });
  },

  deleteSubscriptionPlan: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockSubscriptionPlans.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
          mockSubscriptionPlans.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error('Subscription plan not found'));
        }
      }, 300);
    });
  }
};

// Export the real service
export const subscriptionPlansService = realSubscriptionPlansService;
export default subscriptionPlansService; 