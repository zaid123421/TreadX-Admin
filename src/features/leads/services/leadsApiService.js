import apiClient, {
  createFormData,
  uploadConfig,
  buildPaginationParams,
  handleApiError,
  extractResponseData,
} from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

const buildLeadRequestPayload = (leadData = {}) => {
  const address = leadData.address || {};

  return {
    contactEmail: leadData.contactEmail,
    businessName: leadData.businessName,
    phoneNumber: leadData.phoneNumber,
    address: {
      streetName: leadData.streetName ?? address.streetName,
      streetNumber: leadData.streetNumber ?? address.streetNumber,
      postalCode: leadData.postalCode ?? address.postalCode,
      unitNumber: leadData.aptUnitBldg ?? address.unitNumber,
      specialInstructions: address.specialInstructions,
      cityId: leadData.cityId ?? address.cityId,
      stateId: leadData.stateId ?? address.stateId,
      countryId: leadData.countryId ?? address.countryId,
    },
    source: leadData.source,
    sourceUrl: leadData.sourceUrl,
    uploadedFile: leadData.uploadedFile,
    status: leadData.status,
    notes: leadData.notes,
    dealerId: leadData.dealerId ?? leadData.vendorId ?? null,
  };
};

export const leadsService = {
  getLeads: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.LEADS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch leads'));
    }
  },

  getLeadsByStatus: async (status, params = {}) => {
    try {
      const queryString = buildPaginationParams({ status, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.LEADS_BY_STATUS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch leads by status'));
    }
  },

  getMyLeads: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.MY_LEADS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch my leads'));
    }
  },

  getLead: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEAD_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch lead'));
    }
  },

  createLead: async (leadData, file = null) => {
    try {
      const payload = buildLeadRequestPayload(leadData);
      const formData = createFormData(payload, file);
      const response = await apiClient.post(API_ENDPOINTS.LEADS, formData, uploadConfig);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create lead'));
    }
  },

  updateLead: async (id, leadData, file = null) => {
    try {
      const payload = buildLeadRequestPayload(leadData);
      const formData = createFormData(payload, file);
      const response = await apiClient.put(API_ENDPOINTS.LEAD_BY_ID(id), formData, uploadConfig);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update lead'));
    }
  },

  updateLeadPartial: async (id, leadData, file = null) => {
    try {
      const payload = buildLeadRequestPayload(leadData);
      const formData = createFormData(payload, file);
      const response = await apiClient.patch(API_ENDPOINTS.LEAD_BY_ID(id), formData, uploadConfig);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update lead'));
    }
  },

  deleteLead: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.LEAD_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete lead'));
    }
  },

  validateLead: async (id, validationData) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.LEAD_VALIDATE(id)}`, validationData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to validate lead'));
    }
  },

  initiateContact: async (id, contactData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEAD_INITIATE_CONTACT(id), contactData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to initiate contact'));
    }
  },

  takeLead: async (id) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEAD_TAKE(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to take lead'));
    }
  },

  assignLead: async (id, agentId) => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.LEAD_ASSIGN(id)}?agentId=${agentId}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to assign lead'));
    }
  },

  getFilePreviewUrl: (id) => {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.LEAD_FILE_PREVIEW(id)}`;
  },

  getFileDownloadUrl: (id) => {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.LEAD_FILE_DOWNLOAD(id)}`;
  },

  downloadFile: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEAD_FILE_DOWNLOAD(id), {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to download file'));
    }
  },

  getLeadPreviewResponse: async (id) => {
    return apiClient.get(API_ENDPOINTS.LEAD_FILE_PREVIEW(id), {
      responseType: 'blob',
    });
  },

  getLeadDownloadResponse: async (id) => {
    return apiClient.get(API_ENDPOINTS.LEAD_FILE_DOWNLOAD(id), {
      responseType: 'blob',
    });
  },
};

export default leadsService;
