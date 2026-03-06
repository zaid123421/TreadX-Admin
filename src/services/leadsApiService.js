import apiClient, { 
  createFormData, 
  uploadConfig, 
  buildPaginationParams, 
  handleApiError, 
  extractResponseData,
  USE_MOCK_DATA 
} from './apiClient';
import { API_ENDPOINTS, LeadStatus, LeadSource, ContactMethod } from '../types/api';

// Mock data for development (keeping existing mock data structure)
const mockLeads = [
  {
    id: 1,
    businessName: 'Swift Logistics Inc.',
    phoneNumber: '+1-555-0123',
    streetNumber: '123',
    streetName: 'Main Street',
    aptUnitBldg: 'Suite 100',
    postalCode: 'M5V 3A8',
    city: 'Toronto',
    province: 'Ontario',
    country: 'Canada',
    formattedAddress: '123 Main Street, Suite 100, M5V 3A8, Toronto, Ontario, Canada',
    source: LeadSource.GOVERNMENT,
    sourceUrl: 'https://government-database.com/business/123',
    status: LeadStatus.CONTACTED,
    notes: 'Large commercial fleet, interested in bulk tire orders',
    vendorId: null,
    createdAt: [2025, 7, 28, 13, 3, 4, 45037000],
    updatedAt: [2025, 7, 28, 14, 8, 40, 963168000],
    addedBy: 3,
    addedByName: 'Platform Admin',
    lastModifiedBy: 52,
    lastModifiedByName: 'Ahmad Lounitch',
    validatedBy: 3,
    validatedByFirstName: 'Platform',
    validatedByLastName: 'Admin',
    validatedAt: [2025, 7, 28, 13, 10, 33, 570598000],
    contactMethod: ContactMethod.PHONE,
    contactMethodDetails: '+1-555-0123',
    contactName: 'John Smith',
    position: 'Fleet Manager',
    addedByManager: false,
    assignedTo: null,
    assignedToFirstName: null,
    assignedToLastName: null
  },
  {
    id: 2,
    businessName: 'City Auto Repair',
    phoneNumber: '+1-555-0456',
    streetNumber: '456',
    streetName: 'Oak Avenue',
    aptUnitBldg: '',
    postalCode: 'L4C 2N8',
    city: 'Brampton',
    province: 'Ontario',
    country: 'Canada',
    formattedAddress: '456 Oak Avenue, L4C 2N8, Brampton, Ontario, Canada',
    source: LeadSource.ADS,
    sourceUrl: 'https://ads-platform.com/lead/456',
    status: LeadStatus.PENDING,
    notes: 'Small auto repair shop, potential for regular tire orders',
    vendorId: null,
    createdAt: [2025, 7, 28, 12, 0, 0, 0],
    updatedAt: [2025, 7, 28, 12, 0, 0, 0],
    addedBy: 1,
    addedByName: 'Sales Manager',
    lastModifiedBy: null,
    lastModifiedByName: null,
    validatedBy: null,
    validatedByFirstName: null,
    validatedByLastName: null,
    validatedAt: null,
    contactMethod: null,
    contactMethodDetails: '',
    contactName: '',
    position: '',
    addedByManager: true,
    assignedTo: null,
    assignedToFirstName: null,
    assignedToLastName: null
  },
  {
    id: 3,
    businessName: 'Metro Transport Solutions',
    phoneNumber: '+1-555-0789',
    streetNumber: '789',
    streetName: 'Industrial Blvd',
    aptUnitBldg: 'Building C',
    postalCode: 'K1A 0A6',
    city: 'Ottawa',
    province: 'Ontario',
    country: 'Canada',
    formattedAddress: '789 Industrial Blvd, Building C, K1A 0A6, Ottawa, Ontario, Canada',
    source: LeadSource.GOVERNMENT,
    sourceUrl: 'https://government-database.com/business/789',
    status: LeadStatus.APPROVED,
    notes: 'Transportation company with large fleet, high-value opportunity',
    vendorId: null,
    createdAt: [2025, 7, 28, 10, 0, 0, 0],
    updatedAt: [2025, 7, 28, 11, 30, 0, 0],
    addedBy: 3,
    addedByName: 'Platform Admin',
    lastModifiedBy: 52,
    lastModifiedByName: 'Ahmad Lounitch',
    validatedBy: 3,
    validatedByFirstName: 'Platform',
    validatedByLastName: 'Admin',
    validatedAt: [2025, 7, 28, 10, 30, 0, 0],
    contactMethod: ContactMethod.MAIL_EMAIL,
    contactMethodDetails: 'procurement@metrotransport.com',
    contactName: 'Sarah Johnson',
    position: 'Procurement Manager',
    addedByManager: false,
    assignedTo: 'agent-1',
    assignedToFirstName: 'Ahmad',
    assignedToLastName: 'Lounitch',
    assignedAt: [2025, 7, 28, 11, 45, 0, 0]
  }
];

