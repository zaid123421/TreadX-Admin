import apiClient from './apiClient';

/**
 * Users with SALES_AGENT role (for lead assignment UI).
 */
export const fetchSalesAgents = async () => {
  const response = await apiClient.get('/users');
  const users = response.data || [];
  return users.filter((u) => {
    const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
    return roleName === 'SALES_AGENT';
  });
};
