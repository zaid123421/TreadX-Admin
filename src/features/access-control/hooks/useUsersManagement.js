import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/AuthContext';
import {
  canCreateUser,
  canDeleteOrUpdateUsers,
  isSalesManagerLimitedToAgentCreation,
} from '@/shared/access/roleMatrix';
import {
  createUser as createUserApi,
  deleteUser as deleteUserApi,
  fetchUsers,
  fetchRoles,
  fetchPermissions,
} from '../services/accessControlApiService';
import {
  validateCreateUserForm,
  buildCreateUserPayload,
  mapCreateUserError,
} from '../utils/userAccountForm';

const emptyForm = () => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roleId: '',
  position: '',
  active: true,
  permissionIds: [],
});

export function useUsersManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [roleFilter, setRoleFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const canDelete = canDeleteOrUpdateUsers(user);
  const canCreate = canCreateUser(user);
  const managerAgentOnly = isSalesManagerLimitedToAgentCreation(user);
  const isSystemAdmin = user?.roleName === 'SYSTEM_ADMIN';

  const rolesForSelect = useMemo(() => {
    if (managerAgentOnly) {
      return roles.filter((r) => {
        const name = typeof r === 'object' && r !== null ? r.name : r;
        return name === 'SALES_AGENT';
      });
    }
    return roles;
  }, [roles, managerAgentOnly]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRoles();
        if (!cancelled) setRoles(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRoles([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSystemAdmin) {
      setPermissions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPermissions();
        if (!cancelled) setPermissions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setPermissions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSystemAdmin]);

  useEffect(() => {
    if (!managerAgentOnly || rolesForSelect.length !== 1) return;
    const r = rolesForSelect[0];
    const id = typeof r === 'object' && r !== null ? r.id : r;
    if (id != null) {
      setForm((p) => ({ ...p, roleId: String(id) }));
    }
  }, [managerAgentOnly, rolesForSelect]);

  const resetFormAfterCreate = useCallback(() => {
    if (managerAgentOnly && rolesForSelect.length >= 1) {
      const r = rolesForSelect[0];
      const rid = typeof r === 'object' && r !== null ? r.id : r;
      setForm({ ...emptyForm(), roleId: rid != null ? String(rid) : '' });
    } else {
      setForm(emptyForm());
    }
  }, [managerAgentOnly, rolesForSelect]);

  const openCreateModal = useCallback(() => {
    setFieldErrors({});
    setError('');
    resetFormAfterCreate();
    setCreateOpen(true);
  }, [resetFormAfterCreate]);

  const setCreateModalOpen = useCallback(
    (open) => {
      setCreateOpen(open);
      if (!open) {
        setFieldErrors({});
        setError('');
        resetFormAfterCreate();
      }
    },
    [resetFormAfterCreate]
  );

  const togglePermission = useCallback((permissionId) => {
    const id = Number(permissionId);
    setForm((p) => {
      const next = new Set(p.permissionIds || []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...p, permissionIds: [...next] };
    });
  }, []);

  const createUser = async () => {
    setFieldErrors({});
    setError('');
    const validation = validateCreateUserForm(form);
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      return;
    }
    try {
      const payload = buildCreateUserPayload(form, {
        includePermissions: isSystemAdmin,
      });
      await createUserApi(payload);
      toast.success('User created successfully');
      setCreateModalOpen(false);
      await loadUsers();
    } catch (err) {
      const message = mapCreateUserError(err);
      setError(message);
      toast.error(message);
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserApi(id);
      toast.success('User removed');
      await loadUsers();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete';
      setError(message);
      toast.error(message);
    }
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') return users;
    return users.filter((u) => {
      const name = typeof u.role === 'object' ? u.role?.name : u.role;
      return name === roleFilter;
    });
  }, [users, roleFilter]);

  return {
    users,
    filteredUsers,
    roles,
    rolesForSelect,
    permissions,
    error,
    form,
    setForm,
    fieldErrors,
    createUser,
    deleteUser,
    canDelete,
    canCreate,
    managerAgentOnly,
    isSystemAdmin,
    roleFilter,
    setRoleFilter,
    createOpen,
    openCreateModal,
    setCreateModalOpen,
    togglePermission,
  };
}
