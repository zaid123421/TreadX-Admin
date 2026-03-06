// Development configuration
export const DEV_CONFIG = {
  // Set to true to use mock data, false to use real API
  USE_MOCK_DATA: false,
  
  // API base URL for real API calls
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9003',
  
  // Development features
  SHOW_DEV_INDICATOR: false,
  ENABLE_DEBUG_LOGGING: true,
  
  // Mock data settings
  MOCK_DELAY: 500, // Simulate API delay in milliseconds
  MOCK_ERROR_RATE: 0, // 0 = no errors, 0.1 = 10% error rate
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

// Helper function to get API configuration
export const getApiConfig = () => {
  return {
    useMockData: DEV_CONFIG.USE_MOCK_DATA,
    baseUrl: DEV_CONFIG.API_BASE_URL,
    mockDelay: DEV_CONFIG.MOCK_DELAY,
  };
}; 