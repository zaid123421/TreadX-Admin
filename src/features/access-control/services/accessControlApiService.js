import apiClient from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

export const fetchUsers = async () => {
  const response = await apiClient.get(API_ENDPOINTS.USERS);
  return response.data || [];
};

export const createUser = async (payload) => {
  await apiClient.post(API_ENDPOINTS.USERS, payload);
};

export const deleteUser = async (id) => {
  await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
};

export const fetchRoles = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ROLES);
  return response.data || [];
};

/** @returns {Promise<Array<{ id: number, name?: string, description?: string }>>} */
export const fetchPermissions = async () => {
  const response = await apiClient.get(API_ENDPOINTS.PERMISSIONS);
  return Array.isArray(response.data) ? response.data : [];
};

export const createRole = async (payload) => {
  await apiClient.post(API_ENDPOINTS.ROLES, payload);
};

export const deleteRole = async (id) => {
  await apiClient.delete(API_ENDPOINTS.ROLE_BY_ID(id));
};

export const changePassword = async (payload) => {
  await apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, payload);
};
