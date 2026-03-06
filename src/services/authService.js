import axios from 'axios';
import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/types/api';
import { USE_MOCK_DATA } from './apiClient';

// Use backend API base URL from environment (same as apiClient.js)
const API_BASE_URL = 'http://159.198.75.161:9003';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('treadx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('treadx_token');
      localStorage.removeItem('treadx_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    // Mock login for demo purposes
    // Replace with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (email === 'admin@treadx.com' && password === 'admin123') {
          resolve({
            data: {
              token: 'mock-jwt-token-admin',
              user: {
                id: '1',
                email: 'admin@treadx.com',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isActive: true
              }
            }
          });
        } else if (email === 'manager@treadx.com' && password === 'manager123') {
          resolve({
            data: {
              token: 'mock-jwt-token-manager',
              user: {
                id: '2',
                email: 'manager@treadx.com',
                firstName: 'Sales',
                lastName: 'Manager',
                role: 'manager',
                isActive: true
              }
            }
          });
        } else if (email === 'sales@treadx.com' && password === 'sales123') {
          resolve({
            data: {
              token: 'mock-jwt-token-sales',
              user: {
                id: '3',
                email: 'sales@treadx.com',
                firstName: 'Sales',
                lastName: 'Rep',
                role: 'sales_rep',
                isActive: true
              }
            }
          });
        } else {
          // If not mock credentials, try real API login
          try {
            console.log("Trying login using backend url: " , API_ENDPOINTS.LOGIN);
            console.log("the baseUrl is: ", apiClient.getUri);
          
            const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });            //  api.post('/auth/login', {
            //   email,
            //   password
            // });
            resolve(response);
          } catch (error) {
            reject(error);
          }
        }
      }, 1000);
    });
  },

  logout: async () => {
    // Mock logout
    return Promise.resolve();
  },

  refreshToken: async () => {
    // Mock token refresh
    return Promise.resolve({
      data: {
        token: 'new-mock-jwt-token'
      }
    });
  },

  getCurrentUser: async () => {
    if (USE_MOCK_DATA === 'true') {
    // Mock get current user
    const user = localStorage.getItem('treadx_user');
    if (user) {
      return Promise.resolve({
        data: JSON.parse(user)
      });
    }
    throw new Error('No user found');
    } else {
      // Real API call to fetch current user profile
      const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER);
      return response;
    }
  }
};

export default api;

