import apiClient, { USE_MOCK_DATA } from './apiClient';
import { API_ENDPOINTS } from '@/types/api';

export const authService = {
  login: async (email, password) => {
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
          try {
            const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
            resolve(response);
          } catch (error) {
            reject(error);
          }
        }
      }, 1000);
    });
  },

  logout: async () => {
    return Promise.resolve();
  },

  refreshToken: async () => {
    return Promise.resolve({
      data: {
        token: 'new-mock-jwt-token'
      }
    });
  },

  getCurrentUser: async () => {
    if (USE_MOCK_DATA === 'true') {
      const user = localStorage.getItem('treadx_user');
      if (user) {
        return Promise.resolve({
          data: JSON.parse(user)
        });
      }
      throw new Error('No user found');
    } else {
      const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER);
      return response;
    }
  }
};

export default apiClient;
