import apiClient from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export const fetchUsers = async () => {
  const response = await apiClient.get(API_ENDPOINTS.USERS);
  return asList(response.data);
};

export const createUser = async (payload) => {
  await apiClient.post(API_ENDPOINTS.USERS, payload);
};

export const fetchUser = async (id) => {
  const response = await apiClient.get(API_ENDPOINTS.USER_BY_ID(id));
  return response.data;
};

export const updateUser = async (id, payload) => {
  await apiClient.put(API_ENDPOINTS.USER_BY_ID(id), payload);
};

export const deleteUser = async (id) => {
  await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
};

export const fetchRoles = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ROLES);
  return asList(response.data);
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

/** @param {{ email: string }} payload */
export const forgotPassword = async (payload) => {
  const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, payload);
  return response.data;
};
