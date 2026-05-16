import apiClient, {
  handleApiError,
  extractResponseData,
  buildPaginationParams,
} from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

export const conversionRequestsService = {
  /**
   * Fetch assigned pending conversion requests
   * GET /conversion-requests/assigned/pending
   */
  getAssignedPendingRequests: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(
        `${API_ENDPOINTS.CONVERSION_REQUESTS_ENDPOINT}?${queryString}`
      );
      return extractResponseData(response);
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Failed to fetch conversion requests')
      );
    }
  },

// تفعيل أو إنشاء طلب التحويل للـ Lead مع الملاحظات
  createConversionRequestForLead: async (leadId, requestNotes) => {
    try {
      // السيرفر يتوقع الـ Body كـ JSON يحتوي على حقل requestNotes
      const requestBody = {
        requestNotes: requestNotes
      };

      const response = await apiClient.post(
        API_ENDPOINTS.CONVERSION_REQUEST_CREATE(leadId), // أو إذا كان لديكِ كائن الـ API_ENDPOINTS يمكنكِ صياغته هناك
        requestBody
      );
      
      return extractResponseData(response);
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Failed to create conversion request for lead')
      );
    }
  },


  /**
   * Make a decision on a conversion request (approve/reject)
   * PUT /conversion-requests/:requestId/decision
   */
  makeDecision: async (requestId, decisionData) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.CONVERSION_REQUEST_DECISION(requestId),
        decisionData
      );
      return extractResponseData(response);
    } catch (error) {
      throw new Error(
        handleApiError(error, 'Failed to process conversion request decision')
      );
    }
  },
};
