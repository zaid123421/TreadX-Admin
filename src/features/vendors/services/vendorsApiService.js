import apiClient, {
  buildPaginationParams,
  handleApiError,
  extractResponseData,
} from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

const mapVendorRolesToDealerRoles = (userRoles = {}) => ({
  DEALER_ADMIN: userRoles.DEALER_ADMIN || userRoles.VENDOR_ADMIN || 0,
  DEALER_TECHNICIAN: userRoles.DEALER_TECHNICIAN || userRoles.VENDOR_TECHNICIAN || 0,
});

export const vendorsService = {
  getVendors: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.VENDORS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vendors'));
    }
  },

  getVendorsByStatus: async (status, params = {}) => {
    try {
      const queryString = buildPaginationParams({ status, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.VENDORS_BY_STATUS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vendors by status'));
    }
  },

  searchVendors: async (query, params = {}) => {
    try {
      const queryString = buildPaginationParams({ query, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.VENDORS_SEARCH}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to search vendors'));
    }
  },

  getVendor: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VENDOR_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vendor'));
    }
  },

  createVendor: async (vendorData) => {
    try {
      const isEnhancedFlow = Boolean(
        vendorData.subscriptionPlanId &&
          vendorData.adminFirstName &&
          vendorData.adminLastName &&
          vendorData.adminEmail
      );

      if (isEnhancedFlow) {
        const payload = {
          leadId: vendorData.leadId,
          legalName: vendorData.legalName,
          businessName: vendorData.businessName,
          streetNumber: vendorData.streetNumber,
          streetName: vendorData.streetName,
          aptUnitBldg: vendorData.aptUnitBldg,
          postalCode: vendorData.postalCode,
          email: vendorData.email,
          phoneNumber: vendorData.phoneNumber,
          status: vendorData.status,
          totalUsers: vendorData.totalUsers,
          userRoles: mapVendorRolesToDealerRoles(vendorData.userRoles),
          subscriptionPlanId: vendorData.subscriptionPlanId,
          autoRenew: vendorData.autoRenew ?? true,
          adminFirstName: vendorData.adminFirstName,
          adminLastName: vendorData.adminLastName,
          adminEmail: vendorData.adminEmail,
        };

      // 👇 هون بالضبط حط الطباعة
      console.log("🚀 CREATE VENDOR PAYLOAD:", payload);
      console.log("📦 RAW vendorData:", vendorData);

        const response = await apiClient.post(API_ENDPOINTS.ENHANCED_VENDORS_CREATE, payload);
        return extractResponseData(response);
      }

      const response = await apiClient.post(API_ENDPOINTS.VENDORS, {
        ...vendorData,
        userRoles: mapVendorRolesToDealerRoles(vendorData.userRoles),
      });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create vendor'));
    }
  },

  updateVendor: async (id, vendorData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.VENDOR_BY_ID(id), vendorData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update vendor'));
    }
  },

  updateVendorPartial: async (id, vendorData) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.VENDOR_BY_ID(id), vendorData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update vendor'));
    }
  },

  deleteVendor: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.VENDOR_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete vendor'));
    }
  },
};

export default vendorsService;
