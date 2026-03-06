import axios from 'axios';
import { DEV_CONFIG } from '../config/development';

// Use backend API base URL from environment
const API_BASE_URL = DEV_CONFIG.API_BASE_URL;
// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token and territory header
apiClient.interceptors.request.use(
  (config) => {
    // Do not attach token for login endpoint
    if (config.url && config.url.includes('/api/v1/users/login')) {
      return config;
    }
    const token = localStorage.getItem('treadx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add territory header if available
    const territoryCode = localStorage.getItem('treadx_territory_code');
    if (territoryCode) {
      config.headers['X-Territory-Code'] = territoryCode;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and common responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('treadx_token');
      localStorage.removeItem('treadx_user');
      localStorage.removeItem('treadx_territory_code');
      window.location.href = '/login';
    }
    
    // Handle common error responses
    if (error.response?.status === 403) {
      console.error('Access denied - insufficient permissions');
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle multipart form data
export const createFormData = (data, file = null) => {
  const formData = new FormData();
  
  // Add the main data as JSON
  formData.append('lead', new Blob([JSON.stringify(data)], {
    type: 'application/json'
  }));
  
  // Add file if provided
  if (file) {
    formData.append('file', file);
  }
  
  return formData;
};

// Helper function for file uploads
export const uploadConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

// Helper function to build query parameters
export const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Helper function for paginated requests
export const buildPaginationParams = ({
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  direction = 'desc',
  ...filters
}) => {
  return buildQueryParams({
    page,
    size,
    sortBy,
    direction,
    ...filters
  });
};

// Error handling helper
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

// Success response helper
export const extractResponseData = (response) => {
  return response.data;
};

// Mock data flag for development
export const USE_MOCK_DATA = DEV_CONFIG.USE_MOCK_DATA;

export default apiClient;

