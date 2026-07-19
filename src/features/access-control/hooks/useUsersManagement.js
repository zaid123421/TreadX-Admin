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
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  fetchUser,
  fetchUsers,
  fetchRoles,
  fetchPermissions,
} from '../services/accessControlApiService';
import {
  validateCreateUserForm,
  validateUpdateUserForm,
  buildCreateUserPayload,
  buildUpdateUserPayload,
  mapCreateUserError,
  mapUpdateUserError,
  mapUserToForm,
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
  const [editOpen, setEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [saving, setSaving] = useState(false);

  const canUpdate = canDeleteOrUpdateUsers(user);
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
      const list = Array.isArray(data) ? data : [];
      // Sales Manager may only see Sales Agents
      const scoped = managerAgentOnly
        ? list.filter((u) => {
            const name =
              typeof u.role === 'object' ? u.role?.name : u.role || u.roleName;
            return name === 'SALES_AGENT';
          })
        : list;
      setUsers(scoped);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }, [managerAgentOnly]);

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
    setEditingUserId(null);
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

  const openEditModal = useCallback(
    async (userRow) => {
      if (!canUpdate || !userRow?.id) return;
      setFieldErrors({});
      setError('');
      setEditingUserId(userRow.id);
      setForm(mapUserToForm(userRow));
      setEditOpen(true);

      try {
        const detail = await fetchUser(userRow.id);
        if (detail) setForm(mapUserToForm(detail));
      } catch (err) {
        // List row data is enough to edit; detail fetch is best-effort
        console.warn('Failed to load user detail for edit:', err);
      }
    },
    [canUpdate]
  );

  const setEditModalOpen = useCallback((open) => {
    setEditOpen(open);
    if (!open) {
      setFieldErrors({});
      setError('');
      setEditingUserId(null);
      setForm(emptyForm());
    }
  }, []);

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
      setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async () => {
    if (!canUpdate || editingUserId == null) {
      toast.error('Only a System Administrator can update users.');
      return;
    }
    setFieldErrors({});
    setError('');
    const validation = validateUpdateUserForm(form);
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      return;
    }
    try {
      setSaving(true);
      const payload = buildUpdateUserPayload(form, {
        includePermissions: isSystemAdmin,
      });
      await updateUserApi(editingUserId, payload);
      toast.success('User updated successfully');
      setEditModalOpen(false);
      await loadUsers();
    } catch (err) {
      const message = mapUpdateUserError(err);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id) => {
    if (!canDelete) {
      toast.error('Only a System Administrator can delete users.');
      return;
    }
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

  useEffect(() => {
    if (managerAgentOnly) {
      setRoleFilter('SALES_AGENT');
    }
  }, [managerAgentOnly]);

  const filteredUsers = useMemo(() => {
    const roleNameOf = (u) =>
      typeof u.role === 'object' ? u.role?.name : u.role || u.roleName;

    if (managerAgentOnly) {
      const agentsOnly = users.filter((u) => roleNameOf(u) === 'SALES_AGENT');
      if (roleFilter === 'all' || roleFilter === 'SALES_AGENT') return agentsOnly;
      return agentsOnly.filter((u) => roleNameOf(u) === roleFilter);
    }
    if (roleFilter === 'all') return users;
    return users.filter((u) => roleNameOf(u) === roleFilter);
  }, [users, roleFilter, managerAgentOnly]);

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
    updateUser,
    deleteUser,
    canDelete,
    canUpdate,
    canCreate,
    managerAgentOnly,
    isSystemAdmin,
    roleFilter,
    setRoleFilter,
    createOpen,
    openCreateModal,
    setCreateModalOpen,
    editOpen,
    openEditModal,
    setEditModalOpen,
    editingUserId,
    saving,
    togglePermission,
  };
}
