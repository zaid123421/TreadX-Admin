import apiClient, { 
  buildPaginationParams, 
  buildQueryParams,
  handleApiError, 
  extractResponseData,
  USE_MOCK_DATA 
} from './apiClient';
import { API_ENDPOINTS, VendorStatus } from '../types/api';

// Mock data for development
const mockVendors = [
  {
    id: 1,
    legalName: 'Michelin North America Inc.',
    businessName: 'Michelin Tires',
    email: 'contact@michelin.com',
    phoneNumber: '+1-800-MICHELIN',
    vendorUniqueId: '0010100011',
    status: VendorStatus.ACTIVE,
    streetNumber: '1',
    streetName: 'Parkway South',
    aptUnitBldg: '',
    postalCode: '29615',
    totalUsers: 8,
    userRoles: {
      VENDOR_ADMIN: 2,
      VENDOR_EMPLOYEE: 4,
      VENDOR_TECHNICIAN: 2
    }
  },
  {
    id: 2,
    legalName: 'Bridgestone Americas Inc.',
    businessName: 'Bridgestone',
    email: 'info@bridgestone.com',
    phoneNumber: '+1-800-BRIDGESTONE',
    vendorUniqueId: '0010100012',
    status: VendorStatus.ACTIVE,
    streetNumber: '200',
    streetName: '4th Avenue South',
    aptUnitBldg: '',
    postalCode: '37201',
    totalUsers: 12,
    userRoles: {
      VENDOR_ADMIN: 3,
      VENDOR_EMPLOYEE: 6,
      VENDOR_TECHNICIAN: 3
    }
  },
  {
    id: 3,
    legalName: 'Continental Tire Canada Inc.',
    businessName: 'Continental Tire',
    email: 'sales@continental-tire.com',
    phoneNumber: '+1-800-CONTI-TIRE',
    vendorUniqueId: '0010100013',
    status: VendorStatus.ACTIVE,
    streetNumber: '1830',
    streetName: 'MacMillan Park Drive',
    aptUnitBldg: '',
    postalCode: '29707',
    totalUsers: 15,
    userRoles: {
      VENDOR_ADMIN: 4,
      VENDOR_EMPLOYEE: 8,
      VENDOR_TECHNICIAN: 3
    }
  },
  {
    id: 4,
    legalName: 'TirePlus Distribution Ltd.',
    businessName: 'TirePlus',
    email: 'orders@tireplus.com',
    phoneNumber: '+1-555-TIRES',
    vendorUniqueId: '0010100014',
    status: VendorStatus.INACTIVE,
    streetNumber: '500',
    streetName: 'Industrial Blvd',
    aptUnitBldg: 'Unit 12',
    postalCode: '30309',
    totalUsers: 5,
    userRoles: {
      VENDOR_ADMIN: 1,
      VENDOR_EMPLOYEE: 3,
      VENDOR_TECHNICIAN: 1
    }
  }
];

// Real API service functions
const realVendorsService = {
  // Get all vendors with pagination and filters
  getVendors: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.VENDORS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vendors'));
    }
  },

  // Get vendors by status
  getVendorsByStatus: async (status, params = {}) => {
    try {
      const queryString = buildPaginationParams({ status, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.VENDORS_BY_STATUS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vendors by status'));
    }
  },

  // Search vendors
  searchVendors: async (query, params = {}) => {
    try {
      const queryString = buildPaginationParams({ query, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.VENDORS_SEARCH}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to search vendors'));
    }
  },

  // Get single vendor by ID
  getVendor: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VENDOR_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vendor'));
    }
  },

  // Create new vendor
  createVendor: async (vendorData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.VENDORS, vendorData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create vendor'));
    }
  },

  // Update existing vendor
  updateVendor: async (id, vendorData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.VENDOR_BY_ID(id), vendorData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update vendor'));
    }
  },

  // Partially update vendor
  updateVendorPartial: async (id, vendorData) => {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.VENDOR_BY_ID(id), vendorData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update vendor'));
    }
  },

  // Delete vendor
  deleteVendor: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.VENDOR_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete vendor'));
    }
  }
};

// Mock service for development
const mockVendorsService = {
  getVendors: async (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredVendors = [...mockVendors];
        
        if (params.status) {
          filteredVendors = filteredVendors.filter(vendor => vendor.status === params.status);
        }
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredVendors = filteredVendors.filter(vendor => 
            vendor.legalName.toLowerCase().includes(searchLower) ||
            vendor.businessName.toLowerCase().includes(searchLower) ||
            vendor.email.toLowerCase().includes(searchLower) ||
            vendor.phoneNumber.toLowerCase().includes(searchLower)
          );
        }
        
        const page = params.page || 0;
        const size = params.size || 10;
        const start = page * size;
        const end = start + size;
        
        resolve({
          content: filteredVendors.slice(start, end),
          totalElements: filteredVendors.length,
          totalPages: Math.ceil(filteredVendors.length / size),
          size: size,
          number: page,
          first: page === 0,
          last: end >= filteredVendors.length,
          numberOfElements: Math.min(size, filteredVendors.length - start),
          empty: filteredVendors.length === 0
        });
      }, 500);
    });
  },

  getVendorsByStatus: async (status, params = {}) => {
    return mockVendorsService.getVendors({ status, ...params });
  },

  searchVendors: async (query, params = {}) => {
    return mockVendorsService.getVendors({ search: query, ...params });
  },

  getVendor: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vendor = mockVendors.find(v => v.id === parseInt(id));
        if (vendor) {
          resolve(vendor);
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 300);
    });
  },

  createVendor: async (vendorData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVendor = {
          ...vendorData,
          id: Date.now(),
          vendorUniqueId: `VND-${Date.now()}`
        };
        mockVendors.unshift(newVendor);
        resolve(newVendor);
      }, 500);
    });
  },

  updateVendor: async (id, vendorData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockVendors.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
          mockVendors[index] = {
            ...mockVendors[index],
            ...vendorData
          };
          resolve(mockVendors[index]);
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 500);
    });
  },

  updateVendorPartial: async (id, vendorData) => {
    return mockVendorsService.updateVendor(id, vendorData);
  },

  deleteVendor: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockVendors.findIndex(v => v.id === parseInt(id));
        if (index !== -1) {
          mockVendors.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 300);
    });
  }
};

// Export the real service
export const vendorsService = realVendorsService;
export default vendorsService;

