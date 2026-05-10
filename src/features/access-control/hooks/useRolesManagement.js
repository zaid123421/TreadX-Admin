import { useCallback, useEffect, useState } from 'react';
import {
  createRole as createRoleApi,
  deleteRole as deleteRoleApi,
  fetchRoles,
} from '../services/accessControlApiService';

export function useRolesManagement() {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const loadRoles = useCallback(async () => {
    try {
      const data = await fetchRoles();
      setRoles(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const createRole = async () => {
    try {
      await createRoleApi({ name, isActive: true, permissionIds: [] });
      setName('');
      await loadRoles();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const deleteRole = async (id) => {
    try {
      await deleteRoleApi(id);
      await loadRoles();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return {
    roles,
    error,
    name,
    setName,
    createRole,
    deleteRole,
  };
}
