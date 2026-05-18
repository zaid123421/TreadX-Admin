import apiClient, {
  buildPaginationParams,
  handleApiError,
  extractResponseData,
} from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

const mapDealerRolesToDealerRoles = (userRoles = {}) => ({
  DEALER_ADMIN: userRoles.DEALER_ADMIN || userRoles.DEALER_ADMIN || 0,
  DEALER_TECHNICIAN: userRoles.DEALER_TECHNICIAN || userRoles.DEALER_TECHNICIAN || 0,
});

export const dealersService = {
  getDealers: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.DEALERS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch dealers'));
    }
  },

  getDealersByStatus: async (status, params = {}) => {
    try {
      const queryString = buildPaginationParams({ status, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.DEALERS_BY_STATUS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch dealers by status'));
    }
  },

  searchDealers: async (query, params = {}) => {
    try {
      const queryString = buildPaginationParams({ query, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.DEALERS_SEARCH}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to search dealers'));
    }
  },

  getDealer: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DEALER_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch dealer'));
    }
  },

  createDealer: async (dealerData) => {
    try {
      const isEnhancedFlow = Boolean(
        dealerData.subscriptionPlanId &&
          dealerData.adminFirstName &&
          dealerData.adminLastName &&
          dealerData.adminEmail
      );

      if (isEnhancedFlow) {
        const payload = {
          leadId: dealerData.leadId,
          legalName: dealerData.legalName,
          businessName: dealerData.businessName,
          streetNumber: dealerData.streetNumber,
          streetName: dealerData.streetName,
          aptUnitBldg: dealerData.aptUnitBldg,
          postalCode: dealerData.postalCode,
          email: dealerData.email,
          phoneNumber: dealerData.phoneNumber,
          status: dealerData.status,
          totalUsers: dealerData.totalUsers,
          userRoles: mapDealerRolesToDealerRoles(dealerData.userRoles),
          subscriptionPlanId: dealerData.subscriptionPlanId,
          autoRenew: dealerData.autoRenew ?? true,
          adminFirstName: dealerData.adminFirstName,
          adminLastName: dealerData.adminLastName,
          adminEmail: dealerData.adminEmail,
        };

      // 👇 هون بالضبط حط الطباعة
      console.log("🚀 CREATE DEALER PAYLOAD:", payload);
      console.log("📦 RAW dealerData:", dealerData);

        const response = await apiClient.post(API_ENDPOINTS.ENHANCED_DEALERS_CREATE, payload);
        return extractResponseData(response);
      }

      const response = await apiClient.post(API_ENDPOINTS.DEALERS, {
        ...dealerData,
        userRoles: mapDealerRolesToDealerRoles(dealerData.userRoles),
      });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create dealer'));
    }
  },

  updateDealer: async (id, dealerData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.DEALER_BY_ID(id), dealerData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update dealer'));
    }
  },

  updateDealerPartial: async (id, dealerData) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.DEALER_BY_ID(id), dealerData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update dealer'));
    }
  },

  deleteDealer: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.DEALER_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete dealer'));
    }
  },
};

export default dealersService;