// Real API service functions
const realLeadsService = {
  // Get all leads with pagination and filters
  getLeads: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.LEADS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch leads'));
    }
  },

  // Get leads by status
  getLeadsByStatus: async (status, params = {}) => {
    try {
      const queryString = buildPaginationParams({ status, ...params });
      const response = await apiClient.get(`${API_ENDPOINTS.LEADS_BY_STATUS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch leads by status'));
    }
  },

  // Get my leads (for agents)
  getMyLeads: async (params = {}) => {
    try {
      const queryString = buildPaginationParams(params);
      const response = await apiClient.get(`${API_ENDPOINTS.MY_LEADS}?${queryString}`);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch my leads'));
    }
  },

  // Get single lead by ID
  getLead: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEAD_BY_ID(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch lead'));
    }
  },

  // Create new lead
  createLead: async (leadData, file = null) => {
    try {
      const formData = createFormData(leadData, file);
      const response = await apiClient.post(API_ENDPOINTS.LEADS, formData, uploadConfig);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create lead'));
    }
  },

  // Update existing lead
  updateLead: async (id, leadData, file = null) => {
    try {
      const formData = createFormData(leadData, file);
      const response = await apiClient.put(API_ENDPOINTS.LEAD_BY_ID(id), formData, uploadConfig);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update lead'));
    }
  },

  // Partially update lead
  updateLeadPartial: async (id, leadData, file = null) => {
    try {
      const formData = createFormData(leadData, file);
      const response = await apiClient.patch(API_ENDPOINTS.LEAD_BY_ID(id), formData, uploadConfig);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update lead'));
    }
  },

  // Delete lead
  deleteLead: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.LEAD_BY_ID(id));
      return { success: true };
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete lead'));
    }
  },

  // Validate lead (approve/deny)
  validateLead: async (id, validationData) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.LEAD_VALIDATE(id)}`, validationData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to validate lead'));
    }
  },

  // Initiate contact for lead
  initiateContact: async (id, contactData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEAD_INITIATE_CONTACT(id), contactData);
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to initiate contact'));
    }
  },

  // Take lead (assign to current user)
  takeLead: async (id) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LEAD_TAKE(id));
      return extractResponseData(response);
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to take lead'));
    }
  },

  // Get file preview URL
  getFilePreviewUrl: (id) => {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.LEAD_FILE_PREVIEW(id)}`;
  },

  // Get file download URL
  getFileDownloadUrl: (id) => {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.LEAD_FILE_DOWNLOAD(id)}`;
  },

  // Download file
  downloadFile: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.LEAD_FILE_DOWNLOAD(id), {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to download file'));
    }
  }
};

// Mock service for development
const mockLeadsService = {
  getLeads: async (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredLeads = [...mockLeads];
        
        if (params.status) {
          filteredLeads = filteredLeads.filter(lead => lead.status === params.status);
        }
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredLeads = filteredLeads.filter(lead => 
            lead.businessName.toLowerCase().includes(searchLower) ||
            lead.phoneNumber.includes(searchLower) ||
            lead.notes.toLowerCase().includes(searchLower)
          );
        }
        
        const page = params.page || 0;
        const size = params.size || 10;
        const start = page * size;
        const end = start + size;
        
        resolve({
          content: filteredLeads.slice(start, end),
          totalElements: filteredLeads.length,
          totalPages: Math.ceil(filteredLeads.length / size),
          size: size,
          number: page,
          first: page === 0,
          last: end >= filteredLeads.length,
          numberOfElements: Math.min(size, filteredLeads.length - start),
          empty: filteredLeads.length === 0
        });
      }, 500);
    });
  },

  getLeadsByStatus: async (status, params = {}) => {
    return mockLeadsService.getLeads({ status, ...params });
  },

  getMyLeads: async (params = {}) => {
    // For mock service, return the same as getLeads
    return mockLeadsService.getLeads(params);
  },

  getLead: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lead = mockLeads.find(l => l.id === parseInt(id));
        if (lead) {
          resolve(lead);
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  createLead: async (leadData, file = null) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLead = {
          ...leadData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          uploadedFile: file ? file.name : null
        };
        mockLeads.unshift(newLead);
        resolve(newLead);
      }, 500);
    });
  },

  updateLead: async (id, leadData, file = null) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === parseInt(id));
        if (index !== -1) {
          mockLeads[index] = {
            ...mockLeads[index],
            ...leadData,
            updatedAt: new Date().toISOString(),
            uploadedFile: file ? file.name : mockLeads[index].uploadedFile
          };
          resolve(mockLeads[index]);
        } else {
          reject(new Error('Lead not found'));
        }
      }, 500);
    });
  },

  updateLeadPartial: async (id, leadData, file = null) => {
    return mockLeadsService.updateLead(id, leadData, file);
  },

  deleteLead: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === parseInt(id));
        if (index !== -1) {
          mockLeads.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  validateLead: async (id, validationData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === parseInt(id));
        if (index !== -1) {
          mockLeads[index] = {
            ...mockLeads[index],
            status: validationData.status,
            notes: validationData.notes || mockLeads[index].notes,
            updatedAt: new Date().toISOString(),
            validatedAt: new Date().toISOString(),
            validatedBy: 1,
            validatedByFirstName: 'Admin',
            validatedByLastName: 'User'
          };
          resolve(mockLeads[index]);
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  initiateContact: async (id, contactData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === parseInt(id));
        if (index !== -1) {
          mockLeads[index] = {
            ...mockLeads[index],
            status: LeadStatus.CONTACTED,
            contactMethod: contactData.contactMethod,
            contactMethodDetails: contactData.contactMethodDetails,
            extensionNumber: contactData.extensionNumber,
            contactName: contactData.contactName,
            position: contactData.position,
            updatedAt: new Date().toISOString()
          };
          resolve(mockLeads[index]);
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  takeLead: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === parseInt(id));
        if (index !== -1) {
          mockLeads[index] = {
            ...mockLeads[index],
            assignedTo: 'current-user-id', // Mock assignment to current user
            updatedAt: new Date().toISOString()
          };
          resolve(mockLeads[index]);
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  getFilePreviewUrl: (id) => {
    return `#preview-${id}`;
  },

  getFileDownloadUrl: (id) => {
    return `#download-${id}`;
  },

  downloadFile: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const blob = new Blob(['Mock file content'], { type: 'text/plain' });
        resolve(blob);
      }, 300);
    });
  }
};

// Export the appropriate service based on environment
export const leadsService = USE_MOCK_DATA === 'true' ? mockLeadsService : realLeadsService;
export default leadsService;

