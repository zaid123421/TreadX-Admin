/**
 * Validation & payload helpers aligned with Account Creation Technical Guide (POST /users)
 * and Update User (PUT /users/{id}).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const v = (email || '').trim();
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
  return null;
}

/** Minimum strength: 8+ chars, upper, lower, digit (matches typical strong-password examples). */
export function validatePassword(password) {
  const p = password || '';
  if (p.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(p)) return 'Password must include a lowercase letter';
  if (!/[A-Z]/.test(p)) return 'Password must include an uppercase letter';
  if (!/[0-9]/.test(p)) return 'Password must include a number';
  return null;
}

export function validateRequiredName(value, label) {
  const v = (value || '').trim();
  if (!v) return `${label} is required`;
  return null;
}

export function validateRoleId(roleId) {
  if (roleId === '' || roleId == null || Number.isNaN(Number(roleId))) {
    return 'Select a role';
  }
  return null;
}

/**
 * @param {object} form
 * @param {string} form.email
 * @param {string} form.password
 * @param {string} form.firstName
 * @param {string} form.lastName
 * @param {string|number} form.roleId
 * @param {string} [form.position]
 * @param {boolean} [form.active]
 * @param {number[]} [form.permissionIds]
 * @returns {{ ok: true } | { ok: false, errors: Record<string, string> }}
 */
export function validateCreateUserForm(form) {
  const errors = {};
  const e = validateEmail(form.email);
  if (e) errors.email = e;
  const pw = validatePassword(form.password);
  if (pw) errors.password = pw;
  const fn = validateRequiredName(form.firstName, 'First name');
  if (fn) errors.firstName = fn;
  const ln = validateRequiredName(form.lastName, 'Last name');
  if (ln) errors.lastName = ln;
  const r = validateRoleId(form.roleId);
  if (r) errors.roleId = r;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

/**
 * Update validation — same as create but password is not required.
 */
export function validateUpdateUserForm(form) {
  const errors = {};
  const e = validateEmail(form.email);
  if (e) errors.email = e;
  const fn = validateRequiredName(form.firstName, 'First name');
  if (fn) errors.firstName = fn;
  const ln = validateRequiredName(form.lastName, 'Last name');
  if (ln) errors.lastName = ln;
  const r = validateRoleId(form.roleId);
  if (r) errors.roleId = r;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

/**
 * Builds JSON body for POST /api/v1/users per technical guide.
 * @param {object} form
 * @param {{ includePermissions: boolean }} options
 */
export function buildCreateUserPayload(form, { includePermissions = false } = {}) {
  const payload = {
    email: form.email.trim(),
    password: form.password,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    roleId: Number(form.roleId),
    active: form.active !== false,
  };
  const pos = (form.position || '').trim();
  if (pos) payload.position = pos;
  if (includePermissions && Array.isArray(form.permissionIds) && form.permissionIds.length > 0) {
    payload.permissionIds = [...form.permissionIds];
  }
  return payload;
}

/**
 * Builds JSON body for PUT /api/v1/users/{id}.
 * @param {object} form
 * @param {{ includePermissions: boolean }} options
 */
export function buildUpdateUserPayload(form, { includePermissions = false } = {}) {
  const payload = {
    email: form.email.trim(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    roleId: Number(form.roleId),
    position: (form.position || '').trim(),
    active: form.active !== false,
  };
  if (includePermissions) {
    payload.permissionIds = Array.isArray(form.permissionIds)
      ? form.permissionIds.map(Number).filter((id) => !Number.isNaN(id))
      : [];
  }
  return payload;
}

/** Extract permission IDs from a UserResponseDTO-shaped object. */
export function extractPermissionIds(user) {
  if (!user) return [];
  if (Array.isArray(user.permissionIds)) {
    return user.permissionIds.map(Number).filter((id) => !Number.isNaN(id));
  }
  const extras = user.additionalPermissions || user.permissions;
  if (!Array.isArray(extras)) return [];
  return extras
    .map((p) => (typeof p === 'object' && p !== null ? p.id : p))
    .map(Number)
    .filter((id) => !Number.isNaN(id));
}

/** Map a user entity into the shared account form shape (no password). */
export function mapUserToForm(user) {
  const roleId =
    typeof user?.role === 'object' && user.role !== null
      ? user.role.id
      : user?.roleId ?? '';
  const active =
    typeof user?.active === 'boolean'
      ? user.active
      : typeof user?.isActive === 'boolean'
        ? user.isActive
        : true;

  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    roleId: roleId != null && roleId !== '' ? String(roleId) : '',
    position: user?.position || '',
    active,
    permissionIds: extractPermissionIds(user),
  };
}

/**
 * Maps axios error to user-facing message (400 / 403 / 409).
 */
export function mapCreateUserError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const msg =
    (typeof data === 'object' && data !== null && (data.message || data.error)) ||
    err?.message ||
    'Request failed';

  if (status === 409) {
    return typeof msg === 'string' && msg.length < 200
      ? msg
      : 'This email is already registered. Use a different email.';
  }
  if (status === 403) {
    return typeof msg === 'string' && msg.length < 200
      ? msg
      : 'You are not allowed to create a user with this role.';
  }
  if (status === 400) {
    return typeof msg === 'string' ? msg : 'Invalid data. Check all required fields.';
  }
  return typeof msg === 'string' ? msg : 'Failed to create user';
}

export function mapUpdateUserError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const msg =
    (typeof data === 'object' && data !== null && (data.message || data.error)) ||
    err?.message ||
    'Request failed';

  if (status === 409) {
    return typeof msg === 'string' && msg.length < 200
      ? msg
      : 'This email is already registered. Use a different email.';
  }
  if (status === 403) {
    return typeof msg === 'string' && msg.length < 200
      ? msg
      : 'Only a System Administrator can update users.';
  }
  if (status === 404) {
    return typeof msg === 'string' && msg.length < 200 ? msg : 'User not found.';
  }
  if (status === 400) {
    return typeof msg === 'string' ? msg : 'Invalid data. Check all required fields.';
  }
  return typeof msg === 'string' ? msg : 'Failed to update user';
}
