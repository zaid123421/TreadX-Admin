import apiClient from './apiClient';
import { API_ENDPOINTS } from './endpoints';

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getRoleName(entity) {
  if (!entity) return '';
  if (typeof entity.role === 'object' && entity.role !== null) {
    return entity.role.name || '';
  }
  return entity.role || entity.roleName || '';
}

/**
 * Users with SALES_AGENT role (for lead assignment UI).
 */
export const fetchSalesAgents = async () => {
  const response = await apiClient.get(API_ENDPOINTS.USERS);
  const users = asList(response.data);
  return users.filter((u) => getRoleName(u) === 'SALES_AGENT');
};
