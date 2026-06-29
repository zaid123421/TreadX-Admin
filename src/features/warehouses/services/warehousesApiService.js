import apiClient, { handleApiError, extractResponseData } from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

function normalizeWarehouseList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export const warehousesService = {
  getWarehouses: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WMS_WAREHOUSES);
      return normalizeWarehouseList(extractResponseData(response));
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch warehouses'));
    }
  },

  createWarehouse: async (payload) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WMS_WAREHOUSES, payload);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to provision warehouse'));
    }
  },

  updateWarehouse: async (id, payload) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.WMS_WAREHOUSE_BY_ID(id), payload);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update warehouse'));
    }
  },

  updateWarehouseStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.WMS_WAREHOUSE_STATUS(id), { status });
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update warehouse status'));
    }
  },

  deleteWarehouse: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.WMS_WAREHOUSE_BY_ID(id));
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete warehouse'));
    }
  },
};
